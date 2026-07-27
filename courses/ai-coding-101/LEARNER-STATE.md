# LEARNER-STATE — persistent state schema

One JSON file per learner at `state/<learner_id>.json`. The running agent loads it at session
start, mutates it after every exercise, and writes it at session end **and** after each exercise
(sessions get interrupted).

---

## 1. Schema

```jsonc
{
  "schema_version": "0.2",
  "learner_id": "string",              // opaque; no PII in this file
  "created_at": "ISO-8601",
  "updated_at": "ISO-8601",

  "dimensions": {
    // one entry per code in ADAPTIVE-ENGINE §1: TRACE SPEC LOOP TEST DEBUG FOUND CONTEXT COMPOSE SEC
    "<DIM>": {
      "level": 0,                      // integer 0-5, the D scale
      "n_at_level": 0,                 // exercises completed since entering this level
      "entered_level_at": "ISO-8601",
      "window": [                      // trailing 8 exercise summaries, newest last
        {
          "exercise_id": "string",
          "D": 0, "S": 1,
          "clean": false,
          "decoy": false,
          "score": 0.0,                // ADAPTIVE-ENGINE §4
          "false_negative": false,
          "false_positive": false,
          "localization": 0,           // 0-3; on clean runs this holds clean_justification
          "hint_level_used": 0,        // 0-4
          "time_to_verdict_s": 0
        }
      ],
      "fnr": 0.0,                      // recomputed from window
      "fpr": 0.0,
      "mean_score": 0.0
    }
  },

  "mu_trace": [                        // append-only, one entry per exercise, never truncated
    {
      "exercise_id": "string",
      "at": "ISO-8601",
      "unit": 0,
      "dimension": "TRACE",
      "D": 1, "S": 2,
      "beats_total": 0,
      "beats_disagreement": 0,
      "mu_rate": 0.0,
      "mu_time_s": 0,
      "unresolved_disagreements": 0
    }
  ],

  "loop_discipline": {                 // cross-cutting, not per-dimension
    "predicted_before_prompt_streak": 0,
    "predicted_before_prompt_last8": [true],
    "spec_iterations_total": 0,
    "prompt_rerolls_total": 0,
    "discipline_ratio_last8": 0.0,     // spec_iters / (spec_iters + rerolls)
    "verification_mode_counts": { "none": 0, "ran_it": 0, "traced": 0, "asserted": 0, "tested": 0 }
  },

  "artifacts": [                       // certification artifacts earned
    {
      "unit": 0,
      "artifact_type": "the_catch_explained",
      "earned_at": "ISO-8601",
      "score": 0.0,                    // 0-1 against the unit rubric
      "rubric_version": "0.2",
      "graded_by": "agent",            // or "human"
      "path": "artifacts/<learner_id>/unit-00-catch.md",
      "notes": "string"
    }
  ],

  "current_unit": 0,
  "units_certified": [],

  "clean_run_block": {                 // ADAPTIVE-ENGINE §5.2 — persists across sessions
    "block_size": 5,
    "sequence": [false, true, false, false, true],  // true = clean; pre-shuffled
    "cursor": 2,
    "consecutive_clean": 0,
    "consecutive_defective": 2
  },

  "recent": {                          // anti-repetition buffers, ADAPTIVE-ENGINE §6.7
    "domains": ["inventory", "scheduling", "text-parsing", "grading"],
    "defect_classes": ["off_by_one", "silent_type_coercion", "hallucinated_api"]
  },

  "flags": {
    "needs_human_review": false,
    "coasting_suspected": false,
    "stall_remediations": 0,           // count in current dimension; 2 triggers human review
    "suspected_external_assistance": false,
    "self_reported_prior_experience": false,
    "accessibility_notes": "string"    // e.g. extended time bands; multiplies §3 bands
  },

  "session_log": [
    {
      "session_id": "string",
      "started_at": "ISO-8601",
      "ended_at": "ISO-8601",
      "exercises": ["exercise_id"],
      "ended_on_stall": false,
      "trail_written": true
    }
  ]
}
```

**Invariants the agent must maintain:**

- `window` never exceeds 8 entries; `mu_trace` is never truncated (it is the longitudinal record).
- `fnr`, `fpr`, `mean_score` are always recomputed from `window`, never incremented separately.
- `clean_run_block.cursor` advances exactly once per exercise served, including abandoned ones.
  (Otherwise a learner could abandon exercises to peek at the block.)
- An entry is appended to `mu_trace` even when the exercise is abandoned, with
  `unresolved_disagreements` set. Missing data is data.
- `artifacts` is append-only. A re-attempted unit adds a new entry; it does not overwrite.

---

## 2. Worked example

A learner ~6 sessions in. Strong tracer, weak specifier, currently coasting on `TRACE` and being
watched for it.

