# RUBRICS — cross-cutting grading instruments

Every rubric here is written for an LLM grader. That imposes three constraints, which are met
throughout: level descriptors are **behavioral** (what is present in the text, not how good it
feels); each level has an **example response**; and each rubric ends with **grader traps** —
plausible-looking submissions that should score low, which is where LLM graders fail most often.

Scale for all rubrics: **0 = absent, 1 = attempted, 2 = adequate, 3 = strong, 4 = exemplary.**
Normalize to 0–1 by dividing by 4. Unit rubrics specify which criteria apply and the pass bar.

**Universal grading rules:**
- Grade the *artifact as submitted*. Do not credit understanding the learner displayed verbally
  unless it is in the artifact. The artifact is the certification.
- Length is not quality. A 200-word trail with a mechanism beats a 900-word trail without one.
- Never award a level whose descriptor is not literally satisfied. If it's between 2 and 3, it's 2.
- When you cannot tell, ask one probing question rather than guessing upward.

---

## 1. The judgment trail (all units)

The core artifact. A judgment trail records what the learner intended, what they got, what they
checked, and what they decided.

| Criterion | 0 | 1 | 2 | 3 | 4 |
|---|---|---|---|---|---|
| **1.1 Intent recorded** | No statement of what was wanted | A restatement of the task in the task's own words | Intent in the learner's own words, with at least one detail the task left implicit | Intent plus explicit acceptance criteria, written before generation | Criteria include a named edge case and the reason it matters |
| **1.2 Prediction** | None | "It should work" | Predicts output shape/type | Predicts concrete values for a specific input | Predicts values *and* names an input where they were unsure, before seeing the code |
| **1.3 The read** | Code accepted unread | Summarizes what the code "does" at the level of its docstring | Walks the actual control flow; names variables and their roles | Reads against intent line by line; flags at least one line as "this is the load-bearing one" | Identifies the assumption the code makes that the spec never stated |
| **1.4 Verification** | None, or "it ran" | Ran it on the obvious input | One discriminating input, chosen deliberately, with the expected value stated first | A test or trace that would fail if the suspected defect existed; result reported either way | Multiple checks targeting distinct failure hypotheses, including one that came back negative |
| **1.5 Decision & ownership** | No decision recorded | "Looks good, moving on" | States what was integrated and what was not | States what was integrated, what was rejected, and what remains unverified | Names a specific residual risk they are choosing to accept, and why |

**Example responses (criterion 1.4):**

- *Level 1:* "I ran it and got 47, which seemed right."
- *Level 2:* "The spec says the range is inclusive, so I ran it with a single entry at exactly the
  end boundary (23:59). I expected 300 kcal. I got 300."
- *Level 4:* "Three checks. (a) Boundary — entry at 23:59 exactly; expected 300, got 300, so the
  comparison is inclusive. (b) Empty day — expected 0, got 0, no crash. (c) I suspected the date
  comparison was string-based, which would break across month boundaries, so I tried 2026-09-30 to
  2026-10-01; it behaved correctly, so that hypothesis is dead. The one thing I did not check is
  timezone handling, because the spec doesn't mention timezones — that's my residual risk."

**Pass bar:** mean ≥ 2.4 across the five criteria, with **1.4 ≥ 2** mandatory. A trail with no real
verification does not pass at any average.

**Grader traps.**
- *Fluent narration.* A well-written account of what the code does, with no check performed, is 1.3
  = 3 and 1.4 = 0. Do not let prose quality lift 1.4.
- *Retro-fitted prediction.* If the prediction matches the code's behavior too precisely and was
  recorded after the code was shown, score 1.2 = 0. Check the transcript ordering, not the document.
- *Confessional padding.* "I should have tested more" is not verification. Score what was done.

---

## 2. Evidence quality (feeds `ADAPTIVE-ENGINE.md` §4 scoring)

A compressed 0–1 measure used per exercise, distinct from the full trail rubric.

