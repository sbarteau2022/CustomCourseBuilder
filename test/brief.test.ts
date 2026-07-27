import { test } from "node:test";
import assert from "node:assert/strict";
import { aiEngineerStack } from "../courses/ai-engineer-stack/course.ts";
import { newLearnerState, type SessionRecord } from "../src/runtime/state.ts";
import { sealReading } from "../src/runtime/seal.ts";
import { recordSession } from "../src/runtime/engine.ts";
import { ethicsSpineStatus, sessionBrief } from "../src/runtime/brief.ts";

const course = aiEngineerStack;
const T0 = new Date("2026-08-01T09:00:00Z");

function daysLater(days: number): Date {
  return new Date(T0.getTime() + days * 24 * 60 * 60 * 1000);
}

const LONG =
  "This is a deliberately long tier reading with enough substance to clear the minimum threshold for sealing.";

function freshState() {
  return newLearnerState("brief-learner", course.id, course.version, T0);
}

function session(unitId: string, day: number, minutes: number, extra: Partial<SessionRecord> = {}): SessionRecord {
  return { unitId, at: daysLater(day).toISOString(), minutes, ...extra };
}

function sealWeekly(state: ReturnType<typeof freshState>, day: number) {
  sealReading(
    state,
    { kind: "weekly", tier1MaterialGround: LONG + day, tier2ObserverReading: LONG, tier3SitWithThis: LONG },
    daysLater(day),
  );
}

// ── ethics spine due-tracking ───────────────────────────────────────────

test("weekly readings owed accrue one per completed week", () => {
  const state = freshState();
  // Week 4 (day 22): 3 completed weeks, 1 weekly sealed → 2 owed.
  sealWeekly(state, 6);
  const ethics = ethicsSpineStatus(course, state, daysLater(22));
  assert.equal(ethics.week, 4);
  assert.equal(ethics.weeklySealed, 1);
  assert.equal(ethics.weeklyOwed, 2);
});

test("current spine shows zero owed", () => {
  const state = freshState();
  sealWeekly(state, 5);
  sealWeekly(state, 12);
  const ethics = ethicsSpineStatus(course, state, daysLater(15)); // week 3, 2 completed weeks
  assert.equal(ethics.weeklyOwed, 0);
  assert.equal(ethics.chainIntact, true);
});

// ── brief content ───────────────────────────────────────────────────────

test("brief opens on owed readings and carries the contract move verbatim", () => {
  const state = freshState();
  for (const day of [1, 3, 5]) {
    recordSession(
      course,
      state,
      session("a1-python-automation", day, 60, { blocker: "KeyError looping over dict keys" }),
    );
  }
  const brief = sessionBrief(course, state, daysLater(8)); // week 2, 1 week owed
  assert.ok(brief.ethics.weeklyOwed >= 1);
  assert.match(brief.markdown, /weekly reading.* owed/i);
  // the contract's reroute text appears verbatim
  const unit = course.units.find((u) => u.id === "a1-python-automation")!;
  assert.ok(brief.markdown.includes(unit.adaptation.moves.reroute));
  assert.match(brief.markdown, /Contract move: REROUTE/);
  // and generating the brief wrote the witness log
  assert.ok(state.adaptationLog.some((e) => e.signal === "struggle-blocked"));
});

test("broken chain is surfaced at the top of the brief", () => {
  const state = freshState();
  sealWeekly(state, 2);
  sealWeekly(state, 6);
  state.sealedReadings[0]!.tier3SitWithThis = "rewritten";
  const brief = sessionBrief(course, state, daysLater(7));
  assert.equal(brief.ethics.chainIntact, false);
  assert.match(brief.markdown, /BROKEN/);
});

test("final month of a phase flags the witness review", () => {
  const state = freshState();
  recordSession(course, state, session("b1-ai-for-everyone", 1, 60));
  const brief = sessionBrief(course, state, daysLater(75)); // month 3 = last month of p1
  assert.equal(brief.phase.isFinalMonthOfPhase, true);
  assert.match(brief.markdown, /Phase boundary approaching/);
});

test("openings list only unstarted, unlocked units", () => {
  const state = freshState();
  recordSession(course, state, session("b1-ai-for-everyone", 1, 60));
  const brief = sessionBrief(course, state, daysLater(2));
  const ids = brief.openings.map((o) => o.unitId);
  assert.ok(ids.includes("b2-ml-specialization")); // unlocked by b1 in progress
  assert.ok(!ids.includes("b1-ai-for-everyone")); // already started
  assert.ok(!ids.includes("a2-meta-backend")); // phase window closed
});
