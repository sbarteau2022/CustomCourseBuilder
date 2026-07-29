/**
 * Bridge: turn an authored Curriculum (curriculum.ts + its dispatched
 * markdown materials) into a Course the existing runtime already knows
 * how to run — enroll, log, brief, seal, complete, the whole engine and
 * Elle's edu_* tools operate on Course/Unit, not on Curriculum/CourseSpec.
 *
 * One Unit per ModulePacket that has landed materials. Only packets with
 * an accepted materials file are included, so the generated course grows
 * exactly as the dispatch fan-out lands new tiers — regenerate after each
 * course's materials are committed (see curriculum/ai-engineer/dispatch/).
 *
 * Extraction is best-effort against the authoring template every
 * dispatched packet follows (see DISPATCH.md's packet contract and the
 * AIE-102-M03 reference exemplar): a header block, "## Elle pacing
 * notes", and "## Three-tier reading" with bolded Tier 1/2/3 bullets.
 * Where extraction fails for a field, a grounded fallback (built from
 * the CourseSpec, never empty boilerplate) is used instead of erroring.
 *
 * Run: node --experimental-strip-types src/generate-course-from-curriculum.ts
 */
import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";
import type {
  AdaptationContract,
  AdaptationSignal,
  Course,
  Phase,
  Pillars,
  ThreeTierReading,
  Track,
  TrackId,
  Unit,
} from "./types/course.ts";
import type { CourseSpec, Curriculum } from "./types/curriculum.ts";

const MATERIALS_ROOT = "curriculum/ai-engineer/materials";
const WEEKS_PER_MONTH = 4.33;

// Only four tiers exist; TrackId only has 5 letters (shared with the other
// course's schema) — spend four of them on the tiers rather than widen a
// type shared across the runtime.
const TIER_TRACK: Record<CourseSpec["tier"], TrackId> = {
  foundation: "A",
  core: "B",
  specialization: "C",
  capstone: "D",
};
const TIER_COLOR: Record<CourseSpec["tier"], string> = {
  foundation: "#185FA5",
  core: "#0F6E56",
  specialization: "#854F0B",
  capstone: "#993556",
};
const TIER_LABEL: Record<CourseSpec["tier"], string> = {
  foundation: "Foundations",
  core: "Core",
  specialization: "Specialization",
  capstone: "Capstone",
};

async function materialsPathFor(course: CourseSpec, packetId: string): Promise<string | null> {
  const path = join(MATERIALS_ROOT, course.code, `${packetId}.md`);
  try {
    await readFile(path, "utf8");
    return path;
  } catch {
    return null;
  }
}

function extractBetween(text: string, startMarker: string, endMarkers: string[]): string | null {
  const start = text.indexOf(startMarker);
  if (start === -1) return null;
  const from = start + startMarker.length;
  let end = text.length;
  for (const m of endMarkers) {
    const idx = text.indexOf(m, from);
    if (idx !== -1 && idx < end) end = idx;
  }
  return text.slice(from, end).trim();
}

function extractSummary(md: string, packet: { title: string }, course: CourseSpec): string {
  const sits = md.match(/\*\*Sits in the descent:\*\*\s*([^\n]+)/);
  if (sits?.[1]) return sits[1].trim().replace(/^the /i, "The ");
  return `${packet.title} — one module of ${course.title}.`;
}

function extractThreeTier(md: string, packet: { title: string }, course: CourseSpec): ThreeTierReading {
  const section = extractBetween(md, "## Three-tier reading", ["\n---", "\n## "]);
  if (section) {
    const t1 = section.match(/Tier 1[^*]*\*\*\.?\s*([\s\S]*?)(?=- \*\*Tier 2|$)/);
    const t2 = section.match(/Tier 2[^*]*\*\*\.?\s*([\s\S]*?)(?=- \*\*Tier 3|$)/);
    const t3 = section.match(/Tier 3[^*]*\*\*\.?\s*([\s\S]*?)$/);
    const clean = (s?: string) => s?.replace(/\n+/g, " ").trim().replace(/\s+/g, " ");
    const materialGround = clean(t1?.[1]);
    const observerReading = clean(t2?.[1]);
    const sitWithThis = clean(t3?.[1]);
    if (materialGround && observerReading && sitWithThis && materialGround.length > 40) {
      return { materialGround, observerReading, sitWithThis };
    }
  }
  // Grounded fallback: the course-level ethics thread, never boilerplate.
  return {
    materialGround: `${course.ethicsThread} (module: ${packet.title}.)`,
    observerReading: course.ethicsThread,
    sitWithThis: `Applied to ${packet.title}: ${course.ethicsThread.split("Tier 3:")[1] ?? course.ethicsThread}`,
  };
}