| Score | Descriptor |
|---|---|
| 0.0 | Verdict with no stated basis |
| 0.25 | Basis is "I ran it" or "it looks like" |
| 0.50 | Names the mechanism but shows no discriminating input or trace |
| 0.75 | Names the mechanism **and** gives an input/trace that demonstrates it |
| 1.00 | Above, plus states what the code *would* have to look like to be correct, or disconfirms a competing hypothesis |

---

## 3. The specification (Unit 2 primary; Units 3, 8, 10 secondary)

Bar from the source outline: **precise enough that a stranger can judge the output against it.**
The grader operationalizes this literally — see the stranger test below.

| Criterion | 0 | 1 | 2 | 3 | 4 |
|---|---|---|---|---|---|
| **3.1 Decidability** | Goals only ("make it good") | Behavior described, but correctness still requires the author's judgment | Every stated requirement is checkable by a third party | Checkable, and each requirement names its observable | Checkable, with the *method* of checking implied by the wording |
| **3.2 Inputs & outputs** | Unspecified | Named informally | Types and shapes given | Types, shapes, and units/format (e.g. "cents as int, not dollars as float") | Plus what happens to inputs that don't conform |
| **3.3 Edge cases** | None | "Handle errors" | ≥ 1 concrete edge case with required behavior | ≥ 3 covering empty / boundary / malformed | Plus an explicit statement of what is *out of scope*, so absence isn't a defect |
| **3.4 Acceptance criteria** | None | Vague success statement | ≥ 2 criteria written before generation, pass/fail as stated | Criteria are one-to-one with testable assertions | Criteria are ordered by what would be worst to get wrong |
| **3.5 Decomposition** (D2+) | Monolithic ask | Split arbitrarily | Split into pieces each independently checkable | Pieces have stated contracts between them | Contracts specify behavior at the seams, including error propagation |

**Stranger test (the grader must actually run this).** Take the learner's spec. Write *two* plausible
implementations that differ in some behavior the spec does not pin down. If both satisfy the spec as
written and they disagree on any input the spec implies is in scope, criterion 3.1 is capped at 2.
Report the disagreeing input to the learner — that is the whole lesson of Unit 2.

**Example responses (criterion 3.1):**

- *Level 1:* "Write a function that ranks players by score."
- *Level 2:* "Write `rank(players)` returning a list of names ordered by score, highest first."
  (Still not decidable: what happens on a tie?)
- *Level 4:* "`rank(players: list[Player]) -> list[str]` returns names ordered by `score` descending.
  Ties are broken by `name` ascending (A before B). Empty input returns `[]`. A player with
  `score=None` is excluded and does not appear. Verify: `rank([])==[]`;
  `rank([('b',5),('a',5)])==['a','b']`; a `None`-scored player is absent from the output."

**Pass bar (Unit 2 certification):** mean ≥ 2.6, with **3.1 ≥ 3** and **3.4 ≥ 2** mandatory. 3.1 is
gated at 3 because the unit's entire claim is decidability; an average cannot buy past it.

**Grader traps.**
- *Verbose vagueness.* Long specs full of "should handle appropriately," "robustly," "as expected"
  score 3.1 = 1 no matter the length. Grep for those words.
- *Spec that is just the code.* A spec restating an implementation is not a spec; it removes the
  freedom the AI needs and hides the requirement. Cap 3.1 at 2 and say why.
- *Edge cases listed without required behavior.* "Handle empty lists" names the case but not the
  contract. That is 3.3 = 1, not 2.

---

## 4. The debugging log (Unit 5 primary; the highest-signal artifact in the course)

Bar: **a diagnosed cause, not a lucky re-prompt.**

