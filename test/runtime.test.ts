import { test } from "node:test";
import assert from "node:assert/strict";
import { aiEngineerStack } from "../courses/ai-engineer-stack/course.ts";
import { newLearnerState, type SessionRecord } from "../src/runtime/state.ts";
import { sealReading, verifyChain } from "../src/runtime/seal.ts";
import {
  advise,
  availableUnits,
  completeUnit,
  recordSession,
  SIGNAL_MOVE,
} from "../src/runtime/engine.ts";
import { detectSignals, similarBlockers } from "../src/runtime/signals.ts";

const course = aiEngineerStack;
const T0 = new Date("2026-08-01T09:00:00Z");

function daysLater(days: number): Date {
  return new Date(T0.getTime() + days * 24 * 60 * 60 * 1000);
}

const LONG =
  "This is a deliberately long tier reading with enough substance to clear the minimum threshold for sealing.";

function freshState() {
  return newLearnerState("test-learner", course.id, course.version, T0);
}

function session(unitId: string, day: number, minutes: number, extra: Partial<SessionRecord> = {}): SessionRecord {
  return { unitId, at: daysLater(day).toISOString(), minutes, ...extra };
}

// ── scheduling ──────────────────────────────────────────────────────────

test("month 1 offers exactly the phase-1 units with no prereqs", () => {
  const state = freshState();
  const avail = availableUnits(course, state, daysLater(3)).map((u) => u.id);
  assert.ok(avail.includes("a1-python-automation"));
  assert.ok(avail.includes("c1-ibm-data-engineering"));
  // b2 requires b1 in progress; nothing started yet.
  assert.ok(!avail.includes("b2-ml-specialization"));
  // phase 2 unit, window not open
  assert.ok(!avail.includes("a2-meta-backend"));
});

test("prerequisites unlock once the prereq is in progress", () => {
  const state = freshState();
  recordSession(course, state, session("b1-ai-for-everyone", 1, 60));
  const avail = availableUnits(course, state, daysLater(2)).map((u) => u.id);
  assert.ok(avail.includes("b2-ml-specialization"));
});

// ── signal detection ────────────────────────────────────────────────────

test("mastery-early fires when all pillars land before 60% of targetWeeks", () => {
  const state = freshState();
  const unit = course.units.find((u) => u.id === "b1-ai-for-everyone")!;
  recordSession(
    course,
    state,
    session("b1-ai-for-everyone", 0, 120, {
      evidence: [
        { pillar: "structure", artifact: "landscape map" },
        { pillar: "readingReasoning", artifact: "news claim analysis" },
        { pillar: "testing", artifact: "explained supervised learning, logged gaps" },
        { pillar: "building", artifact: "project map through AI terms" },
      ],
    }),
  );
  const signals = detectSignals(
    unit,
    state.units["b1-ai-for-everyone"]!,
    state.sessions,
    daysLater(7),
  );
  assert.ok(signals.some((s) => s.signal === "mastery-early"));
});

test("struggle-blocked fires on three sessions stuck on the same wall", () => {
  const state = freshState();
  const unit = course.units.find((u) => u.id === "a1-python-automation")!;
  for (const day of [1, 3, 5]) {
    recordSession(
      course,
      state,
      session("a1-python-automation", day, 60, {
        blocker: "for loop over dictionary keys raises KeyError",
      }),
    );
  }
  const signals = detectSignals(
    unit,
    state.units["a1-python-automation"]!,
    state.sessions,
    daysLater(6),
  );
  assert.ok(signals.some((s) => s.signal === "struggle-blocked"));
  assert.ok(!signals.some((s) => s.signal === "struggle-productive"));
});

test("different blockers with progress read as struggle-productive, not blocked", () => {
  const state = freshState();
  const unit = course.units.find((u) => u.id === "a1-python-automation")!;
  recordSession(course, state, session("a1-python-automation", 1, 60, { blocker: "git merge conflicts in rebase" }));
  recordSession(course, state, session("a1-python-automation", 3, 60, { blocker: "regex lookahead syntax confusing" }));
  recordSession(
    course,
    state,
    session("a1-python-automation", 5, 60, {
      blocker: "virtualenv path issues on startup",
      evidence: [{ pillar: "structure", artifact: "program anatomy diagram" }],
    }),
  );
  const signals = detectSignals(
    unit,
    state.units["a1-python-automation"]!,
    state.sessions,
    daysLater(6),
  );
  assert.ok(signals.some((s) => s.signal === "struggle-productive"));
  assert.ok(!signals.some((s) => s.signal === "struggle-blocked"));
});

test("disengagement fires after 14 quiet days", () => {
  const state = freshState();
  const unit = course.units.find((u) => u.id === "d1-wharton-foundations")!;
  recordSession(course, state, session("d1-wharton-foundations", 0, 90));
  const signals = detectSignals(
    unit,
    state.units["d1-wharton-foundations"]!,
    state.sessions,
    daysLater(15),
  );
  assert.ok(signals.some((s) => s.signal === "disengagement"));
});

