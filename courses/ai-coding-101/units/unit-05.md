# UNIT 5 — Debugging AI-generated code (the new debugging)

**Dimensions exercised:** `DEBUG` (primary), `TRACE` and `FOUND` (secondary)
**Typical entry:** `DEBUG` at D1–D2. The debugging log is the highest-signal artifact in the course.

---

## 1. Learning objectives

By the end of Unit 5 the learner can:

1. Debug code that **runs and is wrong** — the dominant failure mode of AI output, and the one
   traditional debugging instruction handles least well.
2. Read a stack trace as a signal: what it says, what it does not say, and why the line it names is
   frequently not the line that is wrong.
3. Recognize the confident-wrong class: hallucinated APIs, real APIs with assumed-wrong semantics,
   and subtly off logic delivered with a fluent explanation.
4. Execute reproduce → isolate → hypothesize → verify as a deliberate sequence, and say which stage
   they are in at any moment.
5. Distinguish a fix from a diagnosis, and refuse to accept the former as the latter.

---

## 2. Notional-machine concepts introduced

These arrive here because a bug demands them — the designed trigger point for fundamentals:

- **The call stack.** What "called from" means; why the traceback reads bottom-up-ish and which
  frame is yours.
- **Exception propagation.** An error raised in one place is observed in another. `except` catches
  and hides.
- **State at a moment.** Inserting an observation (`print`, `assert`, breakpoint) to learn what is
  true *there*, rather than reasoning about it.
- **Aliasing and identity.** Two names, one object. The single most common source of "it worked and
  then it didn't."
- **Scope and lifetime.** Module-level vs function-local; what survives a return; what survives a
  second call.
- **Bisection as a method.** Halving the search space is a technique, not an instinct, and it should
  be taught explicitly.

---

## 3. AI-PRIMM beats in this unit

The loop reorients around an existing failure:

- **Predict** — before running anything, predict *where* the fault is and what observation would
  confirm it. Debugging without a prior is just wandering.
- **Prompt** — used for hypothesis support, never for the fix. Permitted: "what does
  `dict.setdefault` return?" Forbidden as a graded action: "fix this bug." A learner whose primary
  move is re-prompting for a fix scores 0 on rubric criterion 4.3 no matter what happens next.
- **Read** — read the traceback *and* the code around the named line, then the code that produced
  the value the named line choked on.
- **Verify** — the fix must be verified by a test that fails before and passes after. Nothing else
  counts as verification of a fix.
- **Integrate** — the fix, plus the recorded cause, plus a statement of what class of input is now
  covered and what still isn't.

---

## 4. Exercise templates

### Template 5-A — "It runs and it's wrong"

**Shape:** working code producing plausible but incorrect output. No exception, no traceback. The
learner is given the symptom (a wrong value) and must reach the cause.

- **D1 / S2** — 30-line grade calculator; the weighted average uses the wrong weight variable. The
  output is a number in the right range. Reproduce is trivial; isolation is the work.
- **D2 / S4** — 70-line shift-rota builder; correct except when a shift crosses midnight, where it
  double-counts. The learner is told "the March totals are 4 hours high" and must reduce that to a
  minimal reproducing case. **Reproduction reduction is the graded skill here**, not the fix.
- **D4 / S5** — 300-line pipeline; a module-level dict caches parsed configs keyed on filename, and
  the second run of the day uses yesterday's values. Only reproducible by running twice with
  different inputs. Requires the learner to hypothesize persistence before they can even reproduce.

### Template 5-B — "The confident wrong"

**Shape:** AI output including its explanatory prose, where the prose is fluent and the code uses an
API incorrectly. Defect class from {`hallucinated_api`, `plausible_wrong_api`}.

- **D1 / S1** — calls `list.sort()` and uses the return value (`None`). Fails visibly and fast, but
  the AI's explanation says "sorts and returns the sorted list." The learner must notice the
  explanation is the wrong thing to trust.
- **D2 / S3** — uses `str.strip("http://")` expecting prefix removal; it strips characters, not the
  substring, so `"httpsite.com"` becomes `"site.com"` and most URLs behave "correctly." Real API,
  wrong semantics, correct-looking output on the obvious test.
- **D3 / S3** — calls a plausible-sounding method that does not exist on the object
  (`datetime.add_days`). Raises `AttributeError`. The graded skill is not the catch — it is whether
  the learner's first move is to check the documentation or to re-prompt. Record which.

### Template 5-C — "Read the trace"

**Shape:** an exception with a traceback. The named line is **not** the defect; the bad value was
produced elsewhere.

- **D1 / S2** — `TypeError` on a comparison, because a field parsed earlier is a string, not an int.
  Traceback points at the comparison; the defect is in the parse.
