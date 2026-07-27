/**
 * File-backed persistence: one JSON file per learner under state/,
 * mirroring the ai-coding-101 convention. Course definitions load from
 * the built JSON artifact, falling back to the TS source so the CLI
 * works in a fresh checkout before the first build.
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { Course } from "../types/course.ts";
import type { LearnerState } from "./state.ts";

const STATE_DIR = "state";

function statePath(learnerId: string): string {
  if (!/^[a-z0-9][a-z0-9-_]*$/i.test(learnerId)) {
    throw new Error(`learner id must be alphanumeric/dash/underscore, got: ${learnerId}`);
  }
  return join(STATE_DIR, `${learnerId}.json`);
}

export async function loadState(learnerId: string): Promise<LearnerState | null> {
  try {
    return JSON.parse(await readFile(statePath(learnerId), "utf8")) as LearnerState;
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw err;
  }
}

export async function saveState(state: LearnerState): Promise<void> {
  await mkdir(STATE_DIR, { recursive: true });
  await writeFile(statePath(state.learnerId), JSON.stringify(state, null, 2) + "\n");
}

export async function loadCourse(courseId: string): Promise<Course> {
  try {
    return JSON.parse(await readFile(join("dist", "courses", `${courseId}.json`), "utf8")) as Course;
  } catch {
    const mod = await import(`../../courses/${courseId}/course.ts`);
    const course = Object.values(mod).find(
      (v): v is Course => typeof v === "object" && v !== null && (v as Course).id === courseId,
    );
    if (!course) throw new Error(`course not found: ${courseId} (run npm run build, or check the id)`);
    return course;
  }
}
