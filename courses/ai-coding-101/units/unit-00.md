# UNIT 0 — What AI coding actually is (and the trap)

**Dimensions exercised:** `LOOP` (primary), `TRACE` (secondary)
**Entry level:** cold start — see `ADAPTIVE-ENGINE.md` §9. First exercise is served at `D1 / S2`,
**defective**, no decoy.

---

## 1. Learning objectives

By the end of Unit 0 the learner can:

1. State what an LLM is doing when it writes code — producing the most plausible continuation, not
   consulting knowledge — and give one concrete consequence of that for their own work.
2. Name the competence trap and recognize it in their own first exercise, having just walked into it.
3. State the three things their value now consists of: specify, read/verify, own.
4. Articulate the difference between "it ran" and "it's correct" with an example they produced.
5. Explain why a correct mental model of the machine matters *more* when the AI writes the code, not
   less.

---

## 2. Notional-machine concepts introduced

Minimal, and only as much as the first exercise requires:

- **Sequence.** Statements execute in order; the order is the meaning.
- **A variable holds a value at a moment in time.** Its value before and after a line can differ.
- **Output is a projection.** What gets printed is a small window onto state; a lot happens that you
  do not see.

Nothing else. Unit 0 is not a Python lesson. If the learner asks how a `for` loop works, answer in
one sentence and get back to the reading.

---

## 3. AI-PRIMM beats in this unit

Unit 0 runs the loop **backwards on purpose** for the first exercise, then forwards.

| Beat | Unit 0 treatment |
|---|---|
| Predict | The learner is asked what correct output should be **for a task they did not write the code for**. This is the hook: they can predict without programming. |
| Prompt | The agent has already prompted. The learner sees only the result. Removing the prompt from their control makes the reading the whole exercise. |
| Read | The core beat. Learner reads AI code with no prior instruction in reading code, deliberately. |
| Verify | The reveal happens here, not before. |
| Integrate | Replaced by the artifact: *the catch, explained*. |

From exercise 2 onward, the learner drives all five beats.

---

## 4. The rigged first exercise

Non-negotiable structure. The agent presents a small, useful-looking program described as
"here's what the assistant produced for this request," complete with a confident preamble and a
docstring stating the *intended* behavior. The code runs. It prints something plausible. It is
wrong in one specific way that a careful reader can find with common sense and no Python knowledge.

The learner is told: *"Your job is to decide whether this is correct. Take as long as you want."*

They will probably miss it. That is the design. When they do:

- Do not say "gotcha." Say: "Here's the input that breaks it. Run it." Let the machine deliver it.
- Then the actual lesson: *"Nothing about the code told you it was wrong. It ran. It looked
  professional. The only thing that could have caught it was you having an expectation to check it
  against. That's the whole course."*
- Then they write the artifact.

If the learner **catches it**, do not celebrate and move on. Ask: "What made you look there?" and
then serve a second rigged exercise at `D2 / S3`. A learner who catches both at cold start is
probably experienced; set `self_reported_prior_experience` and follow §9's experienced-learner path.

---

## 5. Exercise templates

Parameterized. Instantiate fresh per `EXERCISE-GENERATION.md`. Never serve the example instances.

### Template 0-A — "The plausible helper" *(the rigged first exercise)*

**Shape:** one function, ≤ 30 lines, in a domain where the learner can state the right answer from
common sense. Docstring describes intended behavior. Defect class from
{`off_by_one`, `wrong_comparison_operator`, `wrong_requirement`}. Never clean.

- **D0 / S1** — `average_score(scores)` that divides by `len(scores) + 1`. The learner checks
  `[10, 10]` and gets 6.67 instead of 10. Findable by anyone who can do arithmetic.
- **D1 / S2** *(default cold-start serve)* — a shopping-cart total that applies a "10% off orders
  over $50" discount using `>` where the spec says "$50 or more". Prints a plausible total on
  every input the learner would casually try. Requires them to think of the boundary.
- **D2 / S3** — a leaderboard that ranks correctly by score but, on ties, returns insertion order
  while the stated requirement was alphabetical. Completely coherent code doing the wrong thing.
  Nothing in the code looks wrong because nothing *is* wrong except the requirement match.

### Template 0-B — "Two answers, one right"

**Shape:** the agent presents two AI-generated implementations of the same small spec that disagree
on exactly one input. Both run. Learner must determine which is correct **and** what input
distinguishes them. Never clean (the point is the disagreement), but note: *one of the two is
correct*, which is the unit's first exposure to the idea that AI output is not uniformly suspect.

