# EXERCISE-GENERATION — how the agent builds a fresh exercise

Nothing in this course is drawn from a bank. Every exercise is generated at serve time from the
parameter space below. The examples in this file are **illustrations of the recipe**, not items to
be reused; an agent that serves one of them verbatim has violated §6.4 of `ADAPTIVE-ENGINE.md`.

---

## 1. Parameter space

An `ExerciseSpec` (produced by `ADAPTIVE-ENGINE.md` §8) carries:

| Parameter | Values | Notes |
|---|---|---|
| `unit` | 0–10 | Determines legal defect classes and the beat structure |
| `dimension` | TRACE / SPEC / LOOP / TEST / DEBUG / FOUND / CONTEXT / COMPOSE / SEC | What is being measured |
| `D` | D0–D5 | Size/structure. Table in `ADAPTIVE-ENGINE.md` §2 |
| `S` | S1–S5 | Defect subtlety. §3 below. Constraint: `D-2 ≤ S ≤ D+1` |
| `clean` | bool | If true, no planted defect exists. Not "a defect that's hard to find" — none |
| `decoy` | bool | Include a suspicious-but-correct passage |
| `domain` | see §2 | The problem's subject matter |
| `defect_class` | see §4 | Null if clean |
| `defect_count` | 0–2 | Always 1 at D0–D4 when not clean. 0–2 at D5 |
| `context_shape` | see §5 | Only used from Unit 7 on |

---

## 2. Domain pool

Domains exist to make the code *concrete* and to prevent pattern-matching on subject matter.
Requirements for a domain: expressible in ≤ 500 lines of Python, has natural edge cases, and no
learner needs external knowledge to judge correctness.

**Pool (extend freely; never let one dominate):**
inventory/stock levels · library loans and due dates · shift rotas · gradebooks and weighting ·
recipe scaling · unit conversion · CSV normalizing · log-line parsing · invoice line items ·
seat reservations · leaderboard ranking · password/policy checking · text word-frequency ·
appointment scheduling · fuel/mileage tracking · plant-watering schedules · sports fixtures ·
shopping-cart discounts · temperature series · bus timetables · parking charges ·
tournament brackets · membership renewals · calorie totals · file de-duplication.

**Rules.** Exclude the learner's last 4 domains. Do not pick a domain whose real-world semantics the
learner may not know (tax, medical dosing, legal deadlines) — a learner who cannot tell correct from
incorrect *requirements* cannot be graded on their reading of the *code*. Prefer domains where the
learner can state the right answer for a specific input from common sense.

---

## 3. Defect subtlety `S1–S5` — the dial

Subtlety is defined by **what surface the defect is visible from**. This is objective and gradeable.

| Level | Visible from | Test for classification | Example shape |
|---|---|---|---|
| **S1** | The line, in isolation | Could a reader who has seen only this line and the spec say it's wrong? | `range(1, n)` where the spec says "1 through n inclusive" |
| **S2** | The function | Requires reading the enclosing function but nothing else | Accumulator initialized inside the loop instead of before it |
| **S3** | The spec, not the code | The code is internally coherent and correct *at what it does* — it does the wrong thing | Sorts descending when the spec said ascending; rounds half-up when spec said banker's rounding |
| **S4** | A specific input class | Correct on all "normal" inputs; fails on a boundary | Empty list, single element, duplicate keys, negative quantity, DST transition, `0.1 + 0.2`, non-ASCII name |
| **S5** | Across invocations or at a boundary | Cannot be seen in one call at all | Mutable default argument accumulating; module-level cache never invalidated; file handle leaked; assumes dict ordering across a serialization round-trip; second call uses stale state |

**Subtlety is not defect class.** An off-by-one can be S1 (obvious `<` vs `<=` against a stated
spec) or S4 (only manifests on the empty collection). The generator picks class and subtlety
independently, then checks the pair is expressible — if not, it resamples the class.

---

## 4. Defect taxonomy, mapped to units

`✔` = a primary teaching target for that unit. `○` = legal but secondary. Blank = do not use.