test("pace-behind requires low hours and no blockers", () => {
  const state = freshState();
  const unit = course.units.find((u) => u.id === "c1-ibm-data-engineering")!;
  recordSession(course, state, session("c1-ibm-data-engineering", 0, 30));
  recordSession(course, state, session("c1-ibm-data-engineering", 40, 30));
  const signals = detectSignals(
    unit,
    state.units["c1-ibm-data-engineering"]!,
    state.sessions,
    daysLater(42), // week 6 of 24: expected 25%, evidence 0%, ~0.25 hrs/wk
    );
  assert.ok(signals.some((s) => s.signal === "pace-behind"));
});

test("blocker similarity heuristic distinguishes same wall from new walls", () => {
  assert.ok(similarBlockers("KeyError iterating dictionary keys", "dictionary keys KeyError in loop"));
  assert.ok(!similarBlockers("KeyError iterating dictionary keys", "css flexbox alignment broken"));
});

// ── contract execution ──────────────────────────────────────────────────

test("advise executes the contract: blocked struggle → the unit's reroute text", () => {
  const state = freshState();
  for (const day of [1, 3, 5]) {
    recordSession(
      course,
      state,
      session("a1-python-automation", day, 60, { blocker: "loop over dict keys KeyError" }),
    );
  }
  const result = advise(course, state, daysLater(6), true);
  const a1 = result.units.find((u) => u.unitId === "a1-python-automation")!;
  assert.equal(a1.decision?.move, "reroute");
  const unit = course.units.find((u) => u.id === "a1-python-automation")!;
  assert.equal(a1.decision?.instruction, unit.adaptation.moves.reroute);
  // and the witness log recorded it
  assert.ok(
    state.adaptationLog.some(
      (e) => e.unitId === "a1-python-automation" && e.signal === "struggle-blocked" && e.move === "reroute",
    ),
  );
});

test("unwatched signals are logged as observed but drive no move", () => {
  const state = freshState();
  const unit = course.units.find((u) => u.id === "d1-wharton-foundations")!;
  assert.ok(!unit.adaptation.watchFor.includes("struggle-blocked"));
  for (const day of [1, 3, 5]) {
    recordSession(
      course,
      state,
      session("d1-wharton-foundations", day, 60, { blocker: "confused by accrual accounting entries" }),
    );
  }
  const result = advise(course, state, daysLater(6), true);
  const d1 = result.units.find((u) => u.unitId === "d1-wharton-foundations")!;
  const blocked = d1.signals.find((s) => s.signal === "struggle-blocked");
  assert.ok(blocked && !blocked.watched);
  assert.notEqual(d1.decision?.signal, "struggle-blocked");
  const logged = state.adaptationLog.find(
    (e) => e.unitId === "d1-wharton-foundations" && e.signal === "struggle-blocked",
  );
  assert.ok(logged && logged.move === null);
});

test("every signal has a move mapping", () => {
  for (const move of Object.values(SIGNAL_MOVE)) {
    assert.ok(["accelerate", "reinforce", "reroute"].includes(move));
  }
});

// ── completion gate ─────────────────────────────────────────────────────

test("completion is refused without full pillar evidence and a sealed unit-close reading", () => {
  const state = freshState();
  recordSession(
    course,
    state,
    session("b1-ai-for-everyone", 1, 120, {
      evidence: [{ pillar: "structure", artifact: "map" }],
    }),
  );
  const refused = completeUnit(course, state, "b1-ai-for-everyone", daysLater(20));
  assert.equal(refused.completed, false);
  assert.ok(refused.reasons[0]?.includes("no evidence"));
  assert.ok(
    state.adaptationLog.some(
      (e) => e.unitId === "b1-ai-for-everyone" && e.signal === "shallow-completion",
    ),
  );

  // supply the rest and a sealed reading → completes
  recordSession(
    course,
    state,
    session("b1-ai-for-everyone", 21, 120, {
      evidence: [
        { pillar: "readingReasoning", artifact: "claims analysis" },
        { pillar: "testing", artifact: "vocabulary test log" },
        { pillar: "building", artifact: "project landscape map" },
      ],
    }),
  );
  sealReading(
    state,
    {
      kind: "unit-close",
      unitId: "b1-ai-for-everyone",
      tier1MaterialGround: LONG,
      tier2ObserverReading: LONG,
      tier3SitWithThis: LONG,
    },
    daysLater(22),
  );
  const ok = completeUnit(course, state, "b1-ai-for-everyone", daysLater(23));
  assert.equal(ok.completed, true);
});

// ── sealing ─────────────────────────────────────────────────────────────

test("sealed chain verifies, and tampering breaks every later seal", () => {
  const state = freshState();
  for (let i = 0; i < 3; i++) {
    sealReading(
      state,
      { kind: "weekly", tier1MaterialGround: LONG + i, tier2ObserverReading: LONG, tier3SitWithThis: LONG },
      daysLater(7 * (i + 1)),
    );
  }
  assert.deepEqual(verifyChain(state.sealedReadings), []);
  state.sealedReadings[0]!.tier2ObserverReading = "rewritten history";
  const broken = verifyChain(state.sealedReadings);
  assert.ok(broken.length >= 1);
  assert.ok(broken.some((b) => b.includes("#1")));
});

test("thin readings are refused at the seal", () => {
  const state = freshState();
  assert.throws(
    () =>
      sealReading(
        state,
        { kind: "weekly", tier1MaterialGround: "too thin", tier2ObserverReading: LONG, tier3SitWithThis: LONG },
        T0,
      ),
    /refusing to seal/,
  );
  assert.equal(state.sealedReadings.length, 0);
});
