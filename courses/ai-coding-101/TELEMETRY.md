# TELEMETRY — how we know this is working

Written for whoever operates the platform, not for the session agent. The course makes a strong
claim (that it avoids the competence trap) on no evidence. This file is the instrument for finding
out whether the claim is true, and the list of ways it will look true when it isn't.

---

## 1. Event stream

One event per exercise, emitted at grading. Flat, append-only.

```jsonc
{
  "event": "exercise_completed",
  "at": "ISO-8601",
  "learner_id": "lnr_7f3a91",
  "session_id": "s_014",
  "exercise_id": "ex_0c44",
  "cohort": "string",                 // for A/B comparisons
  "unit": 3, "dimension": "TRACE",
  "D": 3, "S": 3,
  "clean": false, "decoy": true, "defect_class": "float_accumulation",
  "domain": "invoice-line-items",
  "predicted_before_prompt": true, "prediction_specificity": 3,
  "time_to_verdict_s": 260, "fast_flagged": false,
  "verdict_correct": true, "false_negative": false, "false_positive": false,
  "localization": 3, "clean_justification": null,
  "verification_mode": "tested",
  "spec_iterations": 2, "prompt_rerolls": 1,
  "hint_level_used": 0,
  "evidence_quality": 0.75,
  "score": 0.93,
  "mu_rate": 0.0, "mu_time_s": 0, "unresolved_disagreements": 0,
  "grader": "agent", "grader_model": "string", "rubric_version": "0.2",
  "generator_model": "string",
  "level_change": null                // "promote" | "demote" | null
}
```

Plus `artifact_graded`, `unit_certified`, `session_started/ended`, and `exercise_abandoned` events
with the same identifying fields.

**Retain the full `mu_trace` forever.** It is the only longitudinal record and it is small.

---

## 2. Headline metrics

Compute per cohort, weekly.

| Metric | Definition | Healthy | Alarm |
|---|---|---|---|
| **FNR by level** | Missed defects / defective served, per D | 0.10–0.25 | < 0.05 (too easy) or > 0.40 (too hard) |
| **FPR by level** | Clean called broken / clean served | 0.05–0.20 | > 0.30 |
| **FPR − FNR gap** | Signed | ±0.10 | \|gap\| > 0.20 — learners have a *policy*, not judgment |
| **μ band occupancy** | % of exercises with `mu_rate ∈ [0.25, 0.55]` | > 55% | < 35% |
| **Prediction compliance** | % with `predicted_before_prompt` | > 90%, and **not declining** | any 3-week decline |
| **Discipline ratio** | `spec_iters / (spec_iters + rerolls)`, cohort median | rising with unit number; > 0.5 by Unit 5 | flat or falling |
| **Verification mode mix** | share of `tested` + `asserted` | > 40% by Unit 4 | `ran_it` > 50% after Unit 4 |
| **Localization on catches** | share with `localization = 3` | > 50% by Unit 5 | < 25% |
| **Hint dependence** | mean `hint_level_used` | ≤ 1.0, falling | rising within a level |
| **Level churn** | promote/demote events per 10 exercises | 0.5–1.5 | > 2.5 (thrashing) or < 0.2 (stuck) |
| **Time-to-verdict vs band** | share inside band | > 60% | Recalibrate the bands, not the learners |

**The one metric that matters most:** FPR and FNR should fall *together*. If FNR falls while FPR
rises, learners have become more suspicious, not more skilled — that is the course teaching
paranoia, and it is a real risk of this design.

---

## 3. Grader drift

The agent grades its own generated exercises. That is a closed loop and it will drift.

**Detection:**
1. **Golden set.** Maintain 30 frozen exercise+response pairs with human-assigned scores, spanning
   levels and both error directions. Re-grade the set on every model or rubric change. Drift of
   > 0.10 mean absolute error against the human scores blocks the rollout.
2. **Score distribution monitoring.** Track mean and variance of `score` per level per week. A
   rising mean with falling variance is inflation, not improvement. Alarm on variance below 0.10.
