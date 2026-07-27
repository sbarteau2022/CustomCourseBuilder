# UNIT 4 — Verification & testing

**Dimensions exercised:** `TEST` (primary), `SPEC` and `TRACE` (secondary)
**Typical entry:** `TEST` at D1–D2.

---

## 1. Learning objectives

By the end of Unit 4 the learner can:

1. Write tests for AI-generated code as a default habit, not an afterthought.
2. Translate Unit 2 acceptance criteria into runnable assertions, one-to-one.
3. Name and defeat happy-path blindness: construct inputs that would distinguish a correct
   implementation from the plausible wrong one, rather than inputs that confirm it works.
4. Write the test *before* the generation, and use the failing test as the specification.
5. State honestly what a passing suite does and does not prove.

---

## 2. Notional-machine concepts introduced

Introduced as testing forces them into view:

- **The input domain.** The set of values a function can legally receive — not the set the learner
  happened to try. Cardinality, boundaries, and the empty case.
- **Equality of results.** `==` on floats, on dicts, on nested structures. Why `0.1 + 0.2 != 0.3`
  and what that means for asserting on money.
- **Side effects vs return values.** A function can be "correct" in what it returns and wrong in what
  it changed. Tests that only check returns miss half the behavior.
- **Determinism.** Same input, same output — unless there is hidden state, time, randomness, or
  ordering. Each of those is a test-design problem before it is a bug.
- **Test as executable spec.** An assertion is a requirement that can fail. This is the unit's
  central reframe.

---

## 3. AI-PRIMM beats in this unit

- **Predict** — becomes the assertion. The prediction is written as `assert f(x) == y` before the
  code exists. This is the most concrete form prediction takes anywhere in the course, and learners
  who struggled with abstract prediction often click here.
- **Prompt** — includes the tests. Learners discover the leverage of "here are the tests it must
  pass" and also its limit: the AI will write code that passes the tests and does nothing else.
  That limit is a lesson, not a failure.
- **Read** — read the tests too. AI-generated tests are AI output and get the same treatment. A test
  that asserts the implementation's actual behavior rather than the requirement is the most common
  and most dangerous AI test defect, and it appears in this unit deliberately.
- **Verify** — run the suite. Then the discipline: *what would still be wrong if this suite passed?*
- **Integrate** — record coverage of the input domain, not line coverage.

---

## 4. Exercise templates

### Template 4-A — "Criteria to assertions"

**Shape:** the learner takes a Unit 2-style spec (theirs or supplied) and writes assertions
one-to-one with the acceptance criteria. Then code is generated and run against them.

- **D1 / S2** — 4 criteria, 4 assertions, a function with an `off_by_one`. If the learner's
  assertions cover the boundary, the suite catches it; if they only cover the middle, it passes and
  the code is wrong. The exercise's finding is which of those happened.
- **D2 / S4** — criteria include "handles an empty input." The learner writes
  `assert total([]) == 0`; the generated code returns `0` for empty *and* for all-`None` inputs,
  which the criteria didn't cover. Passing suite, wrong code. Lesson: the suite is exactly as good
  as the criteria.
- **D3 / S4, CLEAN** — criteria are thorough, code is correct, suite passes. The learner must
  resist the urge to keep hunting and instead state what the suite does *not* cover. Full marks for
  "these 6 assertions cover ordering, empties, and ties; they do not cover unicode names or inputs
  above 10⁶ elements, and I'm accepting that."

### Template 4-B — "Break the suite"

**Shape:** the agent supplies AI-generated code **and** an AI-generated test suite that passes. One
of the two is defective. The learner must determine which.

This is the unit's signature exercise and the one that most directly teaches "it ran ≠ it's correct."

- **D2 / S2** — code is correct; the test asserts the wrong expected value and *also* passes,
  because it asserts against the code's behavior rather than the requirement. Verdict: the test is
  the defect. (This looks like a trick and is not — it is the single most common real-world failure
  of AI-generated tests.)
- **D3 / S4** — code has an `unhandled_edge_case`; the suite is entirely happy-path and passes.
  Verdict: code defective, suite inadequate. Full marks require naming both.
- **D4 / CLEAN** — code correct, suite adequate. The learner must say so, and support it by
  identifying the input classes the suite covers. This is where FPR gets measured in this unit.

### Template 4-C — "Test-first with AI"

