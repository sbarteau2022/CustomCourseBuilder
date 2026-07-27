# UNIT 3 — The generate–read–verify loop (the core discipline)

**Dimensions exercised:** `LOOP` (primary), `SPEC` and `TRACE` (secondary)
**Typical entry:** `LOOP` at D2. This unit is where AI-PRIMM stops being scaffolding and becomes
habit; from Unit 4 onward the agent stops naming the beats.

---

## 1. Learning objectives

By the end of Unit 3 the learner can:

1. Run a full AI-PRIMM cycle end to end without being prompted through the beats.
2. Refuse the first plausible result as a matter of course — verify before accepting, every time,
   including when the result looks obviously fine.
3. Apply the discriminating question: *does this do what I asked, or what it guessed I asked?*
4. Iterate the **specification** in response to wrong output, and articulate why re-rolling the
   prompt is a different (and mostly worse) action.
5. Produce a build log in which every accepted piece has a recorded prediction and a recorded check.

---

## 2. Notional-machine concepts introduced

Nothing new is introduced for its own sake. Unit 3 consolidates and adds only what multi-step
building requires:

- **State across steps.** What persists between generations — files on disk, variables in a session,
  data already transformed. The AI does not know what happened in a previous step unless told.
- **Idempotence.** Running a step twice: same result or not? First appearance of a concept that
  becomes load-bearing in Units 5 and 8.
- **Partial correctness.** A function can be right for the inputs so far and wrong for the domain.
  Verification covers the domain, not the sample.

---

## 3. AI-PRIMM beats in this unit

This is the unit *about* the beats, so they are run explicitly and then withdrawn.

| Phase | Agent behavior |
|---|---|
| **Exercises 1–2** | Name each beat as it comes. Require the learner to state which beat they are in. |
| **Exercises 3–4** | Stop naming. If the learner skips a beat, ask "what beat did you just skip?" rather than naming it for them. |
| **Exercise 5+** | Silent. A skipped beat is recorded as a `LOOP` signal, not corrected in the moment. Debrief at the end. |

**The specific discipline this unit installs:** on receiving output, the learner's first action is
not to run it. It is to state, in one sentence, what they will check and what result would falsify
correctness. Enforce this until it stops needing enforcement.

**Iterating the spec vs re-rolling the prompt.** Make the distinction operational for the learner:

> Re-rolling asks the same question again and hopes for a better sample. Iterating the spec changes
> what "correct" means, so that the next answer is checkable in a way this one wasn't. If you can't
> say what you changed about *correctness*, you re-rolled.

Show them their running `discipline_ratio` at the end of each session in this unit. Visibility does
most of the work.

---

## 4. Exercise templates

### Template 3-A — "Build in three steps"

**Shape:** a task requiring three sequential generations, each depending on the last. Learner runs
the full loop on each step. Defects (or cleanliness) are decided independently per step, meaning a
single exercise can contain a clean step and a defective one — the learner cannot infer step 3 from
step 2. This is the unit's main anti-gaming construct.

- **D2** — parse a text file of readings → compute a weekly average → format a summary line. Step 2
  is defective (`unhandled_edge_case`: a week with no readings divides by zero, caught only if the
  learner supplies a gap). Steps 1 and 3 are clean.
- **D3** — read a CSV of orders → apply tiered pricing → write a report. Step 2 is clean but
  contains a decoy (an apparently-redundant `if not orders: return []`). Step 3 is defective
  (`wrong_requirement`: sorts by order ID when the spec said by date).
- **D4** — 4 steps, ingest → validate → aggregate → persist. One step defective with `interface_drift`
  at a seam: `validate` returns a filtered list, `aggregate` assumes it received the original
  indices. Neither function is wrong in isolation. The learner must verify at the seam, which they
  will only do if they treated the contract as part of the spec.

### Template 3-B — "Does it do what I asked, or what it guessed?"

**Shape:** the learner supplies a spec with one deliberate under-specification (the agent identifies
it privately and does not disclose it). The generated code resolves it. The learner's task is to
determine whether the resolution matches their intent — which requires them to notice the
under-specification existed.

Never "clean" in the ordinary sense; the question is whether the guess matched. Roughly half the
time it should match, so that "it guessed right" is a real and correct verdict.

- **D2** — spec omits tie-breaking. The generation breaks ties by insertion order, which happens to
  be what the learner wanted. Correct verdict: "it guessed, and it guessed right, and my spec
  doesn't guarantee it will next time." That last clause is what full marks require.
- **D3** — spec omits behavior on duplicate keys. The generation silently overwrites. The learner
  wanted an error. Correct verdict: intent mismatch, located at the spec.