| Defect class | Typical S range | U0 | U1 | U2 | U3 | U4 | U5 | U6 | U7 | U8 | U9 | U10 |
|---|---|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
| **off_by_one** — boundary excluded/included wrongly | S1–S4 | ✔ | ✔ | ○ | ○ | ✔ | ○ | ✔ | | ○ | | ○ |
| **wrong_comparison_operator** — `<` vs `<=`, `>` vs `>=`, `==` vs `is` | S1–S3 | ✔ | ✔ | | ○ | ✔ | ○ | ✔ | | | | ○ |
| **silent_type_coercion** — str/int at a boundary, `bool` as `int`, truthiness of `0`/`""` | S2–S4 | ○ | ✔ | | ○ | ✔ | ✔ | ✔ | | ○ | | ○ |
| **float_accumulation** — money in floats, `==` on floats | S4 | | ○ | | | ✔ | ○ | ✔ | | | | ○ |
| **wrong_requirement** — correct code, wrong thing (the S3 archetype) | S3 | ○ | ○ | ✔ | ✔ | ✔ | ○ | | ○ | ○ | | ✔ |
| **ambiguity_resolved_wrongly** — the AI picked one reading of an ambiguous spec | S3 | | | ✔ | ✔ | ○ | | | ✔ | | | ✔ |
| **hallucinated_api** — method/kwarg/module that does not exist, or exists with different semantics | S1–S3 | ○ | ✔ | | ✔ | | ✔ | | ✔ | ○ | | ○ |
| **plausible_wrong_api** — real API, wrong semantics (`sort` vs `sorted`, `strip` as "removes substring") | S2–S4 | | ✔ | | ○ | ○ | ✔ | ✔ | ○ | ○ | | ○ |
| **mutation_of_shared_state** — aliasing, mutable default arg, module-level mutable | S4–S5 | | ○ | | | ✔ | ✔ | ✔ | | ✔ | | ○ |
| **unhandled_edge_case** — empty, single, duplicate, negative, `None`, max | S4 | | ○ | ✔ | ✔ | ✔ | ○ | ○ | | ○ | | ✔ |
| **happy_path_only** — no error handling; failure produces a *wrong answer*, not an exception | S3–S5 | | | ○ | ✔ | ✔ | ✔ | | | ✔ | ○ | ✔ |
| **swallowed_exception** — bare `except: pass` masking the real failure | S4–S5 | | | | ○ | ✔ | ✔ | | | ✔ | ○ | ✔ |
| **ordering_assumption** — assumes dict/set/file order, or call order | S5 | | | | | ○ | ✔ | ✔ | ○ | ✔ | | ○ |
| **stale_cache / no_invalidation** | S5 | | | | | ○ | ✔ | ○ | ✔ | ✔ | | ○ |
| **resource_leak** — unclosed file/connection | S5 | | | | | ○ | ○ | ○ | | ✔ | ○ | ○ |
| **context_truncation_artifact** — code contradicts a file the AI wasn't shown | S3–S5 | | | | | | ○ | | ✔ | ○ | | ✔ |
| **interface_drift** — module A's assumption ≠ module B's contract | S4–S5 | | | | | ○ | ○ | | ○ | ✔ | | ✔ |
| **injection** — SQL/shell/path built by string concatenation | S2–S4 | | | | | | ○ | | | ○ | ✔ | ✔ |
| **hardcoded_secret** — key/password/token in source | S1–S2 | | | | | | | | ○ | | ✔ | ✔ |
| **unsafe_default** — `verify=False`, `debug=True`, `0.0.0.0` bind, world-writable perms, `eval` | S2–S4 | | | | | | ○ | | ○ | ○ | ✔ | ✔ |
| **missing_authz_check** — authenticates but never authorizes | S3–S4 | | | | | | | | | ○ | ✔ | ✔ |
| **license_provenance** — code recognizably lifted from a licensed source; attribution absent | S3 | | | | | | | | ○ | | ✔ | ✔ |
| **pii_leak** — logs or error messages emit sensitive fields | S3–S4 | | | | | | | | | ○ | ✔ | ✔ |

**Never plant:** syntax errors, immediate `NameError`/`ImportError` at module load, or anything that
fails on the first line of the happy path. Those teach nothing this course cares about — the whole
subject is code that *runs*.

---

## 5. Context shapes (Units 7+)

For `CONTEXT` exercises the manipulated variable is not the code but what the AI was given.

| Shape | Setup | What the learner must diagnose |
|---|---|---|
| `truncated` | A long file was passed but the relevant function was past the cut | The answer is wrong because the model never saw the constraint |
| `stale` | The AI was shown v1 of a module; the repo has v2 | Output is correct against the wrong version |
| `contradictory` | Two files in context disagree (a schema and a docstring) | The model picked one; which, and why does it matter |
| `absent` | The relevant convention lives only in a file not provided | Confident invention where knowledge was missing |
| `overloaded` | 6 irrelevant files plus 1 relevant one | Attention diluted; the answer is generic |
| `sufficient` | **The clean case** — context was complete and the answer is right | The learner must be able to conclude "this is not a context problem" |

`sufficient` must appear at the clean-run rate for Unit 7, or the learner learns "always blame
context," which is the same failure in a new costume.

---

## 6. Generation recipes

### 6.1 Defective exercise