function extractPacing(md: string, course: CourseSpec): { reroute: string; accelerate: string; reinforce: string; watchFor: AdaptationSignal[] } {
  const section = extractBetween(md, "## Elle pacing notes", ["\n---", "\n## "]) ?? "";
  const reroutes = [...section.matchAll(/\*\*Reroute:\*\*\s*([^*\n]+(?:\n(?!\s*-\s*\*\*)[^*\n]*)*)/g)]
    .map((m) => m[1]?.trim())
    .filter((x): x is string => !!x && x.length > 10);
  const accelerates = [...section.matchAll(/\*\*Accelerate[^*]*\*\*\s*([^\n]+)/g)]
    .map((m) => m[1]?.trim())
    .filter((x): x is string => !!x && x.length > 10);
  const holds = [...section.matchAll(/Do NOT accelerate[^.\n]*\.[^\n]*/gi)].map((m) => m[0]);

  const reroute =
    reroutes.length > 0
      ? reroutes.slice(0, 2).join(" ")
      : "If blocked two sessions on the same wall, switch modality — worked example first, then return to the lab.";
  const accelerate =
    accelerates.length > 0
      ? accelerates.slice(0, 2).join(" ")
      : "Clean predictions plus correct reasoning on the first labs may skip straight to the module assessment.";
  const reinforce =
    holds.length > 0
      ? `Hold before advancing: ${holds.slice(0, 2).join(" ")}`
      : "Re-anchor in the module's own worked examples before adding new material; struggle here is expected to be productive, not blocked.";

  const has = (kw: RegExp) => kw.test(section);
  const watchFor: AdaptationSignal[] = [];
  if (has(/blocked/i) || reroutes.length > 0) watchFor.push("struggle-blocked");
  if (has(/productive/i)) watchFor.push("struggle-productive");
  if (has(/disengag/i)) watchFor.push("disengagement");
  if (has(/pace-behind|behind pace|falling behind/i)) watchFor.push("pace-behind");
  if (has(/accelerate/i) || accelerates.length > 0) watchFor.push("pace-ahead", "mastery-early");
  watchFor.push("shallow-completion");
  const uniq = [...new Set(watchFor)];
  return { reroute, accelerate, reinforce, watchFor: uniq.length > 0 ? uniq : ["struggle-blocked", "struggle-productive", "shallow-completion"] };
}