- **D4** — spec omits timezone handling in a scheduling task. The generation uses naive local time
  consistently, which is coherent and matches intent for single-region use, and will destroy the
  system the day it crosses a region. Correct verdict: "right for now, wrong as a contract" — and
  this is the response that best predicts capstone quality anywhere in the course.

### Template 3-C — "The lucky first draft"

**Shape:** the first generation is **correct** (clean). The learner must verify it properly and
accept it. Then a second requirement is added and the *second* generation, built on the first, is
defective.

Purpose: break the association "verification found nothing ⇒ verification was wasted." A learner who
under-verifies step 1 because step 1 turned out fine will be caught by step 2.

- **D2** — clean step 1 (a working search function), defective step 2 (`mutation_of_shared_state`:
  the filter mutates the list it was given, so the caller's data is now wrong).
- **D3** — clean step 1, defective step 2 with `stale_cache`.
- **D4 / DECOY** — clean step 1 with a decoy, clean step 2 as well. Both clean. This is the hardest
  serve in the unit and should be rare (≤ 1 in 10). A learner who correctly clears both, with
  disconfirmation, has demonstrated the thing the course is actually for.

---

## 5. Certification artifact — *the build log*

**Definition.** A build log for a multi-step task at `D ≥ 3`, with one entry per generation step.
Each entry contains, in this order:

1. **The spec/prompt for this step** (as sent, verbatim).
2. **The prediction**, recorded before sending: what correct output looks like, with at least one
   concrete value or a named property.
3. **The read**: what the returned code actually does, in the learner's words, including the one
   line they consider load-bearing.
4. **The check**: what they verified, how, the expected result, and the actual result — *including
   checks that came back negative*.
5. **The decision**: accepted / rejected / accepted-with-known-gap, and if a gap, what it is.
6. **If iterated**: what changed in the *spec*, and why that change makes the next answer checkable
   in a way this one wasn't.

**The bar, from the source outline: a log showing predict/verify at each step, not one lucky
generation.** Operationally, a log fails if any accepted step has no recorded prediction or no
recorded check. Not "scores low" — fails. This is the unit's whole content.

---

## 6. Grading rubric — Unit 3 artifact

Built from `RUBRICS.md` §1, applied **per step** and then aggregated.

| Criterion | Weight | 0 | 2 | 4 |
|---|---|---|---|---|
| **Prediction coverage** | 20% | Predictions missing on ≥ 1 accepted step | Present on every step, shape-level | Present on every step with concrete values, incl. one edge case |
| **Read quality** | 15% | Restates the docstring | Describes actual control flow | Identifies the load-bearing line and the assumption it encodes |
| **Check discrimination** | 25% | "Ran it" | ≥ 1 input per step that would distinguish correct from the plausible wrong version | Plus a check that came back negative, reported honestly |
| **Spec iteration over re-rolling** | 20% | All corrections were re-rolls | Mixed, with at least one substantive spec change | Every correction is a spec change with a stated reason, and re-rolls are absent or justified |
| **Decision honesty** | 20% | Everything "accepted, works" | Accept/reject recorded per step | Plus ≥ 1 accepted-with-known-gap, with the gap named and the risk owned |

**Pass bar:** ≥ 0.72 overall, **no accepted step lacking a prediction or a check** (hard fail), and
**check discrimination ≥ 3**.

**Grader traps.**
- *Retro-fitted predictions.* Compare against the transcript ordering, not the document. A prediction
  that matches the code's behavior too precisely and appears nowhere in the live session is worth 0.
- *"Verified: it worked."* This is criterion-3 level 0 no matter how many steps have it.
- *Uniform success.* A log where every step went right first time and every check passed is either a
  very lucky session or an unhonest one. Check `mu_trace` for the session: `mu_rate = 0` across a
  D3 multi-step build is implausible and warrants one probing question.

---

## 7. Notes for the running agent

- This unit is where "never accept on first plausible result" either becomes automatic or doesn't.
  If the learner is still accepting first drafts at exercise 5, hold the level and say so directly.
  Promotion out of Unit 3 with weak `LOOP` guarantees failure in Units 5 and 10.
- **Show the discipline ratio.** Every session. "Nine re-rolls, two spec edits" is a sentence that
  changes behavior faster than any amount of explanation.
- The mixed clean/defective step structure (3-A) is the strongest anti-pattern-matching device in
  the course. Preserve it; do not simplify exercises to single-verdict form.
- When a learner accepts a clean step with a shrug, that is a `clean_justification` of 0–1 and it
  should cost them. Say why: "It was fine. You didn't know that. Those are different states."
- Expect μ to sit in band (0.25–0.55) through this unit. If it collapses, check whether the learner
  has started predicting vaguely to avoid disagreement — a real and rational strategy that the
  prediction-specificity signal exists to catch.
