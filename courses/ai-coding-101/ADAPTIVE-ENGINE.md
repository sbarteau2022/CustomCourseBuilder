# ADAPTIVE-ENGINE — how the agent decides what to serve next

This file is executable policy. Every number in it is accompanied by a reason. Where a number is
a guess, it says so.

---

## 1. Skill dimensions

Difficulty is tracked **per dimension**, not as one course-wide level. A learner can be D3 at
tracing and D1 at specification; that is normal and the engine must not average it away.

| Code | Dimension | Primary units |
|---|---|---|
| `TRACE` | Reading code, hand-tracing, predicting output | 1, 6 |
| `SPEC` | Turning intent into a decidable specification | 2, 3 |
| `LOOP` | Running AI-PRIMM without prompting; iterating spec not prompt | 0, 3 |
| `TEST` | Writing discriminating tests; tests as executable specs | 4 |
| `DEBUG` | Reproduce → isolate → hypothesize → verify on generated code | 5 |
| `FOUND` | Notional machine: state, control flow, data, types, references | 6 |
| `CONTEXT` | Diagnosing bad output as a context failure; directing multi-step work | 7 |
| `COMPOSE` | Architecture, integration, holding a map of untyped code | 8 |
| `SEC` | Security, provenance, licensing, ownership | 9 |

Each dimension carries a level `D0–D5` and a confidence (`n` observations at current level).

---

## 2. The difficulty scale (D0–D5)

Levels are defined by **observable properties of the artifact and the task**, not by how hard it
feels. Any two graders reading the same exercise should agree on its level.

| Level | Code size | Structure | Where a defect can live | Verification the learner must produce | Scaffolding |
|---|---|---|---|---|---|
| **D0 — Guided** | ≤ 15 lines, one function | Straight-line or single loop, no imports | On one visible line; effect appears in the first printed output | Hand-trace of ≤ 8 steps, or a single asserted value | Agent supplies the prediction template and names the beats |
| **D1 — Basic** | 15–40 lines, 1–2 functions | Standard library only, no I/O beyond print | Inside one function; visible from that function alone | Unaided prediction + one discriminating input | Beats named, prediction unaided |
| **D2 — Applied** | 40–80 lines, 2–4 functions | One data structure of consequence (dict/list-of-dicts); simple file or stdin I/O | Across a caller/callee contract, or in an edge case not exercised by the obvious input | ≥ 2 test cases, at least one boundary | Agent names beats only |
| **D3 — Integrated** | 80–200 lines, 2–3 modules | Real dependency (e.g. `json`, `csv`, `datetime`, `sqlite3`, `requests`), persistent state | Emerges from *interaction*: ordering, shared mutable state, second invocation, encoding boundary | A written test that fails before the fix and passes after | None; learner drives the loop |
| **D4 — Systemic** | 200–500 lines, 3+ modules | Layered app (parse → transform → persist → report) | Latent: manifests only on a specific input distribution, on the Nth call, or under concurrency-free but stateful reuse. **≥ 1 decoy required** (see §6) | Test suite + a written explanation of the failure mechanism | None; agent answers only clarifying questions about requirements |
| **D5 — Adversarial** | Real repo scale (> 500 lines) or the learner's own capstone | Multi-concern, includes at least one external boundary (network, shell, DB, file upload) | **Unknown count, 0–2 defects.** Security and provenance dimensions live. ≥ 1 decoy required | Full judgment trail + suite + threat reasoning | None; time-boxed; oral defense follows |

**Independent dial: defect subtlety `S1–S5`.** Size and subtlety are orthogonal — a 15-line function
can hide an S4 defect. Full definitions in `EXERCISE-GENERATION.md` §3. Summary:

- `S1` — visible on reading the line in isolation (`range(1, n)` when `range(1, n+1)` was specified).
- `S2` — visible on reading the function (wrong variable used, inverted comparison).
- `S3` — visible only against the spec (does the right thing to the wrong thing; correct algorithm, wrong requirement).
- `S4` — visible only on a specific input class (empty collection, duplicate key, tz boundary, unicode, float accumulation).
- `S5` — visible only across invocations or at a system boundary (mutable default, shared cache, resource leak, ordering assumption, TOCTOU).

