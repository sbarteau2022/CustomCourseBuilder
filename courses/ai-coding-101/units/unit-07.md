# UNIT 7 — Context & tooling

**Dimensions exercised:** `CONTEXT` (primary), `LOOP` (secondary)
**Typical entry:** `CONTEXT` at D0–D1 (no prior exposure).

**Standing warning to whoever maintains this course:** this is the unit with the shortest half-life.
`COURSE-SPEC.md` §7 rates the specific tool surface at ~50% confidence. Everything below is written
so that the *invariant* survives when the surface changes. When the examples stop matching reality,
replace the examples and keep §2.

---

## 1. Learning objectives

By the end of Unit 7 the learner can:

1. State the invariant: **a model can only reason over what it was given.** Most confidently-wrong
   output is a context failure wearing the costume of a reasoning failure.
2. Diagnose a bad answer as a context problem — distinguishing *truncated*, *stale*, *contradictory*,
   *absent*, and *overloaded* context — and fix it by changing what was supplied.
3. Assemble context deliberately: which files, which examples, which constraints, and why each.
4. Distinguish an assistant (answers in place), an agent (takes multi-step action), and a tool
   (deterministic, called by either) — and say what changes about verification in each case.
5. Direct multi-step AI work with a review gate at each step, rather than approving a plan and
   rubber-stamping the result.

---

## 2. The invariant (this is the durable part)

Five statements. If the tooling section of this unit is rewritten in two years, these stay.

1. **The model reasons over its input, not over the world.** Anything true of the system but absent
   from the input is, for the model, not true.
2. **Absence produces invention, not silence.** A model given insufficient context does not report
   insufficiency; it produces the most plausible completion. Confidence is uncorrelated with
   groundedness.
3. **More context is not monotonically better.** Irrelevant material dilutes; contradictory material
   forces an unannounced choice.
4. **Multi-step autonomy multiplies unverified steps.** An agent that takes ten actions has produced
   ten things to check, and errors compound because step 4 builds on unverified step 3.
5. **The reviewer is the bottleneck by design.** Any workflow whose throughput depends on *not*
   reviewing has moved the responsibility somewhere it cannot be held.

Everything else in this unit is an instance of these.

---

## 3. Notional-machine concepts introduced

Applied to the *system*, not to Python:

- **The window as a resource.** Finite, and what falls out of it is not remembered. Analogous to
  scope in Unit 6 — and worth teaching by that analogy, since the learner already has it.
- **Statelessness across calls.** The model does not remember the previous step unless the previous
  step is in the input.
- **Tool calls as boundaries.** Where the model stops guessing and something deterministic happens.
  Verification is cheap on the tool side and expensive on the model side; design accordingly.
- **Action irreversibility.** A generated file can be discarded. A sent email, a dropped table, and a
  pushed commit cannot. First-class distinction before Unit 9 makes it a security question.

---

## 4. Exercise templates

### Template 7-A — "Diagnose the context failure"

**Shape:** the learner sees a prompt, the context supplied with it, and the (wrong) output. They must
diagnose *which* context shape failed (`EXERCISE-GENERATION.md` §5) and fix it by changing the
context — not the prompt wording, and not the code.

- **D1 / `stale`** — the AI was shown v1 of a config module; the repo has v2 with a renamed key. The
  output is internally correct and references a key that no longer exists. Diagnosis: stale context.
- **D2 / `absent`** — a project convention (dates stored as ISO strings, not `datetime`) lives only
  in a file that wasn't supplied. The model invented a reasonable other convention. The learner must
  identify *what knowledge was missing*, which requires them to know their own project.
- **D3 / `contradictory`** — a schema file says a field is nullable; a docstring says it's required.
  The generated validator picks one. The learner must find both sources, identify the conflict, and
  — critically — decide which is authoritative, which is a judgment the model could not make.
- **D2 / `sufficient` (CLEAN)** — context was complete and the answer is correct. The learner must
  conclude that this is not a context problem. Served at the unit's clean rate and it matters: a
  learner who learns "when in doubt, add context" will pad every prompt forever.

### Template 7-B — "Assemble the context"

**Shape:** the learner is given a repo and a task, and must choose what to supply *before*
prompting, with a stated reason per item. Then they prompt and evaluate.

- **D1** — 5 candidate files, 2 relevant. Straightforward.
- **D2** — 12 candidate files; 3 relevant, 2 actively misleading (an old version and an unrelated
  module with similar names). Including the misleading ones produces wrong output. Overloading is
  the graded failure.
- **D4** — a repo too large to supply wholesale. The learner must decide what to include, what to
  summarize, and what to state as a constraint in prose rather than as a file. Then justify the
  cut. This is the realistic form of the skill and the one that will still matter when windows are
  ten times larger, because the dilution problem (invariant 3) does not go away with size.

