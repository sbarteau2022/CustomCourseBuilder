/**
 * Compile course definitions to JSON artifacts under dist/.
 * The JSON is what downstream consumers (Elle, the worker, any frontend)
 * ingest; the TS source is the authoring format, type-checked on build.
 *
 * Run: npm run build
 */
import { mkdir, writeFile } from "node:fs/promises";
import { validateCourse } from "./validate.ts";
import { aiEngineerStack } from "../courses/ai-engineer-stack/course.ts";
import { aiEngineerCurriculumCourse } from "../courses/ai-engineer-curriculum/course.ts";

// ai-engineer-curriculum/course.ts is GENERATED (see
// src/generate-course-from-curriculum.ts) from curriculum/ai-engineer/ —
// regenerate it after landing a new course's materials, then this build
// step picks up the refreshed file like any other checked-in course.
const courses = [aiEngineerStack, aiEngineerCurriculumCourse];

await mkdir("dist/courses", { recursive: true });

for (const course of courses) {
  const errors = validateCourse(course);
  if (errors.length > 0) {
    console.error(`${course.id}: ${errors.length} validation error(s):`);
    for (const e of errors) console.error(`  - ${e}`);
    process.exit(1);
  }
  const outPath = `dist/courses/${course.id}.json`;
  await writeFile(outPath, JSON.stringify(course, null, 2) + "\n");
  console.log(`wrote ${outPath}`);
}