Legal `(D, S)` pairs: `S ≤ D + 1`, and `S ≥ D - 2`. Rationale: an S5 defect in a 15-line D0 exercise
is unfair (the learner has no surface to find it on), and an S1 defect at D4 is noise the learner
will find by accident, teaching nothing. The band leaves 2–3 legal subtleties per level, which is
enough for randomization.

---

## 3. Signals read off learner behavior

Recorded per exercise. All are observable by the running agent without instrumentation beyond the
transcript.

| Signal | Type | How measured | Why it matters |
|---|---|---|---|
| `predicted_before_prompt` | bool | Did a concrete prediction exist before the prompt was sent? | The single most diagnostic behavior in the course. Learners who stop doing this are regressing regardless of scores. |
| `prediction_specificity` | 0–3 | 0 = none; 1 = "it should work"; 2 = named shape/type; 3 = concrete values incl. an edge case | Distinguishes ritual compliance from real prediction. |
| `time_to_verdict_s` | seconds | From code presented to committed verdict (clean / defective + location) | Compared to the level's band (§4). |
| `false_negative` | bool | A planted defect was not found | Miss. |
| `false_positive` | bool | Clean code declared defective, or a correct line named as the defect | Crying wolf. Graded equally. |
| `localization` | 0–3 | 0 = "something's wrong"; 1 = right function; 2 = right line; 3 = right line + mechanism + failing input | Anti-gaming core. Only 2+ counts as a catch. |
| `spec_iterations` | int | Edits to the spec/acceptance criteria after first generation | Numerator of the discipline ratio. |
| `prompt_rerolls` | int | Regenerations without a spec change | Denominator partner. Re-rolling is the anti-pattern. |
| `discipline_ratio` | 0–1 | `spec_iterations / (spec_iterations + prompt_rerolls)`, undefined if both 0 | Unit 3's whole point, made numeric. |
| `verification_mode` | enum | `none` / `ran_it` / `traced` / `asserted` / `tested` | `ran_it` alone never counts as verification. |
| `μ_rate`, `μ_time` | float | Per `COURSE-SPEC.md` §4 | Difficulty calibration, not grading. |
| `hint_level_used` | 0–4 | Highest hint tier reached (`FACILITATOR-PROMPTS.md` §4) | Score is discounted by hint level (§4). |

**Time-to-verdict bands** (median target, per level). Used to detect both flailing and
rubber-stamping:

| Level | Fast flag (< ) | Target band | Slow flag (> ) |
|---|---|---|---|
| D0 | 30 s | 1–4 min | 8 min |
| D1 | 45 s | 2–6 min | 12 min |
| D2 | 90 s | 4–12 min | 25 min |
| D3 | 3 min | 10–25 min | 45 min |
| D4 | 6 min | 20–50 min | 90 min |
| D5 | 15 min | 45–120 min | session cap |

A verdict delivered under the fast flag is treated as **unverified** regardless of correctness: the
learner is asked "what did you check?" and the answer determines whether it counts. This closes the
guess-fast-and-be-right loophole; being right by luck at D3 in 40 seconds is not evidence.

Bands are estimates from reading-speed reasoning (roughly 1–2 minutes of careful reading per 20
lines of unfamiliar code, plus verification time), **not** from data. Flag for revision after the
first 50 learners.

---

## 4. Scoring an exercise

Per exercise, per dimension exercised:

```
raw = 0.40 * correctness_of_verdict      # 1.0 correct, 0.0 FN or FP
    + 0.35 * (localization / 3)          # 0 on clean runs → see below
    + 0.25 * evidence_quality            # rubric, 0–1, from RUBRICS.md §2
score = raw * hint_discount              # 1.00, 0.90, 0.75, 0.55, 0.35 for hint levels 0–4
```

On a **clean** exercise, `localization` is replaced by `clean_justification` on the same 0–3 scale:
0 = "looks fine"; 1 = re-ran it; 2 = named what could have gone wrong and showed it doesn't; 3 =
named ≥ 2 plausible defect hypotheses for this code shape and disconfirmed each with a specific
input or trace. This is essential — otherwise the optimal strategy on a clean run is silence.

Scores are held per dimension in a trailing window of the last 8 exercises.

---

## 5. Clean-run mix policy

