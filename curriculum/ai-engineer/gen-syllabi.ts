/**
 * Generate one syllabus scaffold per course from the manifest, so every
 * course starts from a real, consistent document that a material-design
 * agent expands (rather than a blank page). Re-runnable; it overwrites
 * the scaffold sections but is designed so hand-authored detail added
 * below the marker is preserved on regeneration.
 *
 * Run: node --experimental-strip-types curriculum/ai-engineer/gen-syllabi.ts
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { aiEngineerCurriculum as C } from "./curriculum.ts";

const DIR = "curriculum/ai-engineer/syllabi";
const MARKER = "<!-- BELOW THIS LINE: hand-authored / agent-authored detail, preserved on regen -->";

await mkdir(DIR, { recursive: true });

for (const course of C.courses) {
  const path = join(DIR, `${course.code}.md`);

  const scaffold = [
    `# ${course.code} — ${course.title}`,
    ``,
    `**Tier:** ${course.tier} · **Program weight:** ${course.weightPercent}% · **Hours:** ${course.hours} · ` +
      `**Durability:** ${course.durability} · **Pace:** ${course.paceHoursPerWeek[0]}–${course.paceHoursPerWeek[1]} hrs/wk`,
    ``,
    course.prerequisites.length ? `**Prerequisites:** ${course.prerequisites.join(", ")}` : `**Prerequisites:** none`,
    course.corequisites.length ? `**Co-requisites:** ${course.corequisites.join(", ")}` : ``,
    ``,
    `## The descent arc`,
    ``,
    course.descentArc,
    ``,
    `## What outpaces the field`,
    ``,
    course.outpaces,
    ``,
    `## Outcomes — what the learner can DO`,
    ``,
    ...course.outcomes.map((o) => `- ${o}`),
    ``,
    `## Assessment (weights sum to 100)`,
    ``,
    `| Component | % | What it measures |`,
    `|---|---|---|`,
    ...course.assessmentWeights.map((w) => `| ${w.kind} | ${w.percent} | ${w.note} |`),
    ``,
    `## Modules — each is a dispatchable work packet (see DISPATCH.md)`,
    ``,
    `| Packet | Module | Hours |`,
    `|---|---|---|`,
    ...course.modules.map((m) => `| \`${m.id}\` | ${m.title} | ${m.hours} |`),
    ``,
    `## Ethics thread (the three-tier reading practice for this subject)`,
    ``,
    course.ethicsThread,
    ``,
    `---`,
    ``,
    `**Material-design status:** SCAFFOLD. Each module packet above awaits full lesson-level`,
    `authoring per the DISPATCH.md contract: lesson notes, labs (starter + solution + tests),`,
    `the module assessment with rubric, Elle/instructor pacing notes, and the module's`,
    `three-tier reading prompt.`,
    ``,
    MARKER,
    ``,
  ].join("\n");

  let preserved = "";
  try {
    const existing = await readFile(path, "utf8");
    const idx = existing.indexOf(MARKER);
    if (idx !== -1) preserved = existing.slice(idx + MARKER.length).replace(/^\n+/, "");
  } catch {
    /* new file */
  }

  await writeFile(path, scaffold + (preserved ? preserved : "") + (preserved.endsWith("\n") ? "" : "\n"));
  console.log(`wrote ${path}`);
}
