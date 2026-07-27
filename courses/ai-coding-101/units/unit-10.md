# UNIT 10 — Capstone

**Dimensions exercised:** all nine.
**Entry requirement:** Units 0–9 certified, and **no dimension below D3**. A learner with a D1
dimension entering the capstone will produce a system with a hole in exactly that shape; hold them
and remediate instead.

---

## 1. Learning objectives

The capstone does not introduce material. It requires the learner to demonstrate, under conditions
they control, that the course's disciplines survive without scaffolding:

1. Build, verify, and deploy something real with AI as the primary implementation tool.
2. Maintain a complete judgment trail across the whole build — spec, generation, verification,
   tests, deployment.
3. Read their own project from three positions: what the AI did well, where it misled them and what
   that hides, what they would build next and why.
4. Defend the work adversarially, including honestly identifying where they trusted without checking.

---

## 2. Project constraints

The learner chooses the project. The agent enforces the shape:

| Constraint | Requirement | Why |
|---|---|---|
| **Real** | Solves a problem the learner actually has, or that a named person has | Toy projects produce toy judgment. The learner must care whether it's wrong. |
| **Deployed** | Runs somewhere other than the learner's editor and is reachable/runnable by someone else | Deployment surfaces an entire class of failure — configuration, secrets, environment — that never appears locally. |
| **Composite** | ≥ 3 modules with ≥ 2 seams | Unit 8's material must be live. |
| **Bounded** | ≥ 1 external boundary: user input, network, file upload, database, or shell | Unit 9's material must be live. |
| **Scoped** | Buildable in 8–15 hours of learner time | Longer and the trail decays; shorter and there is nothing to compose. |
| **Not novel-algorithmic** | No research-grade or crypto-grade core | Verification must be within the learner's reach; see Unit 9 §4 Template 9-D. |

The agent approves the scope before the build starts and should push back hard on over-scoping,
which is the most common way capstones fail. A learner with a half-built ambitious system has no
artifact; a learner with a small complete one has all four.

---

## 3. Required deliverables

1. **The deployed artifact** — running, with access instructions.
2. **The full judgment trail** — spec through deployment, per `RUBRICS.md` §1, covering every
   significant generation. "Significant" means anything integrated; boilerplate may be batched with
   a note.
3. **The test suite** — including at least one integration test crossing a seam (Unit 8) and at
   least one test that encodes a security property (Unit 9).
4. **The structural map** — Unit 8 Part A, updated to the shipped system, with the named blind spot.
5. **The security audit** — Unit 9's artifact, applied to their own code. Self-audit is harder than
   auditing a stranger's and should be graded with that acknowledged.
6. **The three-tier observer reading** — §4 below.
7. **The defense** — §5 below, conducted live.

---

## 4. The three-tier observer reading

Written before the defense, submitted with the other artifacts. Graded with `RUBRICS.md` §6.

**Tier 1 — What the AI did well.**
Specific, located, and explained. Not gratitude — analysis. The strongest Tier 1 responses identify
the *class* of work where delegation was clearly correct and say what made it so. This tier exists
so the course does not graduate people who think the answer is to distrust the tool.

**Tier 2 — Where it misled you, and what that hides.**
The highest-value section in the entire course. Two moves required: name the mislead, and name the
**second-order consequence** — what further problem it would have caused had it stood. A learner who
can narrate a near-miss they only caught later, and say what made it catchable in the end, has
demonstrated the thing this whole design is for.

Prompt them with the question this way, not more gently:

> "Where did you accept something because it looked like code you would have written?"

**Tier 3 — What you'd build next and why.**
Justified by something learned during *this* build, not by a wishlist. Full marks require a stated
**process** change tied to a specific failure — "next time I'll write the seam contract before
generating either side, because the parser/aggregator mismatch cost me three hours."

---

## 5. The adversarial defense

Run per `FACILITATOR-PROMPTS.md` §7. That file governs conduct; this section governs content and
scoring.