**Why this exists.** If every exercise contains a defect, the rational learner learns "say it's
broken," and the assessment measures compliance rather than judgment. Clean runs make the verdict
a real decision. False-positive rate is graded alongside false-negative rate; neither dominates.

### 5.1 Base rates by level

| Level | Clean-run probability | Reason |
|---|---|---|
| D0 | 0.20 | Early on, the learner needs enough hits to learn what a defect looks like at all. Too many clean runs at D0 teaches nothing. |
| D1 | 0.25 | Ramp. |
| D2 | 0.30 | The mode-switch point: this is where learners start pattern-matching "exercise ⇒ bug," so the rate rises to break it. |
| D3 | 0.35 | |
| D4 | 0.35 | |
| D5 | 0.30, and defect *count* is 0–2 rather than 0–1 | At D5 the uncertainty should be about *how many*, not just whether. |

Overall course-wide clean rate lands near 0.30. Chosen because: below ~0.20 the "always say broken"
strategy has positive expected value under any reasonable scoring, and above ~0.40 the course
spends more than a third of its exercise budget not teaching defect recognition, which is the
scarcer skill.

### 5.2 Making it unpredictable

Simple i.i.d. coin-flipping is exploitable: learners count. Use **variable-block randomization**:

1. Draw a block size `B ∈ {3, 4, 5, 6, 7}` uniformly.
2. Set clean count `C = round(B × p_level)`, then jitter: `C ← C + Δ`, `Δ ∈ {-1, 0, 0, +1}` uniform,
   clamped to `[0, B-1]`. (`B-1` not `B`: never an all-clean block, which would read as a bug in
   the platform.)
3. Shuffle `C` clean and `B - C` defective exercises within the block.
4. Never announce block boundaries. Never let two blocks be reasoned about jointly — do not, e.g.,
   compensate a clean-heavy block with a defect-heavy one. Compensation is exactly the regularity
   learners detect.

**Additional constraints:**
- Never more than 2 consecutive clean runs (reads as broken to the learner and wastes budget).
- Never more than 4 consecutive defective runs (that is the calibration failure we are preventing).
- If the learner asks "was that one clean?" — answer truthfully *after* the verdict is committed,
  never before, and never about the *next* one.

### 5.3 Grading both error directions

Maintained per dimension over a trailing 8-exercise window:

- `FNR = false_negatives / defective_exercises_seen`
- `FPR = false_positives / clean_exercises_seen`

Both appear on the learner's dashboard and both gate promotion (§6). Certification at any unit
requires `FPR ≤ 0.25` — a learner who calls correct code broken one time in three has not
demonstrated judgment, they have demonstrated a policy.

---

## 6. Anti-gaming provisions

1. **Verdicts must be localized.** "There's a bug" scores 0. `localization ≥ 2` (right line) is
   required for a catch to count. This defeats blanket-suspicion.
2. **Clean runs demand positive evidence.** See §4's `clean_justification`. Silence is not a pass.
3. **Decoys.** Mandatory at D4/D5, permitted 30% of the time at D2/D3: a passage that *looks* wrong
   (unusual idiom, redundant guard, surprising-but-correct arithmetic) and is correct. Naming a
   decoy as the defect is a false positive even on an exercise that also contains a real defect.
   This is the sharpest instrument we have against pattern-matching.
4. **Generated, never banked.** Every exercise is instantiated fresh (`EXERCISE-GENERATION.md`).
   Two learners on the same lesson get different domains, different defect classes, different
   subtlety. Answer-sharing transfers nothing except the meta-strategy, which is what we want them
   to have anyway.
5. **Fast-verdict challenge.** Under the fast flag (§3), the learner must say what they checked
   before the verdict is scored.
6. **Prediction is gated, not scored on truth.** A wrong prediction costs nothing. Not having one
   blocks the prompt. Otherwise learners write vague predictions to protect their score.
7. **No repeat defect class within 3 exercises** for the same learner, and no repeat *domain*
   within 4. Prevents both boredom and short-horizon pattern-matching.
8. **Retrieval check on artifacts.** If a learner submits a judgment trail markedly above their
   demonstrated level, the agent asks one probing question about a specific line before accepting
   it (`FACILITATOR-PROMPTS.md` §6). This is the only plagiarism control we have and it is weak;
   say so rather than pretend otherwise.