### Template 7-C — "Review the agent's steps"

**Shape:** a multi-step agent trace — plan, then N executed steps with output. One step is wrong, or
none are. The learner must review step by step and catch it before it compounds.

- **D2** — 4 steps, step 2 wrong (reads the wrong column), steps 3–4 build on it and look plausible.
  The learner must locate the first wrong step, not the first visibly-wrong output.
- **D3 / CLEAN** — 6 steps, all correct, one *looks* wrong (a decoy: an intermediate file with a
  confusing name). Correct verdict: approve, with reasoning per step.
- **D4** — 8 steps, one wrong at step 3, and an irreversible action at step 6. The learner must both
  catch the error and identify that step 6 needed a gate regardless of correctness. Full marks
  require the second observation; most learners only make the first.

### Template 7-D — "Which kind of thing is this?"

**Shape:** short scenarios; the learner classifies assistant / agent / tool, and — the actual point —
states what verification each demands and what the failure mode is if verification is skipped.

Deliberately low-stakes and fast. Its purpose is vocabulary and the verification mapping, not depth.
Run at D1–D2 only; it does not scale to D4 and should not be padded to.

---

## 5. Certification artifact — *the context diagnosis case*

**Definition.** A worked case, on a `D ≥ 2` instance, containing:

1. **The symptom** — what was wrong with the output, concretely.
2. **The elimination** — evidence that this was *not* a model reasoning failure, not a spec
   ambiguity, and not a straightforward code defect. Each ruled out with a reason.
3. **The diagnosis** — which context shape failed, and the specific evidence for it (the file that
   was stale, the constraint that was absent, the two sources that disagreed).
4. **The fix** — what was changed about the context. Prompt-wording changes do not count; if the fix
   was a better-worded prompt, the diagnosis was wrong and the artifact fails.
5. **Verification** — the same request with the corrected context, and the result. Including the case
   where it still fails, which is an honest and informative outcome.
6. **The general rule** — one sentence, in the learner's words, about what to supply next time for
   this class of task.

**If the case was `sufficient` (clean):** the artifact instead documents the elimination of all five
context-failure shapes with evidence, and identifies where the actual problem was — usually the
learner's own expectation.

---

## 6. Grading rubric — Unit 7 artifact

| Criterion | Weight | 0 | 2 | 4 |
|---|---|---|---|---|
| **Elimination** | 25% | Jumps to context as the explanation | Rules out ≥ 1 alternative with evidence | Rules out reasoning failure, spec ambiguity, and code defect, each with a specific observation |
| **Diagnosis specificity** | 25% | "It didn't have enough context" | Names the shape | Names the shape and points at the exact file/version/constraint, quoting it |
| **Fix is contextual** | 20% | Fix was a reworded prompt | Context changed, loosely justified | Context change is minimal and targeted, with a stated reason per item added or removed |
| **Verification** | 15% | Not re-run | Re-run, result reported | Re-run, result reported, and a check that the fix didn't introduce a new problem (e.g. dilution) |
| **Generalization** | 15% | Absent | A rule stated | A rule stated *and* bounded — when it applies and when it wouldn't |

**Pass bar:** ≥ 0.70 with **diagnosis specificity ≥ 3** and **fix is contextual = required**
(a prompt-wording fix fails outright — it means the learner solved a different problem).

**Grader traps.**
- *Context as a universal explanation.* Learners in this unit blame context for everything, including
  genuine model errors and their own spec gaps. The elimination criterion exists to stop this and
  should be applied strictly.
- *"I added the whole repo and it worked."* Fix score capped at 2. That is not diagnosis, and it
  violates invariant 3.
- *Retrospective certainty.* "Obviously it needed the schema" without evidence it was checked scores
  2, not 4.

---

## 7. Notes for the running agent

- **Teach the invariant first and the tools second**, in that order, in every session of this unit.
  If a learner leaves with a mental model of "context windows are N tokens" and not "the model knows
  only what I gave it," the unit failed even if they scored well.
- **Say the half-life out loud.** Tell the learner that the specific tool surface will change and
  which parts they should expect to relearn. That honesty is itself part of the curriculum, and it
  inoculates them against treating today's tooling as how things fundamentally are.
- Watch for the "more context always" reflex. Template 7-B's D2 instance and the `sufficient` clean
  runs exist to break it. If a learner's fix is always "add more," they have a policy, not a
  diagnosis — same failure as always-say-broken, in a new place.
- The irreversibility observation in 7-C/D4 is the one to push on. It is the seam between this unit
  and Unit 9, and a learner who makes it unprompted is ready to move.