```json
{
  "schema_version": "0.2",
  "learner_id": "lnr_7f3a91",
  "created_at": "2026-06-02T14:10:00Z",
  "updated_at": "2026-07-19T18:42:11Z",

  "dimensions": {
    "TRACE": {
      "level": 3, "n_at_level": 5, "entered_level_at": "2026-07-05T16:00:00Z",
      "window": [
        {"exercise_id":"ex_0c11","D":2,"S":3,"clean":false,"decoy":false,"score":0.88,"false_negative":false,"false_positive":false,"localization":3,"hint_level_used":0,"time_to_verdict_s":410},
        {"exercise_id":"ex_0c19","D":3,"S":3,"clean":true,"decoy":true,"score":0.91,"false_negative":false,"false_positive":false,"localization":3,"hint_level_used":0,"time_to_verdict_s":735},
        {"exercise_id":"ex_0c24","D":3,"S":4,"clean":false,"decoy":false,"score":0.84,"false_negative":false,"false_positive":false,"localization":2,"hint_level_used":1,"time_to_verdict_s":1120},
        {"exercise_id":"ex_0c31","D":3,"S":2,"clean":false,"decoy":true,"score":0.95,"false_negative":false,"false_positive":false,"localization":3,"hint_level_used":0,"time_to_verdict_s":300},
        {"exercise_id":"ex_0c38","D":3,"S":3,"clean":true,"decoy":false,"score":0.72,"false_negative":false,"false_positive":false,"localization":1,"hint_level_used":0,"time_to_verdict_s":165},
        {"exercise_id":"ex_0c44","D":3,"S":3,"clean":false,"decoy":false,"score":0.93,"false_negative":false,"false_positive":false,"localization":3,"hint_level_used":0,"time_to_verdict_s":260}
      ],
      "fnr": 0.0, "fpr": 0.0, "mean_score": 0.87
    },
    "SPEC": {
      "level": 1, "n_at_level": 7, "entered_level_at": "2026-06-28T15:20:00Z",
      "window": [
        {"exercise_id":"ex_0b90","D":2,"S":3,"clean":false,"decoy":false,"score":0.41,"false_negative":true,"false_positive":false,"localization":0,"hint_level_used":3,"time_to_verdict_s":1580},
        {"exercise_id":"ex_0c02","D":1,"S":2,"clean":false,"decoy":false,"score":0.58,"false_negative":false,"false_positive":false,"localization":2,"hint_level_used":2,"time_to_verdict_s":690},
        {"exercise_id":"ex_0c15","D":1,"S":1,"clean":true,"decoy":false,"score":0.44,"false_negative":false,"false_positive":true,"localization":0,"hint_level_used":1,"time_to_verdict_s":520},
        {"exercise_id":"ex_0c29","D":1,"S":2,"clean":false,"decoy":false,"score":0.71,"false_negative":false,"false_positive":false,"localization":2,"hint_level_used":1,"time_to_verdict_s":610},
        {"exercise_id":"ex_0c41","D":1,"S":2,"clean":false,"decoy":false,"score":0.76,"false_negative":false,"false_positive":false,"localization":3,"hint_level_used":0,"time_to_verdict_s":480}
      ],
      "fnr": 0.25, "fpr": 1.0, "mean_score": 0.58
    },
    "LOOP":    {"level":2,"n_at_level":3,"entered_level_at":"2026-07-12T17:00:00Z","window":[],"fnr":0.0,"fpr":0.0,"mean_score":0.79},
    "TEST":    {"level":2,"n_at_level":2,"entered_level_at":"2026-07-14T16:30:00Z","window":[],"fnr":0.14,"fpr":0.0,"mean_score":0.81},
    "DEBUG":   {"level":1,"n_at_level":4,"entered_level_at":"2026-07-16T15:00:00Z","window":[],"fnr":0.33,"fpr":0.2,"mean_score":0.62},
    "FOUND":   {"level":1,"n_at_level":6,"entered_level_at":"2026-06-30T14:00:00Z","window":[],"fnr":0.2,"fpr":0.0,"mean_score":0.70},
    "CONTEXT": {"level":0,"n_at_level":0,"entered_level_at":"2026-06-02T14:10:00Z","window":[],"fnr":0.0,"fpr":0.0,"mean_score":0.0},
    "COMPOSE": {"level":0,"n_at_level":0,"entered_level_at":"2026-06-02T14:10:00Z","window":[],"fnr":0.0,"fpr":0.0,"mean_score":0.0},
    "SEC":     {"level":0,"n_at_level":0,"entered_level_at":"2026-06-02T14:10:00Z","window":[],"fnr":0.0,"fpr":0.0,"mean_score":0.0}
  },

  "mu_trace": [
    {"exercise_id":"ex_0c31","at":"2026-07-19T16:05:00Z","unit":3,"dimension":"TRACE","D":3,"S":2,"beats_total":4,"beats_disagreement":1,"mu_rate":0.25,"mu_time_s":95,"unresolved_disagreements":0},
    {"exercise_id":"ex_0c38","at":"2026-07-19T16:40:00Z","unit":3,"dimension":"TRACE","D":3,"S":3,"beats_total":3,"beats_disagreement":0,"mu_rate":0.0,"mu_time_s":0,"unresolved_disagreements":0},
    {"exercise_id":"ex_0c41","at":"2026-07-19T17:30:00Z","unit":3,"dimension":"SPEC","D":1,"S":2,"beats_total":5,"beats_disagreement":3,"mu_rate":0.60,"mu_time_s":240,"unresolved_disagreements":0},
    {"exercise_id":"ex_0c44","at":"2026-07-19T18:20:00Z","unit":3,"dimension":"TRACE","D":3,"S":3,"beats_total":4,"beats_disagreement":0,"mu_rate":0.0,"mu_time_s":0,"unresolved_disagreements":0}
  ],

  "loop_discipline": {
    "predicted_before_prompt_streak": 11,
    "predicted_before_prompt_last8": [true,true,true,true,true,true,true,true],
    "spec_iterations_total": 9,
    "prompt_rerolls_total": 22,
    "discipline_ratio_last8": 0.31,
    "verification_mode_counts": {"none":1,"ran_it":14,"traced":19,"asserted":8,"tested":5}
  },

  "artifacts": [
    {"unit":0,"artifact_type":"the_catch_explained","earned_at":"2026-06-02T15:40:00Z","score":0.74,"rubric_version":"0.2","graded_by":"agent","path":"artifacts/lnr_7f3a91/unit-00-catch.md","notes":"Caught the off-by-one only after being asked what the last element was. Credited at level 2."},
    {"unit":1,"artifact_type":"trace_plus_planted_defect","earned_at":"2026-06-21T16:12:00Z","score":0.86,"rubric_version":"0.2","graded_by":"agent","path":"artifacts/lnr_7f3a91/unit-01-trace.md","notes":"Clean trace, correct mechanism."},
    {"unit":2,"artifact_type":"stranger_judgeable_spec","earned_at":"2026-07-08T17:55:00Z","score":0.68,"rubric_version":"0.2","graded_by":"agent","path":"artifacts/lnr_7f3a91/unit-02-spec.md","notes":"Passed at the bar but barely; acceptance criteria under-specified empty input. Watch SPEC."}
  ],

  "current_unit": 3,
  "units_certified": [0, 1, 2],

  "clean_run_block": {
    "block_size": 6,
    "sequence": [false, true, false, false, true, false],
    "cursor": 4,
    "consecutive_clean": 0,
    "consecutive_defective": 2
  },

  "recent": {
    "domains": ["library-loans", "csv-normalizing", "shift-rota", "unit-conversion"],
    "defect_classes": ["mutation_of_shared_state", "unhandled_edge_case", "wrong_comparison_operator"]
  },

  "flags": {
    "needs_human_review": false,
    "coasting_suspected": true,
    "stall_remediations": 0,
    "suspected_external_assistance": false,
    "self_reported_prior_experience": false,
    "accessibility_notes": ""
  },

  "session_log": [
    {"session_id":"s_014","started_at":"2026-07-19T15:50:00Z","ended_at":"2026-07-19T18:42:00Z","exercises":["ex_0c31","ex_0c38","ex_0c41","ex_0c44"],"ended_on_stall":false,"trail_written":true}
  ]
}
```

