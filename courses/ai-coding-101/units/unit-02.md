# UNIT 2 — Specification: saying exactly what you want

**Dimensions exercised:** `SPEC` (primary), `LOOP` (secondary)
**Typical entry:** `SPEC` at D1. This is the unit where most learners have their lowest dimension
score, and it is the one most correlated with capstone quality.

---

## 1. Learning objectives

By the end of Unit 2 the learner can:

1. Convert an intent into a written specification that a third party can judge output against,
   without asking the author what they meant.
2. Identify ambiguity in their own spec *before* generating, by finding two implementations that
   both satisfy it and disagree.
3. Write acceptance criteria before generation, as pass/fail statements about observable behavior.
4. Decompose a task into pieces small enough that each piece's output can be checked independently,
   and state the contract at each seam.
5. Recognize when a wrong output is a specification failure rather than a model failure — and resist
   the reflex to blame the tool.

---

## 2. Notional-machine concepts introduced

Specification forces machine concepts into the open. Introduced as *things a spec must pin down*:

- **Types and representation.** "A price" is not a specification. Cents-as-integer and
  dollars-as-float are different programs with different failure modes.
- **Collections and their properties.** Ordered vs unordered; unique vs duplicated; empty as a legal
  value. A spec that doesn't say is a spec that will be resolved by the model's guess.
- **Boundaries and inclusivity.** Every range in a spec has two ends and each must be declared.
- **Identity vs equality.** "The same item" — same object, or same contents?
- **Error as a specified behavior.** What *should* happen on bad input is part of the requirement,
  not an implementation detail.

---

## 3. AI-PRIMM beats in this unit

- **Predict** — moves earlier and becomes the acceptance criteria themselves. The prediction is no
  longer "what will this input produce" but "what statements must be true of any correct
  implementation." This is the unit's central move.
- **Prompt** — for the first time, fully the learner's. Do not edit it, do not improve it, do not
  hint at the ambiguity you can see. Let it be resolved wrongly.
- **Read** — read the output *against the acceptance criteria*, criterion by criterion, not
  impressionistically.
- **Verify** — check each acceptance criterion. Criteria that cannot be checked as written are
  themselves findings, and the learner should record them as spec defects.
- **Integrate** — and here the unit's discipline: when output is wrong, **edit the spec, not the
  prompt.** Track `spec_iterations` vs `prompt_rerolls` explicitly and show the ratio to the learner
  at the end of every Unit 2 session. Making it visible is most of the intervention.

---

## 4. Exercise templates

### Template 2-A — "The stranger test"

**Shape:** the learner writes a spec for a small task. The agent then generates **two** conforming
implementations that differ in behavior, and asks the learner to predict which is "theirs." Both
satisfy the spec as written. The disagreeing input is the finding.

This template has no clean/defective axis in the usual sense — the "defect" is in the learner's
artifact. It is graded on how many rounds it takes to reach a spec where the agent *cannot*
construct a divergent pair.

- **D1** — task: "count the words in a sentence." Divergence on hyphenated words, or on double
  spaces. One round of tightening usually suffices.
- **D2** — task: "rank employees by hours worked this month." Divergences available on: ties,
  employees with zero hours, month boundaries, part-months. Expect 2–3 rounds.
- **D4** — task: "deduplicate a customer list." Divergences on: case sensitivity, whitespace,
  which duplicate survives, whether merging fields is expected, `None` vs empty string. Expect 4+
  rounds, and a good learner ends by declaring some cases explicitly out of scope — which is the
  senior move and should be credited as such.

### Template 2-B — "Spec → generate → judge"

**Shape:** the full loop. Learner writes spec + acceptance criteria, prompts, and judges the output
against their own criteria. Standard clean/defective policy applies to the generated output — but
the interesting case is the third one below.

- **D1 / S2** — spec for a temperature converter; generated code rounds when the spec didn't say to.
  Learner must decide: is this a defect, or did I fail to specify? Correct answer: the latter. The
  finding is theirs.
- **D2 / S3** — spec for a discount calculator; the generated code resolves a genuine ambiguity in
  the learner's spec in the way the learner did *not* intend. Ground truth records this as
  `ambiguity_resolved_wrongly`. **A learner who says "the AI got it wrong" scores lower than one who
  says "my spec permitted this."**
- **D3 / CLEAN** — the generated code satisfies every acceptance criterion. The learner must verify
  each one and conclude correctly. Note the trap this sets: learners in Unit 2 have just been taught
  that specs are always ambiguous, and will hunt for a gap that isn't there. Expect elevated FPR in
  this unit and grade it strictly — that is what the clean runs are for.

