# UNIT 6 — Foundations you cannot outsource

**Dimensions exercised:** `FOUND` (primary), `TRACE` and `DEBUG` (secondary)
**Structural note:** Unit 6 is **not sequential.** It is a library of micro-lessons that the engine
injects at the moment a bug requires one (`ADAPTIVE-ENGINE.md` §7.3, step 2), and it is also a unit
with its own certification. Both are true; the certification is earned from the injected episodes.

---

## 1. Learning objectives

By the end of Unit 6 the learner can:

1. Explain, in plain English, **why a specific AI-generated program is wrong at the machine level** —
   not that it is wrong, and not what to change, but what the machine does that produces the wrong
   result.
2. Use each of the minimum notional-machine primitives as a *verification instrument*: reach for
   "what is this variable at this moment" as a tool, not as a concept they once studied.
3. Reason about cost and consequence: what a construct does at scale, and what it costs when wrong.
4. State honestly where their own line is — what they can direct and cannot check — and describe
   what it would take to move it.

---

## 2. The minimum notional machine

The floor. Below this, the learner cannot verify anything and the rest of the course is theater.
Each primitive is listed with the **failure it lets you catch**, because that is how it is taught.

| Primitive | What the learner must be able to say | Catches |
|---|---|---|
| **Value & variable** | What is in this name at this line; assignment replaces | Accumulator resets, wrong-variable-used |
| **Type** | What kind of thing this is, and what operations change it silently | `silent_type_coercion`, `"3"+3`, truthiness of `0`/`""`/`[]` |
| **Reference & aliasing** | Whether two names point at one object; what mutation does to the other holder | `mutation_of_shared_state`, mutable defaults, the `.copy()` class |
| **Control flow** | Which branch runs for this input; how many times this loop runs; what is true at exit | Off-by-one, unreachable branch, wrong operator |
| **Scope & lifetime** | What survives the return; what persists between calls | `stale_cache`, module-level state, closures over loop variables |
| **Collections** | Ordered or not; unique or not; what indexing/keying assumes | Ordering assumptions, key collisions, dict-vs-list confusion |
| **Numbers** | Int vs float; when `==` is meaningless; where precision goes | `float_accumulation`, money-in-floats, integer division |
| **Error paths** | What happens when this fails; where the failure surfaces | `happy_path_only`, `swallowed_exception` |
| **Cost** | Roughly how this scales, and what it costs to be wrong here | Nested-loop blowups, unbounded reads, retry storms |

**Nine primitives. That is the whole list.** The refusal in `COURSE-SPEC.md` §6.3 is about these and
nothing more — the course does not smuggle a full programming curriculum in through this unit.

---

## 3. Injection protocol

Unit 6 material is served when, and only when, a failure demands it.

**Trigger:** during any unit, the learner cannot explain a mechanism, or misses a defect whose class
maps to a primitive they have not demonstrated.

**Procedure:**

1. **Stop the exercise.** Do not finish it first. The teaching moment is now, with their broken code
   in front of them.
2. **Name the primitive**, once: "This is aliasing. Two names, one list."
3. **Demonstrate on their own code** — never on a textbook example. Six lines from the exercise they
   are already looking at.
4. **Make them predict.** "If I append here, what does `original` contain?" They must answer before
   you run it.
5. **Run it.** The machine delivers the correction, not you.
6. **Return to the exercise.** Do not lecture further, do not generalize, do not assign reading.
7. **Record** the primitive in `FOUND` state as *introduced*. It becomes *demonstrated* only when
   the learner uses it unprompted to catch something later.

**Time budget: 10 minutes.** A Unit 6 injection that runs longer has become a lecture, which the
course refuses. If the primitive needs more than 10 minutes, the learner is at the wrong level and
the answer is demotion, not more explanation.

---

## 4. Exercise templates

### Template 6-A — "Explain the mechanism"

**Shape:** AI-generated code with a known defect, already located for the learner. The exercise is
*not* to find it. It is to explain, at machine level, why it produces the wrong answer.

Deliberately decoupled from finding, because a learner can catch defects by pattern-matching without
any model of the machine — and that learner will fail at D4.

- **D1 / S2** — accumulator initialized inside the loop. Learner must say: "`total` is reset to 0 at
  the top of every iteration, so at the end it holds only the contribution of the last item."
- **D2 / S4** — `def add(item, cart=[])`. Learner must say: "The default list is created once when
  the function is defined, not per call, so every call without an explicit cart shares one object
  and appends accumulate across calls."
- **D3 / S5** — a closure capturing a loop variable, producing a list of functions that all return
  the last value. Learner must explain late binding. This is the hardest `FOUND` item in the course
  and should be reserved for learners at `FOUND` D3+.

### Template 6-B — "Where's my line?"

**Shape:** the learner is shown four AI-generated programs of increasing complexity and asked to
sort them into: (a) I can verify this fully; (b) I can verify the parts that matter; (c) I can
direct this but not check it; (d) I should not be shipping this.