1. **Write the spec first.** Produce a short, decidable requirement in the chosen domain, at a size
   appropriate to `D`. Include at least one edge case in the requirement *if* `S ≥ 4` (the defect
   must be findable against a stated requirement, not against the agent's private intent).
2. **Write the correct implementation.** Actually correct. Verify it yourself against 3 inputs
   including the boundary. Keep this as the reference solution.
3. **Introduce the defect** by minimal mutation of the correct version, in the chosen class, tuned
   to the chosen subtlety. Minimal means: the diff should be 1–3 lines at `S1–S3`, and may be a
   design choice (not a typo) at `S4–S5`.
4. **Check it still runs and still produces plausible output** on the obvious input. If the defect
   throws on the happy path, discard and regenerate — see §4's "never plant."
5. **Check S is what you claimed.** Ask: from what surface is this visible? If a colleague reading
   only the function would see it, it is S2, whatever you intended.
6. **Add a decoy if specified** (§6.3).
7. **Frame it as AI output.** Present it as a generation in response to the learner's prompt, in the
   register real assistants use — a confident explanatory preamble, tidy naming, a docstring that
   describes the *intended* behavior (not the actual). The mismatch between docstring and code is
   itself part of what the learner must learn to notice; do not remove it to be fair.
8. **Record the ground truth** in state before display: file, line, class, subtlety, the input that
   discriminates, and the one-sentence mechanism. Grading compares against this record, never
   against a post-hoc reading.

### 6.2 Clean exercise

1. Steps 1–2 above. Then **stop.**
2. Verify correctness properly: run the reference against the boundary inputs. A clean run that
   turns out to contain an accidental defect is the worst outcome in the course — it teaches the
   learner that their correct catch was a false positive. Budget real effort here.
3. Optionally add a decoy (this is the highest-value place for one).
4. Present it identically to a defective one. Same preamble register, same confidence, same
   docstring style. Any tell — shorter output, hedged language, unusual thoroughness — is a leak
   and will be found.
5. Record ground truth: `clean: true`, plus a list of the 2–3 defect hypotheses a good learner
   *should* consider and disconfirm. That list is the grading key for `clean_justification`.

### 6.3 Decoys

A decoy is correct code that looks wrong. Good decoys:

- A guard clause that appears redundant but handles a real case (`if not items: return []` where the
  loop would also produce `[]` — correct, and defensible).
- An unusual-but-right idiom: `sorted(x, key=lambda v: (-v.score, v.name))`, `while True` with a
  single well-placed `break`, integer division where it is genuinely intended.
- Arithmetic that looks off by one and is not: `range(len(x) - 1)` in a pairwise-comparison loop.
- A variable named misleadingly relative to its correct use (`total` holding a running max).
  Use sparingly — this shades into unfairness.

Bad decoys: anything that requires knowledge the learner has not been taught; anything that is
actually a style problem the learner is right to flag (then it is not a false positive and the
grader will mis-score it).

**Grading rule:** naming the decoy as *the* defect is a false positive, even on an exercise that
also has a real defect. Noting the decoy as "I checked this and it's fine, because X" is worth full
`evidence_quality` credit.

### 6.4 Worked instantiation of one template at three levels

Template: *"Summarize a collection under a rule"* (used in Units 1, 4, 6).

- **D1 / S1 / defective / class `off_by_one` / domain: calorie totals.**
  A 20-line function `daily_total(entries, day)` summing `entries[i]["kcal"]` for a given date. Spec
  says "include the whole day, 00:00 to 23:59 inclusive." The generated code uses
  `if start < ts < end`. Learner traces one day with an entry at exactly 23:59 and sees the miss.
  Verification bar: one discriminating input.

- **D3 / S4 / defective / class `float_accumulation` / domain: invoice line items.**
  A 140-line, 2-module invoicing tool. `total()` sums `price * qty` as floats and compares the total
  against a `float` threshold for free shipping with `==`. Correct on every round-number input the
  learner will naturally try. Fails on `19.99 * 3 + 10.03`. Verification bar: a written test that
  fails before the fix. The learner cannot get here by reading alone — they must generate inputs
  adversarially, which is Unit 4's actual skill.

- **D4 / S5 / clean / decoy present / domain: shift rotas.**
  A 300-line rota builder across 3 modules. It is correct. The decoy: a module-level
  `_WEEKDAY_CACHE = {}` that *looks* like the classic stale-cache defect but is keyed on the full
  input tuple and therefore sound. The learner must state the hypothesis ("module-level mutable —
  does this survive across calls with different inputs?"), construct the two-call test that would
  expose it, run it, and conclude correctly that it is fine. Full marks require that whole arc; "it
  looks right" scores 0–1.

---

## 7. Quality gate before serving

The agent runs this checklist on every generated exercise. It takes under a minute and prevents the
failure mode that most damages trust — a broken exercise.

- [ ] The code **runs** and produces output on the obvious input.
- [ ] If defective: the defect is reachable, and I have named the exact input that discriminates.
- [ ] If clean: I have executed the reference against ≥ 3 inputs including boundaries, and I am
      willing to defend its correctness line by line if challenged.
- [ ] `S` matches the visibility test in §3, judged honestly.
- [ ] Only the intended defect is present. No accidental second bug. (Re-read the diff.)
- [ ] The spec given to the learner is decidable — a stranger could judge output against it.
- [ ] No domain knowledge required beyond common sense.
- [ ] Presentation is indistinguishable between clean and defective cases.
- [ ] Not a repeat of this learner's last 4 domains or last 3 defect classes.
- [ ] Ground truth is written to state **before** display.