---

## 7. Promotion, demotion, and the μ bands

### 7.1 Promotion

Promote dimension `X` from `D_n` to `D_{n+1}` when **all** hold over the trailing window:

- ≥ 3 exercises at `D_n` in dimension `X`, of which ≥ 1 was clean and ≥ 2 were defective.
- Mean `score ≥ 0.80`.
- `FNR ≤ 0.20` and `FPR ≤ 0.25` at this level.
- `hint_level_used ≤ 1` on the most recent 2.
- `predicted_before_prompt` true on all 3.
- `μ_rate ≤ 0.55` on the most recent 2 (they are not drowning).

*Why 3 and not 5:* at 3 observations with a 0.80 mean, the chance of promoting a learner whose true
ability is below the bar is meaningful but the cost is low — demotion (§7.2) is fast and cheap, and
under-challenge is the more corrosive failure (§7.4). We optimize for responsiveness and accept
some churn. *Why the clean/defective composition requirement:* three catches in a row says nothing
about false-positive rate.

### 7.2 Demotion

Demote from `D_n` to `D_{n-1}` when **any** holds:

- Mean `score < 0.50` over the last 3 at this level.
- Two consecutive false negatives on defects at `S ≤ D_n - 1` (missing things that should be easy
  for this level).
- `μ_rate ≥ 0.70` on 3 consecutive exercises *and* `μ_time` above the level's slow flag — sustained
  drowning.
- `predicted_before_prompt` false twice in a row. (Behavioral regression is demoted before it
  becomes a score problem.)

Demotion is never framed as punishment. Script in `FACILITATOR-PROMPTS.md` §5.

### 7.3 Stall (μ stays high)

`μ_rate ≥ 0.70` sustained means the learner's model and the AI's output disagree constantly and the
learner cannot resolve which is right. Do **not** simply demote and continue. Run this remediation:

1. **Diagnose the axis.** Serve one D-1 exercise at `S1`. If they catch it cleanly, the problem is
   size/complexity → hold `D` down but keep `S`. If they miss it, the problem is the notional
   machine → route to Unit 6.
2. **Unit 6 injection.** Serve the specific `FOUND` micro-lesson matching the missed mechanism
   (state / control flow / aliasing / types). Fundamentals arrive exactly here — this is the
   designed trigger, not an exception.
3. **Rebuild with a clean run.** After remediation, serve a clean exercise at `D_{n-1}`. A learner
   in stall is primed to see defects everywhere; a clean run they correctly clear is the fastest way
   to recalibrate.
4. If μ remains ≥ 0.70 after two remediation cycles in the same dimension, flag
   `needs_human_review` in learner state. The agent should not grind a learner indefinitely.

### 7.4 Coast (μ collapses to zero)

`μ_rate ≤ 0.10` over 3 consecutive exercises means the learner is never surprised. Two readings,
and they are distinguishable:

- **Genuinely under-challenged** — scores high, verdicts fast but justified, localization 3.
  → Promote immediately, skipping the 3-observation requirement (this is the one override), and
  raise `S` by 1 as well as `D`.
- **Disengaged / rubber-stamping** — scores high on *clean* runs and mediocre on defective ones,
  time-to-verdict under the fast flag, `clean_justification ≤ 1`.
  → Do not promote. Serve a defective exercise at current `D` with `S = D + 1` and a decoy. Then
  name it directly: "You've cleared the last four without checking anything. Here's one where that
  cost you." Coasting is more dangerous than stalling because it *is* the competence trap
  reasserting itself inside the course.

Zero μ for more than 3 exercises is always a system failure, never a learner success.

---

## 8. The next-serve decision (executable)

