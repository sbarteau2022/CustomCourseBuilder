/**
 * Validate a Curriculum: the invariants the manifest, the syllabi, and
 * the material-design dispatch are all held to.
 *
 * Run: node --experimental-strip-types src/validate-curriculum.ts
 */
import { existsSync } from "node:fs";
import { join } from "node:path";
import type { Curriculum } from "./types/curriculum.ts";

export function validateCurriculum(curriculum: Curriculum, syllabiDir?: string): string[] {
  const errors: string[] = [];
  const codes = new Set<string>();

  let weightSum = 0;
  let hourSum = 0;
  for (const course of curriculum.courses) {
    if (codes.has(course.code)) errors.push(`duplicate course code: ${course.code}`);
    codes.add(course.code);
    weightSum += course.weightPercent;
    hourSum += course.hours;

    const aw = course.assessmentWeights.reduce((n, w) => n + w.percent, 0);
    if (aw !== 100) errors.push(`${course.code}: assessment weights sum to ${aw}, must be 100`);
    if (course.modules.length === 0) errors.push(`${course.code}: no modules`);
    if (course.outcomes.length === 0) errors.push(`${course.code}: no outcomes`);

    // Philosophy is first-class: a course with no descent arc or a
    // placeholder ethics thread does not pass.
    if (course.descentArc.trim().length < 60) {
      errors.push(`${course.code}: descentArc is missing or too thin — the philosophy applies to every course`);
    }
    if (course.ethicsThread.trim().length < 60) {
      errors.push(`${course.code}: ethicsThread is missing or too thin`);
    }

    const [min, max] = course.paceHoursPerWeek;
    if (!(min > 0 && min <= max)) errors.push(`${course.code}: pace envelope must satisfy 0 < min <= max`);

    // Module ids are prefixed with the course code and unique.
    const modIds = new Set<string>();
    for (const m of course.modules) {
      if (!m.id.startsWith(course.code + "-M")) errors.push(`${course.code}: module ${m.id} is misprefixed`);
      if (modIds.has(m.id)) errors.push(`${course.code}: duplicate module id ${m.id}`);
      modIds.add(m.id);
      if (m.hours <= 0) errors.push(`${m.id}: hours must be positive`);
    }

    if (syllabiDir) {
      const path = join(syllabiDir, `${course.code}.md`);
      if (!existsSync(path)) errors.push(`${course.code}: missing syllabus ${path}`);
    }
  }

  if (weightSum !== 100) errors.push(`course weights sum to ${weightSum}, must be 100`);
  if (hourSum !== curriculum.totalHours) {
    errors.push(`course hours sum to ${hourSum}, but totalHours is ${curriculum.totalHours}`);
  }

  // Prerequisite graph: known codes, and acyclic.
  for (const course of curriculum.courses) {
    for (const p of [...course.prerequisites, ...course.corequisites]) {
      if (!codes.has(p)) errors.push(`${course.code}: unknown prereq/coreq ${p}`);
    }
  }
  const cycle = findCycle(curriculum);
  if (cycle) errors.push(`prerequisite cycle: ${cycle.join(" → ")}`);

  if (curriculum.philosophy.length < 3) {
    errors.push(`curriculum has fewer than 3 named principles — the philosophy is the spine`);
  }

  return errors;
}

/** DFS cycle detection over prerequisites only (coreqs are concurrent, not ordered). */
function findCycle(curriculum: Curriculum): string[] | null {
  const prereqs = new Map(curriculum.courses.map((c) => [c.code, c.prerequisites]));
  const state = new Map<string, 0 | 1 | 2>(); // 0 unseen, 1 on-stack, 2 done
  const stack: string[] = [];

  function dfs(code: string): string[] | null {
    state.set(code, 1);
    stack.push(code);
    for (const next of prereqs.get(code) ?? []) {
      const s = state.get(next) ?? 0;
      if (s === 1) return [...stack.slice(stack.indexOf(next)), next];
      if (s === 0) {
        const c = dfs(next);
        if (c) return c;
      }
    }
    stack.pop();
    state.set(code, 2);
    return null;
  }

  for (const c of curriculum.courses) {
    if ((state.get(c.code) ?? 0) === 0) {
      const cycle = dfs(c.code);
      if (cycle) return cycle;
    }
  }
  return null;
}

const isMain = process.argv[1]?.endsWith("validate-curriculum.ts");
if (isMain) {
  const { aiEngineerCurriculum } = await import("../curriculum/ai-engineer/curriculum.ts");
  const errors = validateCurriculum(aiEngineerCurriculum, "curriculum/ai-engineer/syllabi");
  if (errors.length > 0) {
    console.error(`${errors.length} validation error(s):`);
    for (const e of errors) console.error(`  - ${e}`);
    process.exit(1);
  }
  const c = aiEngineerCurriculum;
  const modules = c.courses.reduce((n, co) => n + co.modules.length, 0);
  console.log(
    `${c.id} valid: ${c.courses.length} courses, ${modules} dispatchable module packets, ` +
      `${c.totalHours}h, weights sum to 100, ${c.philosophy.length} principles, prereq graph acyclic`,
  );
}
