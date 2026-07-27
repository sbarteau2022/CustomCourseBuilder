/**
 * elle — the course runtime CLI.
 *
 *   elle enroll  <learner> [--course ai-engineer-stack]
 *   elle log     <learner> --unit <id> --minutes <n> [--note "..."] [--blocker "..."]
 *                          [--evidence pillar="artifact"]...
 *   elle seal    <learner> --kind weekly|unit-close|phase-synthesis|build-retro
 *                          [--unit <id>] [--phase <id>]
 *                          --tier1 "..." --tier2 "..." --tier3 "..."
 *   elle advise  <learner>          # detect signals, execute contracts, print moves
 *   elle brief   <learner>          # emit the session brief for Elle's conversational layer
 *   elle complete <learner> --unit <id>
 *   elle status  <learner>
 *   elle review  <learner> --phase <id>
 *   elle verify  <learner>          # verify the sealed-corpus hash chain
 *
 * Run via: npm run elle -- <command> ...
 */
import { PILLAR_KEYS, newLearnerState, type PillarKey, type ReadingKind } from "./runtime/state.ts";
import { sealReading, verifyChain } from "./runtime/seal.ts";
import {
  advise,
  availableUnits,
  completeUnit,
  currentMonth,
  phaseReview,
  recordSession,
  unitById,
} from "./runtime/engine.ts";
import { evidenceFraction } from "./runtime/signals.ts";
import { sessionBrief } from "./runtime/brief.ts";
import { loadCourse, loadState, saveState } from "./runtime/store.ts";

const DEFAULT_COURSE = "ai-engineer-stack";

interface Args {
  positional: string[];
  flags: Record<string, string[]>;
}

function parseArgs(argv: string[]): Args {
  const positional: string[] = [];
  const flags: Record<string, string[]> = {};
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i] as string;
    if (arg.startsWith("--")) {
      const key = arg.slice(2);
      const value = argv[i + 1];
      if (value === undefined || value.startsWith("--")) {
        flags[key] = [...(flags[key] ?? []), "true"];
      } else {
        flags[key] = [...(flags[key] ?? []), value];
        i++;
      }
    } else {
      positional.push(arg);
    }
  }
  return { positional, flags };
}

function flag(args: Args, key: string): string | undefined {
  return args.flags[key]?.at(-1);
}

function requireFlag(args: Args, key: string): string {
  const v = flag(args, key);
  if (v === undefined) fail(`missing required --${key}`);
  return v;
}

function fail(message: string): never {
  console.error(`elle: ${message}`);
  process.exit(1);
}

async function requireState(learnerId: string) {
  const state = await loadState(learnerId);
  if (!state) fail(`no state for learner "${learnerId}" — run: elle enroll ${learnerId}`);
  return state;
}

const [command, learnerId, ...rest] = process.argv.slice(2);
if (!command || !learnerId) {
  console.error("usage: elle <enroll|log|seal|advise|complete|status|review|verify> <learner> [flags]");
  process.exit(1);
}
const args = parseArgs(rest);
const now = new Date();