**Shape:** the learner writes the test suite *before* any implementation exists, then prompts with
the suite as the specification. Measures whether their tests actually constrain the solution.

- **D2** — the agent generates a **deliberately minimal** implementation that passes the learner's
  suite and is otherwise wrong (e.g. returns a hardcoded value that satisfies all three assertions).
  Findings: the suite under-constrains. Do this once per learner; it is memorable and it lands.
- **D3** — the suite is adequate and the generated implementation is correct. Clean. The learner
  verifies and accepts.
- **D4** — a suite for a stateful component (something with a cache, a file, or an accumulator). The
  learner must write a test that calls twice. If they don't, the generated code passes with an `S5`
  defect intact. This is the direct bridge to Unit 5.

---

## 5. Certification artifact — *a suite that fails on planted bugs*

**Definition.** The learner writes a test suite for a specified component. The agent then generates
**five variants** of that component: one correct, and four containing planted defects drawn from
classes legal for the unit at the learner's current subtlety band. The learner does not see the
variants while writing.

The suite is run against all five. Certification requires:

- **Sensitivity:** the suite fails on ≥ 3 of the 4 defective variants.
- **Specificity:** the suite passes on the correct variant. *A suite that fails the correct
  implementation fails certification outright*, regardless of how many defects it catches. This is
  the false-positive discipline expressed at the level of tooling rather than judgment, and it is
  where the course's central symmetry shows up most cleanly.
- **Written justification:** for each defective variant the suite missed, the learner explains what
  assertion would have caught it and why they didn't write it. Honest post-hoc analysis scores well;
  "I would have caught it if I'd thought of it" scores 0.

The suite is submitted with the learner's stated coverage claim: which input classes it covers and
which it deliberately does not.

---

## 6. Grading rubric — Unit 4 artifact

| Criterion | Weight | 0 | 2 | 4 |
|---|---|---|---|---|
| **Specificity** | gate | Fails the correct variant | — | Passes the correct variant |
| **Sensitivity** | 30% | Catches ≤ 1 of 4 | Catches 3 of 4 | Catches 4 of 4 |
| **Assertion quality** | 20% | Asserts that it "runs" or that output is truthy | Asserts specific expected values | Assertions are one-to-one with stated requirements and each names the requirement it encodes |
| **Domain coverage** | 20% | Happy path only | Covers empty + one boundary | Covers empty, boundaries, duplicates/ties, malformed, and states which classes are out of scope |
| **Side-effect checking** | 10% | Only return values | Checks mutation of inputs where relevant | Checks mutation, idempotence, and second-call behavior where the component is stateful |
| **Miss analysis** | 20% | Absent or excuse-making | Names the missing assertion per miss | Names it, and identifies the *class* of reasoning that produced the blind spot |

**Pass bar:** specificity gate passed, sensitivity ≥ 3/4, overall ≥ 0.70.

*Why 3 of 4 and not 4 of 4:* a suite catching everything is either the result of a very strong
learner or of defects that were too easy; requiring 4/4 would push the generator toward obvious
plants, which defeats the purpose. Three is a real bar that leaves room for one genuinely subtle
miss, and the miss analysis criterion converts that miss into the most valuable part of the artifact.

**Grader traps.**
- *Assertion inflation.* Forty assertions that all probe the same input class score 2 on coverage,
  not 4. Count classes, not assertions.
- *`assert result is not None`.* Scores 0 on assertion quality. It cannot fail for the right reason.
- *Suite written against the implementation.* If the learner saw any variant before writing, the
  artifact is void. Enforce ordering.

---

## 7. Notes for the running agent

- **The "it ran" reflex is the target.** Every time a learner says "it works," ask "what would you
  have seen if it didn't?" Repeat until the question becomes theirs.
- Watch `verification_mode_counts` in learner state. If `ran_it` still dominates `tested` at the end
  of this unit, the unit did not land, regardless of the artifact score. Hold certification.
- **Do not let AI-generated tests pass unread.** Learners will delegate the suite and then trust it.
  Template 4-B exists to break that; if they still do it, serve 4-B again at higher subtlety.
- The Template 4-C "minimal passing implementation" exercise is the most effective single moment in
  this unit. Use it once, early, and do not repeat it — its power is entirely in the surprise.
- Expect a temporary spike in μ when stateful components arrive (4-C at D4). That is the Unit 5
  material announcing itself; if the learner stalls there, route forward to Unit 5 rather than back.