### Template 2-C — "Decompose the too-big ask"

**Shape:** a task deliberately too large for one generation (D2+). Learner must split it into pieces
with stated contracts, spec each piece, generate each, and verify at the seams. Introduced at D2,
carries forward into Unit 8.

- **D2** — "turn a folder of receipt text files into a monthly expense summary." Natural seams:
  parse a file → normalize amounts → aggregate by month → format. Learner states what each piece
  takes and returns.
- **D3** — same, plus a piece whose contract the learner states loosely; the agent generates to the
  loose contract and the seam breaks (`parse` returns `None` on failure; `normalize` assumes a
  dict). The learner must locate the failure *at the seam*, not inside either function.
- **D4** — a 4-piece pipeline where the correct decomposition is not obvious and two of the
  learner's proposed pieces have overlapping responsibility. Grade the decomposition itself
  (rubric criterion 3.5), not just the outcome.

---

## 5. Certification artifact — *a spec a stranger can judge*

**Definition.** A specification document for a task of `D ≥ 2` scope, containing:

1. **Purpose** — one or two sentences, in the learner's own words.
2. **Interface** — inputs and outputs with types, shapes, units, and format.
3. **Behavior** — the required transformation, stated so that any two conforming implementations
   agree on every in-scope input.
4. **Edge cases** — at minimum: empty, boundary, malformed. Each with the required behavior, not
   just the case name.
5. **Out of scope** — explicit. Absence of a behavior listed here is not a defect.
6. **Acceptance criteria** — ≥ 4 pass/fail statements, written before generation, each checkable by
   someone who did not write the spec.

**The certification test is mechanical and the agent must actually perform it:** take the spec and
attempt to construct two conforming implementations that disagree on an in-scope input. If you
succeed, the spec fails and you report the disagreeing input. If you cannot after a genuine attempt
(try at least three axes: ordering, empties, ties/duplicates), the spec passes on decidability.

Do not fake this step. It is the only objective measurement in the unit.

---

## 6. Grading rubric — Unit 2 artifact

Uses `RUBRICS.md` §3 in full. Weights:

| Criterion | Weight |
|---|---|
| 3.1 Decidability (gated ≥ 3) | 35% |
| 3.2 Inputs & outputs | 15% |
| 3.3 Edge cases | 20% |
| 3.4 Acceptance criteria (gated ≥ 2) | 20% |
| 3.5 Decomposition | 10% |

**Pass bar:** mean ≥ 2.6 with the two gates. Reproduced here from `RUBRICS.md` §3 for the agent's
convenience; that file is authoritative if they ever diverge.

**Unit-specific addition — attribution of failure.** Scored separately, pass/fail, on the transcript
rather than the document:

> When a generation did not match intent, did the learner's first move investigate the *spec*?

Fail if the learner's dominant response across the unit was re-prompting. This is not folded into
the artifact score because it is a behavior, not a document — but it **blocks certification**.
Threshold: `discipline_ratio ≥ 0.40` over the unit's exercises. Chosen at 0.40 rather than 0.50
because some re-rolling is legitimate (models are stochastic; occasionally the same spec produces a
better draft), but a learner below 0.40 is fixing prompts as their primary strategy, which is
exactly what `COURSE-SPEC.md` §6.1 refuses to endorse.

---

## 7. Notes for the running agent

- **The hardest instruction in this unit: do not fix their spec.** You will see the ambiguity
  immediately. Let the generation resolve it wrongly and let the learner find it. If you pre-empt
  it, you have taught them that specs get fixed by someone else.
- When they blame the model, do not argue. Ask: "Show me the sentence in your spec that this
  violates." Usually there isn't one. Let the absence do the work.
- **Watch for over-specification.** A learner who writes pseudocode as a spec has removed the model's
  freedom and hidden the requirement inside an implementation. Cap 3.1 at 2 and explain: "You've
  told it *how*. If the how is wrong, nothing in your document can tell you."
- Expect this unit's FPR to run high (learners primed to find gaps). That is diagnostic, not a
  malfunction — but it must come down before Unit 9, where over-flagging fails the security audit.
- Elevated μ here is usually *productive* disagreement (the learner predicted X, got Y, and the
  reason is their own spec). Do not treat Unit 2's μ the same way as Unit 1's; a μ of 0.6 in Unit 2
  with resolution times under 5 minutes is a learner doing the work, not drowning.
