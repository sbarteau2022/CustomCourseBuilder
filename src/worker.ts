/**
 * customcoursebuilder — read-only HTTP API over the built courses.
 *
 * Imports the same TS course sources `src/build.ts` compiles to
 * dist/courses/*.json, so the Worker never depends on that gitignored
 * build output being present at deploy time — it builds the JSON itself,
 * in-memory, from the checked-in source of truth.
 *
 * Routes:
 *   GET /                -> service info
 *   GET /courses         -> summary list of all courses
 *   GET /courses/:id     -> full course JSON
 */
import { aiEngineerStack } from "../courses/ai-engineer-stack/course.ts";
import { aiEngineerCurriculumCourse } from "../courses/ai-engineer-curriculum/course.ts";
import type { Course } from "./types/course.ts";

const courses: Course[] = [aiEngineerStack, aiEngineerCurriculumCourse];
const byId = new Map(courses.map((c) => [c.id, c]));

const CORS_HEADERS = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, OPTIONS",
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body, null, 2), {
    status,
    headers: { "content-type": "application/json", ...CORS_HEADERS },
  });
}

export default {
  async fetch(request: Request): Promise<Response> {
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }
    if (request.method !== "GET") {
      return json({ error: "method not allowed" }, 405);
    }

    const url = new URL(request.url);
    const parts = url.pathname.split("/").filter(Boolean);

    if (parts.length === 0) {
      return json({
        service: "customcoursebuilder",
        routes: ["/courses", "/courses/:id"],
      });
    }

    if (parts[0] === "courses") {
      if (parts.length === 1) {
        return json(
          courses.map((c) => ({
            id: c.id,
            title: c.title,
            version: c.version,
            durationMonths: c.durationMonths,
            unitCount: c.units.length,
          })),
        );
      }
      const id = parts[1];
      const course = id === undefined ? undefined : byId.get(id);
      if (!course) {
        return json({ error: `unknown course id: ${id}` }, 404);
      }
      return json(course);
    }

    return json({ error: "not found" }, 404);
  },
};