Then: for the first item in category (c), what specifically would they need to learn to move it to
(b)? Self-assessment made concrete and falsifiable.

- **D1** — the four span 10 to 80 lines. Most learners place the boundary honestly.
- **D3** — the four include one with a dependency the learner hasn't used and one with concurrency.
  The graded skill is calibration: after they sort, the agent probes one program from category (b)
  with a real question. If they can't answer it, their line is optimistic, and *that* is the finding.
- **D4** — includes one program that looks intimidating and is fully verifiable, and one that looks
  simple and hides an `S5` defect. Tests whether the learner's line is drawn on surface complexity
  or on actual verifiability. Most learners fail this the first time; it is worth failing.

### Template 6-C — "Cost and consequence"

**Shape:** correct code with a cost problem. Not a defect — it produces right answers — but wrong at
scale or expensive to be wrong about. Introduces the idea that "correct" is not the only axis.

- **D2** — a nested loop over two lists that is fine at 100 items and unusable at 100,000. Learner
  must say roughly why (comparisons grow with the product) and identify the threshold at which it
  matters.
- **D3** — a function that reads an entire file into memory. Correct. Learner must state the input
  size at which this stops being acceptable and what they'd need to know about the deployment to
  decide.
- **D4** — a retry loop with no backoff and no cap. Correct on the happy path; a self-inflicted
  denial of service when the dependency is slow. Learner must reason about the consequence of the
  failure mode, not the correctness of the code. Bridges to Unit 9.

**Note:** 6-C exercises are all "clean" in the defect sense. They should be labeled as a distinct
category to the learner, not folded into the clean-run mix, because a learner who flags a cost
problem as a defect has not made a false positive — they have made a good observation with the wrong
label. Grade the observation; correct the label.

---

## 5. Certification artifact — *the plain-English machine-level explanation*

**Definition.** A written explanation, 150–500 words, of why a specific AI-generated program at
`D ≥ 3` is wrong, meeting all of:

1. **No jargon that isn't unpacked.** If the learner writes "aliasing," the next sentence explains it
   in terms of this program's variables. The audience is a smart colleague who does not program.
2. **Machine-level, not symptom-level.** What the machine does, step by step, at the defective
   construct. Not "it doesn't handle empty lists" but "the loop body never executes, so `best` is
   still the sentinel value `-1` when it is returned, and `-1` is then formatted as a score."
3. **The class, not the instance.** State which inputs are affected and which aren't, and why.
4. **The instrument named.** Which of the nine primitives had to be understood to see this. This is
   the metacognitive half and it is required.
5. **No fix.** The artifact explains; it does not repair. A learner who cannot resist writing the fix
   is demonstrating the reflex the unit is meant to slow down.

---

## 6. Grading rubric — Unit 6 artifact

| Criterion | Weight | 0 | 2 | 4 |
|---|---|---|---|---|
| **Mechanism** | 35% | Restates the symptom | Names the construct and what it does wrong | Step-by-step account of machine behavior at that construct, with the intermediate state named |
| **Plain English** | 20% | Jargon-dependent, or requires the reader to know Python | Understandable to a careful non-programmer with one re-read | A non-programmer could restate the cause correctly after one read |
| **Input class** | 20% | No scope stated | States which inputs fail | States which fail, which pass, and the boundary between them |
| **Instrument named** | 15% | Absent | Names the primitive | Names it and explains how it generalizes to a different program |
| **Restraint** | 10% | Leads with the fix | Fix mentioned at the end | No fix; explanation stands alone |

**Pass bar:** ≥ 0.72 with **mechanism ≥ 3**. Mechanism is gated because it is the unit.

**Grader traps.**
- *Correct vocabulary, absent understanding.* "It's a scope issue" with no account of what is in
  scope when scores 1, not 3. Ask what value is where.
- *Restating the traceback.* The interpreter's message is not an explanation.
- *Explaining the fix instead of the cause.* "It needs a copy because otherwise they share" is closer
  to the fix than the mechanism; push for what "share" means operationally here.

---

## 7. Notes for the running agent

- **Never front-load this unit.** A learner who is taught aliasing before they have been bitten by it
  retains a definition, not an instrument. The injection protocol exists precisely to prevent that,
  and the temptation to "just cover the basics properly" is the single most likely way this course
  gets ruined in practice.
- Track which primitives are *demonstrated* (used unprompted to catch something) versus merely
  *introduced*. Certification requires ≥ 5 of 9 demonstrated. Five because that is enough to cover
  the defect classes through D3, and requiring all nine would force artificial exercises for the
  rarer primitives — which is exactly the front-loading this unit refuses.
- When a learner asks "shouldn't I just learn Python properly first?", answer honestly: they will
  learn a fair amount of Python here, but as instruments, and there is a real argument for the other
  order. Do not pretend the question is silly. Then point at their own last three catches and ask
  which of them a syntax course would have given them.
- Cost/consequence (6-C) is where the strongest learners separate. A learner who spontaneously asks
  "what happens when this is slow?" is ready for Unit 8.