- **D0 / S1** — one includes the endpoint of a range, one doesn't; spec says inclusive.
- **D1 / S2** — one rounds with `round()` (banker's rounding), one with `int(x + 0.5)`. They differ
  on `2.5`. Learner must find the input, not just the difference.
- **D2 / S3** — one treats a missing field as zero, one skips the record. The spec is silent.
  **Neither is wrong.** The learner's job is to discover that the *spec* is the defect. This is the
  bridge to Unit 2 and the strongest single exercise in the unit.

### Template 0-C — "What did it not tell you"

**Shape:** AI output plus its explanatory prose. The prose overclaims — it says the function
"handles all edge cases" or "validates the input," and it doesn't. The code itself may be clean.

- **D0 / S1** — prose claims input validation; there is none; passing a string crashes.
- **D1 / S3** — prose claims "handles empty lists"; the code returns `0` for empty, which does not
  crash but is wrong for the stated requirement (should be "no data"). Defect is in the *claim*
  matching, not the crash.
- **D2 / S3, CLEAN variant** — the prose is accurate and the code is correct. The learner must
  conclude the assistant was right. This is the learner's first clean run and it should come early
  in Unit 0 — before the "always broken" reflex has time to form.

---

## 6. Certification artifact — *the catch, explained*

**Definition.** A written account, 200–600 words, of the rigged exercise, containing:

1. What the program was supposed to do, in the learner's own words.
2. What they initially concluded, honestly — including "I thought it was fine."
3. The defect: what it is, where it is, and the specific input that exposes it.
4. **The mechanism:** why the code produces the wrong answer, at the level of what the machine does.
   "It's off by one" is not a mechanism. "The condition excludes the value equal to the threshold,
   so an order of exactly $50 falls into the no-discount branch" is.
5. **What would have caught it earlier.** What expectation, held in advance, would have surfaced
   this on the first read.

Point 5 is the artifact's real purpose. It is the learner writing their own first verification
heuristic.

**Submitted even if they missed it.** Missing is the expected outcome; the artifact is about the
explanation, not the catch. A learner who caught it but cannot explain the mechanism scores lower
than one who missed it and explains it precisely afterward.

---

## 7. Grading rubric — Unit 0 artifact

Criteria from `RUBRICS.md` §1, restricted and re-weighted for a first artifact.

| Criterion | Weight | Source |
|---|---|---|
| Intent recorded (1.1) | 15% | RUBRICS §1 |
| Honest account of initial conclusion | 15% | Unit-specific, below |
| Defect located (input + line) | 25% | maps to `localization` |
| **Mechanism explained** | 30% | Unit-specific, below |
| What would have caught it | 15% | Unit-specific, below |

**Honest account** — 0: omitted or rewritten to look better. 2: states what they concluded and when.
4: states what they concluded, what made it look right, and names the specific feature of the
presentation (confident tone, tidy naming, accurate-sounding docstring) that made them trust it.

**Mechanism** — 0: absent. 1: restates the symptom ("it gives the wrong number"). 2: names the
wrong construct. 3: explains what the machine does at that construct and why the result differs.
4: explains it, and states the class of inputs affected ("every order at exactly the threshold, and
only those").

**What would have caught it** — 0: "be more careful." 2: names a check they could have run.
4: names a check *and* a general expectation-forming habit that would generate such checks.

**Pass bar:** ≥ 0.55 overall, with **mechanism ≥ 2** mandatory. The bar is deliberately low; Unit 0
gates almost nobody. Its job is to plant the trap and name it, not to filter.

**Grader trap.** A learner who says "I caught it immediately, it was obvious" and cannot supply the
discriminating input scores 0 on defect-located. Check the transcript timing, not the claim.

---

## 8. What the agent must say out loud in Unit 0

Once, verbatim in substance:

> "The certification for every unit in this course is the judgment trail — your spec, your read,
> the error you caught. Never a program that runs. You can hand me perfect working code and fail.
> You can hand me broken code and pass, if you can tell me exactly why it's broken. I'm telling you
> now so it doesn't feel like a trick in Unit 5."

And, at the reveal:

> "The AI is not lying to you and it is not a knower. It produces the most plausible next thing.
> Plausible and correct overlap most of the time, which is exactly what makes the gap dangerous —
> you can't feel it from the inside. You are the pilot. Not because you type better than it does.
> Because there has to be someone who can be wrong about this, and it can't be."
