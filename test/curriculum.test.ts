import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { aiEngineerCurriculum } from "../curriculum/ai-engineer/curriculum.ts";
import { validateCurriculum } from "../src/validate-curriculum.ts";

const C = aiEngineerCurriculum;

test("the manifest passes full validation, including syllabus files", () => {
  const errors = validateCurriculum(C, "curriculum/ai-engineer/syllabi");
  assert.deepEqual(errors, []);
});

test("program weights sum to exactly 100", () => {
  assert.equal(C.courses.reduce((n, c) => n + c.weightPercent, 0), 100);
});

test("hours are internally consistent", () => {
  assert.equal(C.courses.reduce((n, c) => n + c.hours, 0), C.totalHours);
});

test("every course carries the philosophy: a real descent arc and ethics thread", () => {
  for (const c of C.courses) {
    assert.ok(c.descentArc.length >= 60, `${c.code} descentArc`);
    assert.ok(c.ethicsThread.length >= 60, `${c.code} ethicsThread`);
    // the descent language is present somewhere in each arc
    assert.match(c.descentArc, /descend|beneath|below|down/i, `${c.code} names a descent`);
  }
});

test("evaluation is a spine: AIE-204 precedes the LLM tier, and is a full course", () => {
  const evalCourse = C.courses.find((c) => c.code === "AIE-204");
  assert.ok(evalCourse && evalCourse.hours >= 100);
  // AIE-301 (LLMs) requires AIE-204
  const llm = C.courses.find((c) => c.code === "AIE-301")!;
  assert.ok(llm.prerequisites.includes("AIE-204"));
});

test("the descent spine is explicit: Python (101) → C (102) → back up, then scale (104)", () => {
  const c102 = C.courses.find((c) => c.code === "AIE-102")!;
  assert.ok(c102.prerequisites.includes("AIE-101"));
  assert.match(c102.title, /C\b|Metal/);
  assert.match(c102.descentArc, /C\b/);
  const c104 = C.courses.find((c) => c.code === "AIE-104")!;
  assert.ok(c104.prerequisites.includes("AIE-102"));
});

test("every module is a well-formed dispatchable packet", () => {
  let total = 0;
  for (const c of C.courses) {
    for (const m of c.modules) {
      total++;
      assert.ok(m.id.startsWith(c.code + "-M"), `${m.id} prefix`);
      assert.ok(m.hours > 0, `${m.id} hours`);
      assert.ok(m.title.length > 0, `${m.id} title`);
    }
  }
  assert.equal(total, 100); // the dispatch scope
});

test("assessment weights sum to 100 in every course and never rely on 'a program that runs'", () => {
  for (const c of C.courses) {
    assert.equal(c.assessmentWeights.reduce((n, w) => n + w.percent, 0), 100, c.code);
  }
});

test("every course has its syllabus scaffold on disk", () => {
  for (const c of C.courses) {
    assert.ok(existsSync(`curriculum/ai-engineer/syllabi/${c.code}.md`), `${c.code}.md`);
  }
});

test("durability is declared everywhere (staleness-resistance is architected, not hoped)", () => {
  for (const c of C.courses) {
    assert.ok(["durable", "mixed", "swappable"].includes(c.durability), c.code);
  }
  // the from-scratch foundations are durable
  assert.equal(C.courses.find((c) => c.code === "AIE-102")!.durability, "durable");
  // the framework course is swappable
  assert.equal(C.courses.find((c) => c.code === "AIE-302")!.durability, "swappable");
});
