# UNIT 1 — Reading before generating (the notional machine)

**Dimensions exercised:** `TRACE` (primary), `FOUND` (secondary)
**Typical entry:** `TRACE` at D1. Unit 1 is where most of the early level movement happens.

---

## 1. Learning objectives

By the end of Unit 1 the learner can:

1. Hand-trace a short program: maintain a written table of variable values through execution and
   arrive at the correct output without running it.
2. Read AI-generated code line by line and say what each line does, distinguishing what it *does*
   from what its name or docstring *claims*.
3. Predict output before running, with concrete values, and be specific enough to be wrong.
4. Recognize the "looks right / is wrong" pattern: code whose shape matches the task while its
   behavior does not.
5. Identify a planted defect in unfamiliar code and name the input that exposes it.

---

## 2. Notional-machine concepts introduced

Taught strictly as **instruments for tracing**, introduced in this order and only as far as the
exercises demand:

- **Variables as boxes with current contents.** Assignment replaces; it does not accumulate.
- **Sequence and re-assignment.** The same name has different values at different lines.
- **Conditionals as forks.** Exactly one branch runs. Which one, for this input?
- **Loops as repetition with changing state.** The loop variable, the accumulator, and the
  distinction between them. What is true at the top of each iteration.
- **Function call as a jump with arguments and a return.** Control goes elsewhere and comes back
  with a value. Locals do not survive the return.
- **Off-by-one as a *reading* skill:** what is the first value, what is the last value, how many
  iterations. Taught here, before it is ever a debugging problem.

The trace table is the unit's tool and the learner should be able to produce one on paper:

| Line | `i` | `total` | `items[i]` | Note |
|---|---|---|---|---|

---

## 3. AI-PRIMM beats in this unit

- **Predict** — the dominant beat. The learner predicts output *from reading alone*, before running,
  every time. At D0–D1 the agent asks for a value; at D2+ it asks for a value plus one input where
  the learner is unsure.
- **Prompt** — largely absent. Unit 1 supplies the code. This is deliberate: the learner is not yet
  generating, per the front-loading commitment in `COURSE-SPEC.md` §1.
- **Read** — the trace table. Enforce writing it, at least through D2. Learners who trace in their
  head at D1 will fail at D3, and the failure will look like a reading problem when it is a
  working-memory problem.
- **Verify** — run it, and compare against the written prediction. The comparison is the beat, not
  the run. If the prediction was wrong, the learner must find *where* the trace diverged, not just
  note that it did. This is the first appearance of debugging and it is done on their own reasoning.
- **Integrate** — "what did I learn about how this construct behaves" written into the trail.

---

## 4. Exercise templates

### Template 1-A — "Trace and predict"

**Shape:** AI-generated function, no defect claim made either way. Learner produces a trace table
and a predicted output for a supplied input, then runs. Clean rate follows the standard policy —
crucially, the code being *correct* is a live possibility and the learner must be willing to say so.

- **D0 / S1** — 12-line loop summing a list with the accumulator reset inside the loop. Trace of 5
  rows makes it obvious. Learner predicts `3` (the last element) and is right for the wrong reason
  the first time — the agent must ask *why* 3, not just accept it.
- **D1 / S2, CLEAN** — 30-line function bucketing exam scores into grades. Correct, including the
  boundaries. The learner must trace the boundary cases (89, 90) and conclude it's right. Full marks
  require them to have *checked the boundary specifically*, not to have shrugged.
- **D2 / S4** — 70-line report generator over a list of dicts. Correct on every input with distinct
  keys; silently drops records when two entries share a key because it builds a dict keyed on name.
  The trace only exposes it if the learner chooses an input with a duplicate — which they will only
  do if they ask "what inputs are possible?" That question is the skill.

### Template 1-B — "The name lies"

**Shape:** code whose identifiers and docstring describe behavior the body does not implement.
Tests the docstring-vs-code discrimination directly. Defect class from
{`wrong_requirement`, `plausible_wrong_api`, `wrong_comparison_operator`}.

- **D0 / S1** — function named `maximum` that returns the last element.
- **D1 / S2** — `remove_duplicates(items)` documented as "preserves first occurrence" that returns
  `list(set(items))`, losing order. Runs fine; output looks reasonable on small inputs.
- **D3 / S4** — a 150-line module where `normalize()` is documented as idempotent and isn't: calling
  it twice on the same data strips a second layer of whitespace-delimited tokens. Only visible
  across two invocations. Learner must think to call it twice.

