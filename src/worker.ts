/// <reference types="@cloudflare/workers-types" />
/**
 * customcoursebuilder — ingester, maintainer, and read API for course data.
 *
 * The checked-in TS course sources (the same ones `src/build.ts` compiles
 * to dist/courses/*.json) are this Worker's source of truth. It ingests
 * them into its own D1 database (binding `DB`) and serves reads from
 * there — elle-worker (and anything else) reads course data by calling
 * this API instead of vendoring a static JSON copy that goes stale.
 *
 * Every GET route self-heals: if a course is missing from D1, or the
 * stored row's version doesn't match what's currently bundled in this
 * deploy, it's re-ingested before the read runs — so a fresh deploy
 * with new/updated course content stays in sync automatically, with no
 * separate manual step required. POST /ingest forces a re-ingest of
 * every course regardless of version, for explicit maintenance (e.g.
 * right after a deploy, or from a cron trigger).
 *
 * Routes:
 *   GET  /                -> service info
 *   GET  /courses         -> summary list of all courses (auto-ingests as needed)
 *   GET  /courses/:id     -> full course JSON (auto-ingests as needed)
 *   POST /ingest          -> force re-ingest every course; returns a summary
 */
import { aiEngineerStack } from "../courses/ai-engineer-stack/course.ts";
import { aiEngineerCurriculumCourse } from "../courses/ai-engineer-curriculum/course.ts";
import type { Course } from "./types/course.ts";

interface Env {
  DB: D1Database;
}

const courses: Course[] = [aiEngineerStack, aiEngineerCurriculumCourse];
const byId = new Map(courses.map((c) => [c.id, c]));

const CORS_HEADERS = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, POST, OPTIONS",
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body, null, 2), {
    status,
    headers: { "content-type": "application/json", ...CORS_HEADERS },
  });
}

async function ensureSchema(db: D1Database): Promise<void> {
  await db.prepare(
    `CREATE TABLE IF NOT EXISTS courses (
      id TEXT PRIMARY KEY,
      version TEXT NOT NULL,
      title TEXT NOT NULL,
      unit_count INTEGER NOT NULL,
      duration_months INTEGER NOT NULL,
      data_json TEXT NOT NULL,
      ingested_at INTEGER NOT NULL)`,
  ).run();
}

async function ingestOne(db: D1Database, course: Course): Promise<void> {
  await db.prepare(
    `INSERT INTO courses (id, version, title, unit_count, duration_months, data_json, ingested_at)
     VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)
     ON CONFLICT(id) DO UPDATE SET
       version = ?2, title = ?3, unit_count = ?4, duration_months = ?5,
       data_json = ?6, ingested_at = ?7`,
  ).bind(
    course.id,
    course.version,
    course.title,
    course.units.length,
    course.durationMonths,
    JSON.stringify(course),
    Date.now(),
  ).run();
}

/** Ingest every bundled course unconditionally. Used by POST /ingest. */
async function ingestAll(db: D1Database): Promise<{ id: string; version: string; unitCount: number }[]> {
  await ensureSchema(db);
  const summary = [];
  for (const course of courses) {
    await ingestOne(db, course);
    summary.push({ id: course.id, version: course.version, unitCount: course.units.length });
  }
  return summary;
}

/** Ingest a single course only if it's missing from D1 or its stored version is stale. */
async function ensureIngested(db: D1Database, courseId: string): Promise<void> {
  const course = byId.get(courseId);
  if (!course) return;
  await ensureSchema(db);
  const row = await db.prepare("SELECT version FROM courses WHERE id = ?")
    .bind(courseId).first() as { version?: string } | null;
  if (row?.version === course.version) return;
  await ingestOne(db, course);
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    const url = new URL(request.url);
    const parts = url.pathname.split("/").filter(Boolean);

    if (request.method === "POST" && parts[0] === "ingest") {
      const summary = await ingestAll(env.DB);
      return json({ ingestedAt: new Date().toISOString(), courses: summary });
    }

    if (request.method !== "GET") {
      return json({ error: "method not allowed" }, 405);
    }

    if (parts.length === 0) {
      return json({
        service: "customcoursebuilder",
        routes: ["GET /courses", "GET /courses/:id", "POST /ingest"],
      });
    }

    if (parts[0] === "courses") {
      if (parts.length === 1) {
        for (const course of courses) await ensureIngested(env.DB, course.id);
        const rows = await env.DB.prepare(
          "SELECT id, title, version, duration_months AS durationMonths, unit_count AS unitCount FROM courses ORDER BY id",
        ).all();
        return json(rows.results);
      }
      const id = parts[1];
      if (id === undefined || !byId.has(id)) {
        return json({ error: `unknown course id: ${id}` }, 404);
      }
      await ensureIngested(env.DB, id);
      const row = await env.DB.prepare("SELECT data_json FROM courses WHERE id = ?")
        .bind(id).first() as { data_json?: string } | null;
      if (!row?.data_json) {
        return json({ error: `course ingested but row missing: ${id}` }, 500);
      }
      return new Response(row.data_json, {
        status: 200,
        headers: { "content-type": "application/json", ...CORS_HEADERS },
      });
    }

    return json({ error: "not found" }, 404);
  },
};