```
def next_serve(state):
    # 1. Which unit? Lowest-numbered unit whose certification artifact is not earned.
    unit = first_uncertified_unit(state)

    # 2. Which dimension? Weakest dimension among those the unit exercises,
    #    unless that dimension was exercised in the last 2 serves (avoid grinding).
    dim = weakest_eligible_dimension(unit.dimensions, state, cooldown=2)

    # 3. Level: current level for that dimension.
    D = state.dimensions[dim].level

    # 4. Subtlety: sample from legal band {max(1,D-2) .. min(5,D+1)},
    #    weighted toward D (weight 3) and D-1 (weight 2), others weight 1.
    S = weighted_sample(legal_subtleties(D))

    # 5. Clean? From the current variable block (§5.2). Not an independent coin flip.
    clean = block.next()

    # 6. Decoy? Mandatory if D >= 4. Otherwise P=0.30 at D in {2,3}, P=0 below.
    decoy = (D >= 4) or (D >= 2 and rand() < 0.30)

    # 7. Domain: sample from domain pool excluding the last 4 domains used.
    domain = sample_domain(exclude=state.recent_domains[-4:])

    # 8. Defect class: sample from classes legal for this unit AND this S,
    #    excluding the last 3 classes used. Ignored if clean.
    defect = None if clean else sample_defect_class(unit, S, exclude=state.recent_defects[-3:])

    return ExerciseSpec(unit, dim, D, S, clean, decoy, domain, defect)
```

Every field of the returned `ExerciseSpec` is recorded in state *before* the learner sees the
exercise, so that grading cannot drift toward whatever the learner happened to say.

---

## 9. Cold start

No prior state. The first session is Unit 0, whose first exercise is **rigged**: the AI produces
subtly wrong working code and the learner's job is to notice. Serve at `D1 / S2`, defective,
no decoy, with the beats named explicitly.

Why D1/S2 rather than D0/S1: at D0/S1 a total beginner may catch it by luck and learn nothing about
the trap; at D1/S2 the modal outcome is a miss, which is the intended pedagogical experience of
Unit 0. The miss is not graded punitively — Unit 0's certification artifact is *the catch,
explained*, and the learner gets there after the reveal, not before it.

After the Unit 0 exercise, initialize all dimensions to `D1` except `FOUND`, `CONTEXT`, `COMPOSE`,
and `SEC`, which start at `D0` because they have no prior exposure at all. Then let §7 move them.

If the learner self-reports prior programming experience: initialize `TRACE` and `FOUND` at `D2`
and immediately serve a `D2/S3` verification exercise. If they fail it, drop to `D1` with no
comment. Self-report is a hint, never an entitlement.

---

## 10. Session shape

- **Session length:** 3–6 exercises, or 90 minutes, whichever comes first. Beyond ~6, verdict
  quality degrades and the μ signal becomes noise about fatigue.
- **Opening:** one exercise at `D_current - 1` in the strongest dimension. Warm-up, and it produces
  a clean read of whether today's learner is at their baseline.
- **Closing:** the learner writes the judgment trail entry for the session before ending. If the
  session ends without a written trail, no artifact credit is awarded for that session — the trail
  *is* the artifact (`COURSE-SPEC.md` §5).
- **Never** end a session on a stall. If the last exercise was a miss with high μ, serve one
  `D-1 / S1` exercise to close, regardless of the schedule. Ending on failure predicts non-return,
  and there is no learning from a course you quit.

---

## 11. Known weaknesses in this engine

Stated plainly so they are not discovered as surprises.

1. **All thresholds are reasoned, not fitted.** 0.80 promote / 0.50 demote / 3 observations / the
   time bands — every one is a defensible guess. They need to be refit against real distributions
   after the first cohort. Do not present them as validated.
2. **The trailing-8 window is short.** It responds fast, which we want, but FPR computed over ~2–3
   clean runs is a very noisy estimate. The `FPR ≤ 0.25` gate is therefore closer to "did they cry
   wolf on the last clean one" than to a real rate. Accepted for responsiveness; revisit.
3. **μ is agent-observed.** It depends on the running LLM honestly recording disagreement beats,
   including disagreements it caused. Grader drift here is invisible from inside the session. See
   `TELEMETRY.md` §3.
4. **The coast/stall distinction leans on `clean_justification`,** which is the softest-graded
   signal in the system. A verbose learner can inflate it.
5. **Difficulty ratchet risk:** promotion is easier (3 observations) than demotion (3 observations
   *plus* a sustained pattern). Over a long course this biases upward. `TELEMETRY.md` §4 makes this
   a monitored failure mode rather than a fixed one, because tightening promotion would slow the
   engine's responsiveness, which is its main virtue.