function extractPillars(md: string, packet: { title: string; hours: number }): Pillars {
  const lessonsSection = extractBetween(md, "## Lessons", ["\n## "]) ?? "";
  const labsSection = extractBetween(md, "## Labs", ["\n## "]) ?? "";
  const lessonTitles = [...lessonsSection.matchAll(/^\d+\.\s+\*\*([^*]+)\*\*/gm)].map((m) => m[1]?.trim());
  const labTitles = [...labsSection.matchAll(/###\s*Lab[^\n—-]*[—-]\s*([^\n]+)/g)].map((m) => m[1]?.trim());

  const structure =
    lessonTitles.length > 0
      ? `Map the module before building: ${lessonTitles.filter(Boolean).join("; ")}.`
      : `Map ${packet.title}'s structure before starting any lab.`;
  const readingReasoning =
    "Read each lesson's worked example and named misconceptions; predict what the mechanism does before reading the explanation.";
  const testing =
    "Run every lab's Predict step on paper, before Build; verify against the provided tests, not against whether the program merely runs.";
  const building =
    labTitles.length > 0
      ? `Complete the module's labs (${labTitles.filter(Boolean).join("; ")}) and the module assessment.`
      : `Complete the module's labs and its assessment — starter, solution, and tests, in that order of use.`;

  return { structure, readingReasoning, testing, building };
}

async function buildUnit(course: CourseSpec, packetId: string, packetTitle: string, packetHours: number, prereqIds: string[]): Promise<Unit | null> {
  const path = await materialsPathFor(course, packetId);
  if (!path) return null;
  const md = await readFile(path, "utf8");

  const pacing = extractPacing(md, course);
  const [min, max] = course.paceHoursPerWeek;
  const avgPace = (min + max) / 2;
  const targetWeeks = Math.max(1, Math.round(packetHours / avgPace));

  const adaptation: AdaptationContract = {
    pacing: { minHoursPerWeek: min, targetHoursPerWeek: Math.round((min + max) / 2), maxHoursPerWeek: max, targetWeeks },
    watchFor: pacing.watchFor,
    moves: { accelerate: pacing.accelerate, reinforce: pacing.reinforce, reroute: pacing.reroute },
  };

  const unit: Unit = {
    id: packetId,
    track: TIER_TRACK[course.tier],
    title: packetTitle,
    summary: extractSummary(md, { title: packetTitle }, course),
    credentials: [
      {
        name: `${course.title} — ${packetTitle}`,
        provider: "The AI Engineer Curriculum (first-party)",
        kind: "course",
        freeToAudit: true,
        paidCostUSD: 0,
      },
    ],
    prerequisites: prereqIds,
    buildThread: `${course.code}: ${course.outpaces}`.slice(0, 400),
    pillars: extractPillars(md, { title: packetTitle, hours: packetHours }),
    tiers: extractThreeTier(md, { title: packetTitle }, course),
    adaptation,
  };
  return unit;
}

export async function generateCourse(curriculum: Curriculum): Promise<Course> {
  const units: Unit[] = [];
  const tierUnitIds: Record<string, string[]> = {};

  for (const course of curriculum.courses) {
    let materialsDir: string[] = [];
    try {
      materialsDir = await readdir(join(MATERIALS_ROOT, course.code));
    } catch {
      continue; // no materials landed for this course yet
    }
    const available = new Set(materialsDir.filter((f) => f.endsWith(".md") && !f.startsWith("_")).map((f) => f.replace(/\.md$/, "")));

    let prevInCourse: string | null = null;
    for (const packet of course.modules) {
      if (!available.has(packet.id)) continue;
      const prereqIds: string[] = [];
      if (prevInCourse) {
        prereqIds.push(prevInCourse);
      } else {
        // First landed packet of this course: depend on the last landed
        // packet of each prerequisite course (if that course has materials).
        for (const prereqCode of course.prerequisites) {
          const prereqCourse = curriculum.courses.find((c) => c.code === prereqCode);
          if (!prereqCourse) continue;
          const lastId = [...prereqCourse.modules].reverse().find((m) => tierUnitIds[prereqCourse.code]?.includes(m.id));
          if (lastId) prereqIds.push(lastId.id);
        }
      }
      const unit = await buildUnit(course, packet.id, packet.title, packet.hours, prereqIds);
      if (!unit) continue;
      units.push(unit);
      prevInCourse = packet.id;
      (tierUnitIds[course.code] ??= []).push(packet.id);
    }
  }

  if (units.length === 0) {
    throw new Error("no units generated — no course in the curriculum has landed materials yet");
  }

  const totalHours = units.reduce((n, u) => n + u.adaptation.pacing.targetWeeks * u.adaptation.pacing.targetHoursPerWeek, 0);
  const durationMonths = Math.max(1, Math.ceil(totalHours / ((8 + 12) / 2) / WEEKS_PER_MONTH));

  const tiersPresent = [...new Set(curriculum.courses.filter((c) => tierUnitIds[c.code]?.length).map((c) => c.tier))];
  const phases: Phase[] = tiersPresent.map((tier, i) => {
    const tierCourses = curriculum.courses.filter((c) => c.tier === tier && tierUnitIds[c.code]?.length);
    const unitIds = tierCourses.flatMap((c) => tierUnitIds[c.code] ?? []);
    const start = i === 0 ? 1 : Math.round((durationMonths / tiersPresent.length) * i) + 1;
    const end = i === tiersPresent.length - 1 ? durationMonths : Math.round((durationMonths / tiersPresent.length) * (i + 1));
    return {
      id: `p-${tier}`,
      title: `${TIER_LABEL[tier]} — ${tierCourses.map((c) => c.code).join(", ")}`,
      months: [Math.min(start, end), Math.max(start, end)],
      theme: `${TIER_LABEL[tier]} tier of the AI Engineer Curriculum: ${tierCourses.map((c) => c.title).join("; ")}.`,
      unitIds,
    };
  });

  const tracks: Track[] = tiersPresent.map((tier) => ({
    id: TIER_TRACK[tier],
    name: TIER_LABEL[tier],
    focus: curriculum.courses.filter((c) => c.tier === tier).map((c) => c.title).join(" · "),
    color: TIER_COLOR[tier],
  }));

  const course: Course = {
    id: curriculum.id,
    title: curriculum.title,
    version: curriculum.version,
    mission: curriculum.thesis,
    durationMonths,
    tracks,
    phases,
    units,
    spines: [
      {
        id: "ethics",
        title: "The Ethics Spine — Three-Tier Readings",
        cadence: "Weekly, every week the curriculum runs. Non-optional.",
        practice:
          "Each unit ships its own subject-specific three-tier reading — material ground, what the field suppresses, and the question the learner cannot unknow. The learner seals a reading; the corpus of sealed readings is the credential no certificate pile can match.",
      },
      {
        id: "build",
        title: "The Build Spine — Descend, Build, Re-ascend",
        cadence: "Continuous — every module's Building pillar.",
        practice:
          "Every module descends below its abstraction, builds the thing at the substrate by hand, and re-ascends to command the high-level tool. The judgment trail — not a program that runs — is the certification artifact.",
      },
      {
        id: "witness",
        title: "The Witness Spine — Elle Watching the Learning",
        cadence: "Every session; reviewed at each phase boundary.",
        practice:
          "Elle logs pacing signals against each unit's adaptation contract, extracted from that module's own authored pacing notes, and executes the contracted move — accelerate, reinforce, reroute.",
      },
    ],
    credentialModel: {
      sealedReading:
        "One three-tier observer reading (material ground / what the field suppresses / sit-with-this) sealed per module, plus a course-close synthesis per completed course.",
      corpusSize: units.length + curriculum.courses.filter((c) => tierUnitIds[c.code]?.length).length,
      demonstrates:
        "Structural understanding at a depth no exam measures — this program's version of the alternative credentialing model: the sealed corpus, not the certificate, is what a learner has actually earned.",
    },
    costModel: {
      minUSD: 0,
      maxUSD: 0,
      note: "First-party and free: every module is authored content, not a mapped external credential. Hours are the program's own estimates at the stated pace envelope per course.",
    },
  };

  return course;
}

const isMain = process.argv[1]?.endsWith("generate-course-from-curriculum.ts");
if (isMain) {
  const { writeFile, mkdir } = await import("node:fs/promises");
  const { aiEngineerCurriculum } = await import("../curriculum/ai-engineer/curriculum.ts");
  const course = await generateCourse(aiEngineerCurriculum);
  await mkdir("courses/ai-engineer-curriculum", { recursive: true });
  const ts = `/**\n * GENERATED by src/generate-course-from-curriculum.ts from\n * curriculum/ai-engineer/curriculum.ts + curriculum/ai-engineer/materials/.\n * Do not hand-edit — regenerate: node --experimental-strip-types src/generate-course-from-curriculum.ts\n */\nimport type { Course } from "../../src/types/course.ts";\n\nexport const aiEngineerCurriculumCourse: Course = ${JSON.stringify(course, null, 2)};\n`;
  await writeFile("courses/ai-engineer-curriculum/course.ts", ts);
  console.log(
    `generated courses/ai-engineer-curriculum/course.ts: ${course.units.length} units, ${course.phases.length} phase(s), ${course.tracks.length} tier(s), ${course.durationMonths} months`,
  );
}