| Criterion | 0 | 1 | 2 | 3 | 4 |
|---|---|---|---|---|---|
| **4.1 Reproduce** | No reproduction | "It sometimes fails" | A specific input that fails, reliably | Minimal reproducing input, reduced from the original | Minimal input plus the boundary of the failing class ("fails for any list with ≥ 2 equal keys") |
| **4.2 Isolate** | Whole program suspected | Right file | Right function | Right line or expression, shown by an intermediate observation (print/assert/debugger/trace) | Isolation shown by bisection or by a check that *excluded* another candidate |
| **4.3 Hypothesize** | None | "Something's wrong with the loop" | A stated causal claim about the mechanism | Causal claim that predicts a *specific* other observation | Two competing hypotheses, with the observation that would distinguish them |
| **4.4 Verify the fix** | Changed something, it works now | Re-ran happy path | Test that failed before and passes after | Above, plus a check that the fix didn't break an adjacent behavior | Above, plus a statement of the *class* of inputs now covered, and one still not |
| **4.5 Attribution** | Blames the AI or the tools generically | "The AI got it wrong" | Names what in the prompt/spec/context made this failure likely | Distinguishes model error from spec ambiguity from context omission, with reasoning | Plus a concrete change to their own process to prevent the class |

**Example responses (criterion 4.3):**

- *Level 1:* "I think the loop is broken."
- *Level 3:* "I think `seen` is a module-level dict that persists between calls. If so, calling
  `dedupe()` twice with different inputs should show the *second* call returning fewer items than it
  should — items from the first call being treated as already seen. Let me check that specifically."
- *Level 4:* "Two candidates. (a) `seen` persists between calls. (b) The dict comprehension is
  collapsing keys that compare equal — `1` and `True` hash identically. These predict different
  things: under (a), calling twice with the *same* input gives different results the second time;
  under (b), one call with `[1, True]` already loses an element. I ran the second test first because
  it's cheaper. `[1, True]` returned one element. It's (b)."

**Pass bar (Unit 5 certification):** mean ≥ 2.6, with **4.3 ≥ 3** and **4.4 ≥ 2** mandatory. 4.3 is
gated because a debugging log without a causal hypothesis is a change log.

**Grader traps.**
- *Re-prompt success.* "I asked the AI again with more detail and it fixed it" scores 4.3 = 0
  regardless of the working outcome. This is the single most important trap in the course; the
  learner has produced a working program and learned nothing, which is the competence trap exactly.
- *Post-hoc narrative.* A log written after the fix that presents a clean linear path with no dead
  ends is suspicious. Real debugging has excluded hypotheses. Cap 4.3 at 2 unless at least one
  rejected candidate appears.
- *Fix without cause.* "I added a `.copy()` and it worked" is 4.4 = 2 at best and 4.3 = 1.

---

## 5. The security audit (Unit 9 primary; Unit 10 component)

Bar: **flaws found *and* the reasoning for each.** Findings without reasoning score as guesses.

| Criterion | 0 | 1 | 2 | 3 | 4 |
|---|---|---|---|---|---|
| **5.1 Coverage** | No systematic pass | Skimmed for obvious items | Walked every external boundary (input, file, network, shell, DB, deserialization) | Above, plus data flow traced from each untrusted input to each sink | Above, plus explicit statement of what was *not* audited and why |
| **5.2 Finding quality** | Generic warnings | Names a category without locating it | Locates each finding: file, line, and the class | Plus the concrete attack: the input, and what it achieves | Plus impact ranking and the reason for the ranking |
| **5.3 Reasoning** | "This is insecure" | Cites a rule ("never concatenate SQL") | Explains *why* it's exploitable here, given this code's actual trust boundaries | Explains why, and why the obvious mitigation is or isn't sufficient here | Distinguishes exploitable from defense-in-depth findings, and says which is which |
| **5.4 False positives** | Flags many correct constructs | ≥ 1 clearly-safe construct flagged as a flaw | No false flags, but no evidence of consideration | Explicitly clears ≥ 1 construct that looks unsafe and isn't, with reasoning | Above, and identifies where the code is *already* correctly defended |
| **5.5 Provenance & licensing** | Not considered | Mentions it | Checks whether generated code resembles a known licensed source; states the outcome | Plus an explicit statement of what obligations would attach if it did | Plus a documented decision about attribution/dependencies with reasoning |
| **5.6 Ownership** | Attributes responsibility to the AI | Acknowledges responsibility in the abstract | States what they would sign off on and what they would not | Names what they would need before signing off on the remainder | States the deployment decision and the accountability for it in the first person |