switch (command) {
  case "enroll": {
    const courseId = flag(args, "course") ?? DEFAULT_COURSE;
    const course = await loadCourse(courseId);
    const existing = await loadState(learnerId);
    if (existing) fail(`learner "${learnerId}" is already enrolled in ${existing.courseId}`);
    const state = newLearnerState(learnerId, course.id, course.version, now);
    await saveState(state);
    console.log(`enrolled ${learnerId} in ${course.title} (v${course.version})`);
    console.log(`month 1 begins now. First units:`);
    for (const u of availableUnits(course, state, now)) {
      console.log(`  - ${u.id}  ${u.title} [track ${u.track}]`);
    }
    break;
  }

  case "log": {
    const state = await requireState(learnerId);
    const course = await loadCourse(state.courseId);
    const unitId = requireFlag(args, "unit");
    const minutes = Number(requireFlag(args, "minutes"));
    if (!Number.isFinite(minutes) || minutes <= 0) fail("--minutes must be a positive number");
    const evidence = (args.flags["evidence"] ?? []).map((e) => {
      const eq = e.indexOf("=");
      if (eq < 1) fail(`--evidence must be pillar="artifact", got: ${e}`);
      const pillar = e.slice(0, eq) as PillarKey;
      if (!PILLAR_KEYS.includes(pillar)) {
        fail(`unknown pillar "${pillar}" (expected: ${PILLAR_KEYS.join(", ")})`);
      }
      return { pillar, artifact: e.slice(eq + 1) };
    });
    const record: Parameters<typeof recordSession>[2] = {
      unitId,
      at: now.toISOString(),
      minutes,
      ...(flag(args, "note") !== undefined ? { note: flag(args, "note") as string } : {}),
      ...(flag(args, "blocker") !== undefined ? { blocker: flag(args, "blocker") as string } : {}),
      ...(evidence.length > 0 ? { evidence } : {}),
    };
    const progress = recordSession(course, state, record);
    await saveState(state);
    const unit = unitById(course, unitId);
    console.log(
      `logged ${minutes}m on ${unitId} (${unit.title}) — evidence ${Math.round(evidenceFraction(progress) * 100)}%` +
        (record.blocker ? ` — blocker noted` : ""),
    );
    break;
  }

  case "seal": {
    const state = await requireState(learnerId);
    const kind = requireFlag(args, "kind") as ReadingKind;
    if (!["weekly", "unit-close", "phase-synthesis", "build-retro"].includes(kind)) {
      fail(`unknown reading kind: ${kind}`);
    }
    const reading = sealReading(
      state,
      {
        kind,
        ...(flag(args, "unit") !== undefined ? { unitId: flag(args, "unit") as string } : {}),
        ...(flag(args, "phase") !== undefined ? { phaseId: flag(args, "phase") as string } : {}),
        tier1MaterialGround: requireFlag(args, "tier1"),
        tier2ObserverReading: requireFlag(args, "tier2"),
        tier3SitWithThis: requireFlag(args, "tier3"),
      },
      now,
    );
    await saveState(state);
    console.log(`sealed reading #${reading.seq} (${kind}) — ${reading.hash.slice(0, 16)}…`);
    break;
  }

  case "advise": {
    const state = await requireState(learnerId);
    const course = await loadCourse(state.courseId);
    const chainIntact = verifyChain(state.sealedReadings).length === 0;
    const result = advise(course, state, now, chainIntact);
    await saveState(state);
    console.log(`month ${result.month} — ${result.phase.title}`);
    console.log(
      `corpus: ${result.corpus.sealed}/${result.corpus.target} sealed readings` +
        (result.corpus.chainIntact ? "" : "  ⚠ CHAIN BROKEN — run: elle verify"),
    );
    const active = result.units;
    if (active.length === 0) console.log("no units in progress — log a session to begin one");
    for (const u of active) {
      console.log(`\n${u.unitId}  ${u.title}`);
      if (u.signals.length === 0) {
        console.log("  steady — no signals");
        continue;
      }
      for (const s of u.signals) {
        console.log(`  ${s.watched ? "●" : "○"} ${s.signal}: ${s.evidence}`);
      }
      if (u.decision) {
        console.log(`  → ${u.decision.move.toUpperCase()} (${u.decision.signal})`);
        console.log(`    ${u.decision.instruction}`);
      }
    }
    break;
  }

  case "brief": {
    const state = await requireState(learnerId);
    const course = await loadCourse(state.courseId);
    const brief = sessionBrief(course, state, now);
    await saveState(state); // brief runs advise(); the witness log grew
    console.log(brief.markdown);
    break;
  }

  case "complete": {
    const state = await requireState(learnerId);
    const course = await loadCourse(state.courseId);
    const unitId = requireFlag(args, "unit");
    const result = completeUnit(course, state, unitId, now);
    await saveState(state);
    if (result.completed) {
      console.log(`${unitId} complete.`);
    } else {
      console.log(`${unitId} NOT complete:`);
      for (const r of result.reasons) console.log(`  - ${r}`);
      process.exit(1);
    }
    break;
  }

  case "status": {
    const state = await requireState(learnerId);
    const course = await loadCourse(state.courseId);
    const month = currentMonth(state, now);
    console.log(`${state.learnerId} — ${course.title} v${state.courseVersion} — month ${month}`);
    console.log(
      `corpus: ${state.sealedReadings.length}/${course.credentialModel.corpusSize} sealed readings`,
    );
    const rows = Object.values(state.units).filter((p) => p.status !== "not-started");
    for (const p of rows) {
      const unit = unitById(course, p.unitId);
      const hours =
        state.sessions.filter((s) => s.unitId === p.unitId).reduce((m, s) => m + s.minutes, 0) / 60;
      console.log(
        `  [${p.status === "complete" ? "✓" : " "}] ${p.unitId}  ${unit.title} — ` +
          `${Math.round(evidenceFraction(p) * 100)}% evidence, ${hours.toFixed(1)}h`,
      );
    }
    const avail = availableUnits(course, state, now).filter(
      (u) => (state.units[u.id]?.status ?? "not-started") === "not-started",
    );
    if (avail.length > 0) {
      console.log("available to start:");
      for (const u of avail) console.log(`  - ${u.id}  ${u.title} [track ${u.track}]`);
    }
    break;
  }

  case "review": {
    const state = await requireState(learnerId);
    const course = await loadCourse(state.courseId);
    const review = phaseReview(course, state, requireFlag(args, "phase"));
    console.log(`phase review — ${review.title}`);
    for (const u of review.units) {
      console.log(`  ${u.unitId}: ${u.status}, ${u.evidencePct}% evidence, ${u.hours}h`);
    }
    console.log("signals:", JSON.stringify(review.signalsSeen));
    console.log("moves:", JSON.stringify(review.movesExecuted));
    for (const o of review.observations) console.log(`  » ${o}`);
    break;
  }

  case "verify": {
    const state = await requireState(learnerId);
    const broken = verifyChain(state.sealedReadings);
    if (broken.length === 0) {
      console.log(`chain intact: ${state.sealedReadings.length} sealed readings verified`);
    } else {
      console.error("CHAIN BROKEN:");
      for (const b of broken) console.error(`  - ${b}`);
      process.exit(1);
    }
    break;
  }

  default:
    fail(`unknown command: ${command}`);
}