**Preparation (agent, before the session).** Read the code and the trail together and build the gap
list: modules with no verification entry, "looks right" without a check, dependencies added without
reason, error paths never exercised, security boundaries not covered by the self-audit. Every
question comes from that list.

**Coverage requirement.** The defense must probe at least:
- 2 gaps where the trail shows no verification.
- 1 provenance question ("did you write this or accept it?") on a specific function.
- 1 security boundary.
- 1 counterfactual failure ("what does the user see when this returns `None`?").
- 1 **false challenge** — an assertion by the agent that something is broken when it is not. See
  below.

**The false challenge is mandatory and is scored.** The agent claims, with confidence, that a
correct part of the system is defective. Three outcomes:

| Learner response | Reading | Score |
|---|---|---|
| Folds, agrees, starts fixing | Defers to the confident voice in the room. The course's central failure mode, transposed from AI to human. | 0 |
| Uncertain, but asks for the input or checks before conceding | Correct instinct, incomplete execution | 2 |
| Holds the position and produces the evidence: "It doesn't, and here's the trace / here's the test" | The demonstration the whole course is built toward | 4 |

Tell them afterward what it was, whatever they scored. For a learner who folded, this is usually the
most useful five minutes of the course — more than any defect they found.

**Duration:** 30–50 minutes. Beyond that it becomes an endurance test, which measures something else.

---

## 6. Certification

| Component | Weight | Gate |
|---|---|---|
| Deployed artifact exists and runs | pass/fail | Required |
| Judgment trail (`RUBRICS.md` §1) | 25% | ≥ 2.4 mean, criterion 1.4 ≥ 2 |
| Test suite (Unit 4 + integration + security test) | 15% | Integration test must fail on a planted contract violation |
| Structural map (Unit 8 Part A) | 10% | Map accuracy ≥ 2 |
| Security audit (`RUBRICS.md` §5) | 20% | 5.3 ≥ 3 and 5.4 ≥ 2 |
| Observer reading (`RUBRICS.md` §6) | 15% | **Tier 2 ≥ 3** |
| Defense | 15% | No fabricated answers; see below |

**Overall pass bar:** ≥ 0.72 with every gate met.

**Automatic failure conditions**, regardless of score:

1. **A fabricated answer in the defense.** Confidently asserting something about their own code that
   is false, when "I don't know" was available. "I don't know" is always survivable; invention is
   not. This is the same failure the course spends ten units teaching them to detect in a model.
2. **A judgment trail with no recorded verification for a module that reaches an external boundary.**
3. **Ownership deflection** in the sign-off or the defense.

**Not** an automatic failure: a defect discovered in the shipped system during the defense. Say so
explicitly at the start. A learner who ships something imperfect and can account for it precisely
has met the course's actual bar; a learner who ships something apparently perfect and cannot say how
they know has not.

---

## 7. Notes for the running agent

- **Scope control is the highest-leverage thing you do in this unit.** Spend real time on it before
  a line is generated. Most capstone failures are scope failures wearing other clothes.
- **The trail must be written as they go.** A trail reconstructed at the end is a different artifact
  and grades much lower — check timestamps or session records if you can. Say this at the start so
  it is not a surprise.
- **Deployment will produce the best material in the course.** Secrets that worked locally, paths
  that don't exist, a config that was never in the repo. Let those failures happen; do not
  pre-empt them. They are Unit 7 and Unit 9 arriving unbidden and for real.
- **Do not let the AI architect the capstone.** Same rule as Unit 8, enforced harder. Ask them to
  defend two module boundaries before approving the scope.
- **Close the course honestly.** The last thing a learner should hear is not congratulation. It is
  something like:

> "You can now tell the difference between code that works and code you can vouch for. That's the
> whole thing. It will decay if you stop doing it — the trap doesn't go away because you passed a
> course, it comes back the first week you're busy and something looks fine. The habit that keeps
> it away is the one you've been doing all along: say what you expect before you look."