### 2.1 What the engine should do with this instance

Reading it against `ADAPTIVE-ENGINE.md`:

- **`TRACE`** — last two μ readings are 0.0 and the third-from-last is 0.25. `mean_score` 0.87,
  localization 3, but `ex_0c38` (clean, decoy-free) scored 0.72 with `clean_justification` = 1 and a
  165 s verdict — under the D3 fast flag of 180 s. That is the **disengaged coast** signature, not
  the under-challenged one, hence `coasting_suspected: true`. Correct action per §7.4: do *not*
  promote to D4. Serve `D3 / S4` **with a decoy**, then name the pattern.
- **`SPEC`** — `fpr` is 1.0 (one clean run, called broken) and `mean_score` 0.58. Not demotable
  (not < 0.50, no double FN at low S), but promotion is blocked by both the score and FPR gates.
  Hold at D1. `discipline_ratio` 0.31 confirms the diagnosis: 22 re-rolls against 9 spec edits — this
  learner fixes prompts, not specs. That is a Unit 3 intervention, and it is the highest-value thing
  to do for this learner right now.
- **`verification_mode_counts`** — `ran_it` at 14 against `tested` at 5 is a Unit 4 flag. Running is
  not verifying.
- **Next serve** per §8: unit 3, weakest eligible dimension is `SPEC` (D1), subtlety sampled from
  {1,2}, clean = `sequence[4]` = `true`. So: a **clean** D1 exercise in a domain not in `recent`.
  Given the FPR of 1.0, this is the exactly right serve — and if they call it broken again, that is
  the finding, not an accident.
