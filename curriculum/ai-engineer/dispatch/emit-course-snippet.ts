/**
 * Emit the embedded-course-data snippet for dispatch-course.js.
 *
 * Workflow scripts run sandboxed with NO filesystem or Node API access, so
 * they cannot `import` curriculum.ts directly — the course data a dispatch
 * run needs (descentArc, outpaces, ethicsThread, prereqNote, toolchain,
 * modules[]) has to be embedded as a literal in the script. This tool is
 * the single source of truth for that embedding: it reads the real
 * curriculum.ts and prints the JS object literal to paste into
 * dispatch-course.js's COURSES map, so the two can never silently drift.
 *
 * A field not present in curriculum.ts (prereqNote, toolchain — free-text
 * context a dispatched agent needs but the typed manifest doesn't carry)
 * is filled from PACKET_CONTEXT below; add an entry there for any new
 * course before dispatching it.
 *
 * Usage: node --experimental-strip-types curriculum/ai-engineer/dispatch/emit-course-snippet.ts AIE-201
 */
import { aiEngineerCurriculum } from "../curriculum.ts";

// Free-text dispatch context per course — not in the typed manifest because
// it's authoring guidance, not curriculum data. Add an entry before
// dispatching a course that isn't here yet.
const PACKET_CONTEXT: Record<string, { prereqNote: string; toolchain: string; packetFocus: Record<string, string> }> = {
  "AIE-201": {
    prereqNote:
      "Prereq AIE-103 (math as instruments) and AIE-110 (data structures/scale). Learners can derive gradients by hand, compute in NumPy, and reason about algorithmic cost. This is the first ML course: no deep learning yet (AIE-202).",
    toolchain: "Python 3.12+, NumPy, pandas, scikit-learn (for comparison only — everything is built from scratch first), pytest, matplotlib.",
    packetFocus: {},
  },
  // Add AIE-202, AIE-203, AIE-204, ... here before dispatching them.
};

const code = process.argv[2];
if (!code) {
  console.error("usage: emit-course-snippet.ts <COURSE-CODE>  (e.g. AIE-201)");
  process.exit(1);
}
const course = aiEngineerCurriculum.courses.find((c) => c.code === code);
if (!course) {
  console.error(`unknown course code: ${code}`);
  process.exit(1);
}
const ctx = PACKET_CONTEXT[code];
if (!ctx) {
  console.error(`no PACKET_CONTEXT entry for ${code} — add one to emit-course-snippet.ts first (prereqNote, toolchain).`);
  process.exit(1);
}

const esc = (s: string) => JSON.stringify(s);

const lines: string[] = [];
lines.push(`  '${course.code}': {`);
lines.push(`    code: '${course.code}', title: ${esc(course.title)}, tier: '${course.tier}', durability: '${course.durability}',`);
lines.push(`    descentArc: ${esc(course.descentArc)},`);
lines.push(`    outpaces: ${esc(course.outpaces)},`);
lines.push(`    ethicsThread: ${esc(course.ethicsThread)},`);
lines.push(`    prereqNote: ${esc(ctx.prereqNote)},`);
lines.push(`    toolchain: ${esc(ctx.toolchain)},`);
lines.push(`    packets: [`);
for (const m of course.modules) {
  const focus = ctx.packetFocus[m.id];
  if (!focus) {
    console.error(`warning: no packetFocus for ${m.id} — using its title as a weak placeholder; add real dispatch guidance before running`);
  }
  lines.push(`      { id: ${esc(m.id)}, title: ${esc(m.title)}, hours: ${m.hours}, focus: ${esc(focus ?? m.title)} },`);
}
lines.push(`    ],`);
lines.push(`  },`);

console.log(lines.join("\n"));