**Example responses (criterion 5.3):**

- *Level 1:* "Line 44 builds a SQL query with an f-string. Never do that."
- *Level 3:* "Line 44 builds the query with an f-string from `request.args['user']`, which is
  attacker-controlled. `'; DROP TABLE sessions; --` would execute because `sqlite3` here uses
  `executescript` on line 47, which permits multiple statements. Parameterizing line 44 fixes it;
  input escaping alone would not, because the same value is reused on line 61 in a `LIKE` clause
  where the escaping rules differ."

**Pass bar (Unit 9 certification):** mean ≥ 2.6 across 5.1–5.4 and 5.6, with **5.3 ≥ 3** mandatory,
and **5.4 ≥ 2** mandatory (over-flagging fails the unit — this mirrors the false-positive discipline
that runs through the whole course). 5.5 is graded but not gated at Unit 9; it is gated at Unit 10.

**Grader traps.**
- *Checklist dump.* A generic OWASP list applied to code it doesn't fit is 5.2 = 1 and 5.3 = 1, even
  if one item happens to land.
- *Shotgunning.* Flagging everything guarantees catching the real flaw. 5.4 exists precisely to
  penalize this and must be applied strictly.

---

## 6. The observer reading (Unit 10 capstone)

Three tiers, from the source outline. Each is scored separately; the capstone requires all three.

**Tier 1 — What the AI did well.**

| 0 | 1 | 2 | 3 | 4 |
|---|---|---|---|---|
| Nothing, or blanket praise | "It was fast" | Names ≥ 2 specific things done well, with location | Explains *why* those were good choices in this context, including one the learner would not have thought of | Plus identifies the class of work where this delegation was clearly correct, and what made it so |

**Tier 2 — Where it misled you, and what that hides.**

| 0 | 1 | 2 | 3 | 4 |
|---|---|---|---|---|
| Nothing, or "it made mistakes" | Names one error | Names ≥ 2 specific misleads with locations | For each, states what *further* problem it would have caused if undetected — the second-order consequence | Plus identifies a mislead the learner initially accepted and only caught later, and says what made it catchable in the end |

Tier 2 level 4 is the highest-value response in the course. A learner who can narrate their own
near-miss has the thing this course is trying to build.

**Tier 3 — What you'd build next and why.**

| 0 | 1 | 2 | 3 | 4 |
|---|---|---|---|---|
| Nothing | "More features" | A concrete next increment | Increment justified by something learned during the build, not by a wishlist | Plus a statement of what they would do differently *in process*, tied to a specific failure in this build |

**Pass bar:** each tier ≥ 2, and **Tier 2 ≥ 3** mandatory. A capstone whose author cannot say where
the AI misled them has either not looked or was not stressed enough — in the latter case, regrade
after serving a harder adversarial pass.

---

## 7. Grader self-check

Run before recording any grade:

- [ ] Did I grade the artifact, or my impression of the learner?
- [ ] Did I award any level whose descriptor is not literally satisfied?
- [ ] Did length or fluency influence a criterion that isn't about writing?
- [ ] For every "found the defect," did I confirm `localization ≥ 2` against the recorded ground
      truth — not against a reading of the learner's answer?
- [ ] For clean exercises, did I grade the *disconfirmation*, not the absence of a claim?
- [ ] If I graded above the learner's demonstrated level, did I ask a probing question first?
- [ ] Have I checked my recent grades for drift? (`TELEMETRY.md` §3.)
