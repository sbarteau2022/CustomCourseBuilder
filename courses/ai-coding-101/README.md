# AI Coding 101 — Building Real Software With AI Without Outsourcing Your Judgment

**Version 0.2 — executable curriculum specification.**
This is not a textbook. It is a set of instructions that an LLM agent (Claude Code, or any
comparable agent) reads in order to *run* the course: generate exercises on demand, scale
difficulty to the individual learner, grade against explicit rubrics, and persist learner state
between sessions.

A human can read it too, and should — but the primary reader is a machine.

---

## What the course is

An entry-level course (no prior coding assumed) that teaches a person to direct, read, verify,
debug, and take responsibility for software written by an AI. The thesis, stated once and never
softened:

> The AI can write the code. It cannot hold the responsibility.

Reading and verification are taught **before** fluent generation. Fundamentals arrive as
verification instruments, at the moment a bug requires them — never as a prerequisite lecture.

Full philosophy: [`COURSE-SPEC.md`](COURSE-SPEC.md). The running agent must treat that file as a
constitution and must not violate it, including when the learner asks it to.

---

## How an LLM agent runs this

**Session bootstrap (do this in order, every session):**

1. Read `COURSE-SPEC.md` — the non-negotiables.
2. Read `FACILITATOR-PROMPTS.md` — adopt the stance described there for the whole session.
3. Load `state/<learner-id>.json` (schema and worked example: `LEARNER-STATE.md`). If absent, run
   the cold-start procedure in `ADAPTIVE-ENGINE.md` §9.
4. Read `ADAPTIVE-ENGINE.md` and compute the **next-serve decision**: which unit, which skill
   dimension, which difficulty level `D0–D5`, which defect subtlety `S1–S5`, and — critically —
   whether this exercise is **clean** (no planted defect).
5. Read the relevant `units/unit-NN.md` for the exercise templates and certification bar.
6. Instantiate a *fresh* exercise using `EXERCISE-GENERATION.md`. Never reuse a previous instance
   for this learner; never use a stock example from these files verbatim (they are illustrations,
   not a bank).
7. Run the AI-PRIMM loop with the learner. Record signals as you go.
8. Grade with `RUBRICS.md` + the unit-specific rubric.
9. Write the updated state back to `state/<learner-id>.json`, including the μ trace and the
   telemetry event described in `TELEMETRY.md`.

**Hard rule:** never skip step 4's clean-run decision, and never reveal whether an exercise is
clean before the learner has committed to a verdict. See `ADAPTIVE-ENGINE.md` §5.

---

## File map

| File | Role |
|---|---|
| `README.md` | This file. Orientation and run procedure. |
| `COURSE-SPEC.md` | The constitution: thesis, AI-PRIMM, μ, refusals, honest boundary. |
| `ADAPTIVE-ENGINE.md` | **The core.** Difficulty scale, signals, promotion/demotion thresholds, clean-run mix policy, anti-gaming, stall/coast handling. |
| `LEARNER-STATE.md` | JSON schema for persistent learner state + worked example. |
| `EXERCISE-GENERATION.md` | Parameter space, generation recipes, defect taxonomy mapped to units. |
| `RUBRICS.md` | Cross-cutting rubrics: judgment trail, spec, debugging log, security audit, observer reading. |
| `FACILITATOR-PROMPTS.md` | System-prompt-level stance for the running agent, incl. capstone defense. |
| `TELEMETRY.md` | How we know this is working; failure modes to watch. |
| `units/unit-00.md` … `unit-10.md` | Per-unit objectives, notional-machine concepts, AI-PRIMM beats, parameterized exercise templates, cert artifact + rubric. |
| `state/` | Runtime learner state. Empty in the spec; created on first session. |

Deviation from the designer's suggested structure: one file added (`TELEMETRY.md`). The
"how we know this is working" material is read by a *different* audience (platform/instrumentation)
than the session-running agent, and burying it inside `ADAPTIVE-ENGINE.md` made that file harder to
execute against. Everything else follows the requested layout.

---

## Target language: Python

Python, and the justification is not "it's popular." Three specific reasons tied to this course's
mechanics. (1) The course's core assessment is *reading* — the learner must trace unfamiliar code
line by line in Unit 1 before they can write any. Python's low syntactic noise means a defect the
learner misses is a defect of *reasoning*, not a defect of parsing braces and semicolons; that
keeps the measurement clean. (2) Several defect classes central to the taxonomy are natively and
non-artificially expressible in Python — silent type coercion at boundaries (`"3" + 3` failing but
`3 + True` succeeding), mutable default arguments, aliasing of shared lists, integer/float division
drift — so we can plant realistic bugs rather than contrived ones. (3) LLMs generate Python more
reliably than most languages, which matters *against* us in the right way: the AI's Python failures
are the subtle-semantic kind this course is about, not the syntax-error kind that a compiler would
have caught for free. Cost, stated honestly: Python's dynamic typing hides a class of error that a
statically typed language would surface at compile time, so Unit 6 must explicitly teach type
reasoning that a Rust or TypeScript learner would get from the toolchain. We accept that trade.

Units 9 and 10 additionally touch shell, SQL-as-string, and HTTP surfaces where the security
material lives. That is deliberate and does not change the primary language.

---

## Status

v0.2. Units, rubrics, and the adaptive engine are complete and internally consistent
(`D0–D5` and `S1–S5` mean the same thing in every file). What is *not* validated: any of it,
against real learners. See `COURSE-SPEC.md` §7 and `TELEMETRY.md` §4 for what we do not know.