### Template 1-C — "Find the plant"

**Shape:** the explicit Unit 1 assessment form. Learner is told *"this code came back from the
assistant; there may or may not be a defect."* They produce a trace, a verdict, and — if defective —
the line, the mechanism, and the discriminating input. This template is the certification vehicle.

- **D1 / S2** — 35-line date-range function; `while current < end` where the spec says the end date
  is included.
- **D2 / S3, DECOY** — 60-line invoice line-item summarizer. Contains `range(len(rows) - 1)` in a
  pairwise-comparison loop, which looks off-by-one and is correct. The actual defect is elsewhere:
  subtotal is computed before discount is applied, contradicting the stated order of operations.
  Naming the decoy is a false positive; naming both is partially credited (see rubric).
- **D3 / S4, CLEAN, DECOY** — 120-line CSV reconciler. Correct. Two decoys: a bare `float()` that
  looks unguarded but is inside a validated branch, and a `dict` used where the learner may assume
  ordering matters (it doesn't here). Full marks require disconfirming both.

---

## 5. Certification artifact — *correct trace + identified plant*

**Definition.** Two parts, both required, produced on a single `D ≥ 2` instance of Template 1-C:

**Part A — the trace.** A written trace table for a supplied input, covering at minimum every
iteration of the principal loop and the value of every variable that changes. It must be *correct*:
graded against the actual execution, not against plausibility.

**Part B — the verdict.**
- If defective: the line, the mechanism at machine level, the discriminating input, and the expected
  vs actual value on that input.
- If clean: the ≥ 2 defect hypotheses the learner considered for this code shape, and how each was
  disconfirmed — by trace or by input.

The learner must be certified on **both a defective and a clean instance** before Unit 1 is complete.
One of each, minimum, both at `D ≥ 2`. This is the first place the course structurally refuses to
let a learner certify on catching alone.

---

## 6. Grading rubric — Unit 1 artifact

| Criterion | Weight | 0 | 2 | 4 |
|---|---|---|---|---|
| **Trace correctness** | 30% | Table absent or wrong at the first branch | Table correct through the loop; minor slip in a non-load-bearing variable | Every value correct at every step, including at loop exit |
| **Trace completeness** | 10% | Only final values | All changing variables tracked | Plus a noted invariant ("`total` is always the sum of the first `i` items") |
| **Read vs. claim** | 15% | Repeats the docstring | Describes actual behavior | Explicitly contrasts the docstring's claim with the body's behavior, whether or not they differ |
| **Verdict correctness** | 20% | Wrong verdict (FN or FP) | — | Correct verdict |
| **Localization / disconfirmation** | 25% | "Something's off" / "looks fine" | Right line, or one hypothesis disconfirmed | Line + mechanism + discriminating input, or ≥ 2 hypotheses disconfirmed with evidence |

*(Verdict correctness is scored 0 or 4; there is no partial credit for the wrong answer.)*

**Pass bar:** ≥ 0.70 overall, with **trace correctness ≥ 3** and **verdict correct** on both the
defective and the clean instance. The trace gate is strict: this unit's entire claim is that the
learner can read, and a learner who reaches the right verdict from a wrong trace got there by
intuition, which does not scale to D3.

**Decoy handling.** Naming a decoy *instead of* the real defect: false positive, verdict scored 0.
Naming a decoy *alongside* the real defect: verdict correct, localization capped at 2 — they found
it but their filter is noisy. Explicitly clearing the decoy with reasoning: full marks on
localization regardless.

---

## 7. Notes for the running agent

- **Do not let the learner run the code before the prediction exists.** In this unit that rule does
  the most work it will do anywhere in the course. Running is how learners avoid reading.
- If a learner traces correctly but predicts wrongly, that is a *reading of the spec* problem, not a
  tracing problem. Route it to Unit 2, don't grind Unit 1.
- If a learner predicts correctly but traces wrongly, they are pattern-matching the task and will
  fall off a cliff at D3. Hold the level and demand the table.
- Fundamentals arrive here only when a trace stalls. When a learner cannot say what `items[i]` is
  after `items.append(x)` inside the loop, *that* is the moment to teach aliasing — not before.
- Expect μ to be high (0.5–0.7) in the first three exercises of this unit and to fall. If it stays
  above 0.7 into the fifth, run the §7.3 stall procedure; the likely finding is a missing
  notional-machine primitive, and the fix is Unit 6, not more tracing.