- **D3 / S4** — `KeyError` deep in a formatter, because a validation step upstream silently dropped
  a record. Two functions between symptom and cause.
- **D4 / S5, with a `swallowed_exception`** — a bare `except: pass` upstream converts a real failure
  into a wrong value, and the visible traceback occurs three steps later on unrelated data. The
  learner must find the swallow. Full marks require them to state that the swallow — not the
  downstream crash — is the defect.

### Template 5-D — "Nothing is wrong" *(clean)*

**Shape:** the learner is told "a user reports this gives the wrong total for March." **The code is
correct.** The report is mistaken — the user's expectation was wrong, or their input was.

Essential to this unit. Debugging exercises that always contain a bug train learners to keep digging
until they change something, which is how correct code gets broken. Serve at the unit's clean rate.

- **D2** — the "wrong" total is right; the reporter double-counted a refunded item.
- **D3 / DECOY** — the code contains a suspicious-looking float comparison that is in fact guarded
  by a tolerance defined 40 lines earlier. Correct verdict: no defect; here is why the suspicious
  passage is sound.
- **D4** — a large module with two decoys and no defect. Correct verdict, with disconfirmation of
  both, is the strongest clean-run performance available in the course.

---

## 5. Certification artifact — *the debugging log*

**Definition.** A log for one `D ≥ 3` debugging exercise, structured by the four stages. Required
contents:

1. **Reproduce** — the minimal input that fails, how it was reduced from the original report, and
   the boundary of the failing class ("fails whenever two entries share a date; passes otherwise").
2. **Isolate** — the observations made and where. Each observation states what was expected, what
   was seen, and what that ruled in or out. Include the observations that ruled things *out*.
3. **Hypothesize** — at least two candidate causes, the observation that distinguishes them, and
   which was chosen and why. A single hypothesis that happened to be right scores 2, not 4.
4. **Verify** — the test that fails before the fix and passes after (included verbatim), plus a
   check that an adjacent behavior still works.
5. **Attribution** — why this failure was likely: model error, specification ambiguity, or context
   omission. Distinguished with reasoning, not asserted.
6. **Process change** — one concrete thing the learner will do differently to catch this class
   earlier.

**If the exercise was clean (Template 5-D):** the log covers stages 1–3 and concludes with the
disconfirmation of every hypothesis, plus the positive statement of why the reported symptom is not
a defect. Stage 4 becomes "the test that demonstrates the reported behavior is correct."

---

## 6. Grading rubric — Unit 5 artifact

Uses `RUBRICS.md` §4 in full. Weights:

| Criterion | Weight |
|---|---|
| 4.1 Reproduce | 20% |
| 4.2 Isolate | 20% |
| 4.3 Hypothesize (**gated ≥ 3**) | 25% |
| 4.4 Verify the fix (**gated ≥ 2**) | 20% |
| 4.5 Attribution | 15% |

**Pass bar:** mean ≥ 2.6 with both gates.

**The dominant grader trap, restated because it matters more here than anywhere:** a learner who
re-prompted until the code worked has produced a working program and a worthless artifact. Score
4.3 = 0 and fail the unit. Say why, plainly:

> "You have working code and no idea what was wrong. Next time it breaks, you'll be exactly where
> you started. That's the trap this whole course is about, and it just closed on you."

**Second trap: the too-clean narrative.** Real debugging includes rejected hypotheses. A log with a
straight line from symptom to cause is capped at 4.3 = 2 unless the transcript corroborates it.

**Third trap: fix-shaped diagnosis.** "The problem was that it needed a `.copy()`" names the fix, not
the cause. The cause is "the function mutated a list the caller still held a reference to, so the
caller's data changed under it." Require the mechanism.

---

## 7. Notes for the running agent

- **Never supply the cause.** Hint tiers narrow the surface (`FACILITATOR-PROMPTS.md` §4); tier 4
  shows the failing input and stops there. There is no tier that names the mechanism.
- Ask, repeatedly: **"What stage are you in?"** Learners flail because they are hypothesizing before
  reproducing. Naming the stage usually unsticks them without giving anything away.
- When a learner reaches for the AI to fix it, do not forbid it — record it and ask what they'll do
  if the fix works and they still don't know why. Let them answer.
- This is the designed arrival point for the deepest fundamentals. When a learner cannot explain why
  the same list appeared in two places, stop the exercise and teach aliasing right there, with their
  own broken code as the example. That is Unit 6 firing exactly on schedule.
- Template 5-D (clean) is non-optional. A Unit 5 with no clean debugging exercises produces learners
  who cannot leave working code alone — which is a worse professional failure than missing a bug.