3. **Cross-grading.** Sample 5% of artifacts and grade with a second agent instance blind to the
   first. Report inter-grader agreement (quadratic-weighted κ). Below κ = 0.6, the rubric criterion
   causing the disagreement needs rewriting — treat it as a rubric defect, not a grader defect.
4. **Generator/grader separation.** Where the platform can afford it, generate and grade with
   separate model instances that do not share the ground-truth record until grading. The single
   agent knowing the answer while probing is the largest source of unintentional leakage.
5. **Clean-run leakage test.** Compare mean agent turn-length, question count, and probe depth on
   clean vs defective exercises. They should be statistically indistinguishable. If they aren't, the
   agent is telling learners the answer through its behavior and every FPR number is contaminated.

---

## 4. Failure modes to watch for, named in advance

**4.1 Learner games the clean-run mix.**
*Signature:* verdicts correlate with position-in-block; time-to-verdict collapses; learner
volunteers meta-commentary ("it's been three broken ones, this one's clean").
*Detection:* regress `verdict` on `position_in_block`; any significant coefficient means the block
policy has become predictable.
*Response:* increase block-size variance, raise decoy rate, and — the real fix — increase
`clean_justification` weight so guessing "clean" without disconfirmation scores near zero anyway.

**4.2 Grader drift.** See §3. *Signature:* rising scores, falling variance, unchanged FNR.

**4.3 Difficulty ratchet that only goes up.**
Acknowledged as a structural bias in `ADAPTIVE-ENGINE.md` §11.5 — promotion needs 3 observations,
demotion needs 3 *plus* a pattern.
*Signature:* distribution of `D` drifts upward while `score` drifts down and `hint_level_used`
rises; demotion events under 20% of promotion events cohort-wide.
*Response:* if the promote:demote ratio exceeds 5:1 over a cohort, the demotion rules are too
conservative. Do not fix this per-learner; fix the thresholds and refit.

**4.4 Paranoia training.** FNR down, FPR up. See §2. This would mean the course produces people who
distrust all AI output, which is not judgment — it is a different way of not thinking.
*Response:* raise clean rate for affected learners to 0.45 temporarily and grade
`clean_justification` hard. If the pattern is cohort-wide, the clean-run policy itself is wrong.

**4.5 Trail theater.** Learners produce beautiful judgment trails describing verification they did
not perform.
*Signature:* high artifact scores alongside low `verification_mode` quality and short
time-to-verdict. The two should correlate; when they decouple, the writing has become the deliverable.
*Response:* grade 1.4 (verification) from the *transcript*, not from the trail document. The rubric
already says this; enforcement is the issue.

**4.6 Domain leakage / answer sharing.**
*Signature:* an exercise's median time-to-verdict for a given `(domain, defect_class)` pair falling
over calendar time across unrelated learners.
*Response:* this is why generation is parameterized. If it appears anyway, the generator has
collapsed to a small number of templates — check generator output diversity directly.

**4.7 The course produces critics, not builders.**
The unproven claim from `COURSE-SPEC.md` §7, and the most important thing to measure.
*Signature:* strong `TRACE`/`DEBUG`/`SEC` scores with capstones that are small, derivative, and
risk-averse; Tier 3 observer readings that score ≤ 2.
*Detection:* track capstone scope (modules, external boundaries, novel requirements) against
verification scores. Negative correlation is the alarm.
*Response:* unknown. This one may require changing the course, not the parameters. Flag it loudly
if seen; do not quietly tune around it.

---

## 5. What would falsify the course

Stated as pre-registration, so it cannot be explained away later.

1. If learners who certify through Unit 10 perform no better at detecting defects in *unseen* AI
   output than an untrained control with equivalent Python exposure, the core mechanic fails.
2. If FPR does not fall between Unit 2 and Unit 9, the clean-run mechanic teaches nothing and should
   be replaced rather than tuned.
3. If capstone quality correlates with hint dependence rather than with verification behavior, the
   adaptive engine is measuring persistence, not skill.
4. If a 6-month follow-up shows certified learners have reverted to accepting AI output unread, the
   course transfers within the harness and not outside it — which would be a real result and should
   be published as one.

None of these have been tested. Until they are, the honest description is: a well-reasoned design
with an instrumented plan to find out whether it works.
