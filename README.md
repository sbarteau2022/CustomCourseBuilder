# CustomCourseBuilder

Building custom education courses in coding with intelligence and ethics as **first-class
citizens**. Elle witnesses the cognitive learning experience in real time and adapts the
program and pace to the learner. We start from Structure, Reading/Logic Reasoning, Testing,
and Building while we learn to code.

"First-class citizen" is enforced, not aspirational: in the course schema
([`src/types/course.ts`](src/types/course.ts)), a unit **cannot exist** without a three-tier
ethics reading and an adaptation contract for Elle. A curriculum that skips either does not
type-check and does not pass validation.

## The courses

| Course | Level | Format | Status |
|---|---|---|---|
| [AI Coding 101](courses/ai-coding-101/) | Entry — no prior coding | Executable markdown curriculum, run by an agent | v0.2 spec complete |
| [AI Engineer Stack](courses/ai-engineer-stack/) | Professional — 12 months | Typed course data → JSON | v1.0 |

**AI Coding 101** is the on-ramp. Its thesis: *the AI can write the code; it cannot hold the
responsibility.* It teaches reading, verification, and ownership of AI-written software before
fluent generation, using the AI-PRIMM loop and an adaptive difficulty engine (`D0–D5` per skill
dimension). The curriculum files are instructions an agent reads to *run* the course — generate
fresh exercises, grade against rubrics, persist learner state. Start at
[`courses/ai-coding-101/README.md`](courses/ai-coding-101/README.md).

**The AI Engineer Stack** is the soul of the program: 12 months, 5 parallel tracks (coding,
AI/ML, data engineering, business/founder, law/IP), ~22 external credentials, $0–$500 total.
Every unit carries:

- **Four pillars** — what the learner does under Structure, Reading/Reasoning, Testing, Building.
- **A three-tier reading** — Tier 1 *material ground* (what is verifiably true), Tier 2
  *observer reading* (what the field suppresses), Tier 3 *sit with this* (the question the
  learner cannot unknow).
- **An adaptation contract** — the pacing envelope, the signals Elle watches
  (`pace-ahead`, `struggle-blocked`, `shallow-completion`, …), and the moves she may make
  (accelerate / reinforce / reroute).

Three spines run the full year: the **ethics spine** (weekly sealed observer readings), the
**build spine** (the learner builds Elle while Elle teaches them), and the **witness spine**
(Elle's adaptation log, reviewed together at phase boundaries). The credential is not the
certificate pile — it is the sealed corpus of 74 observer readings, per the alternative
credentialing model of the Education Intelligence Engine.

## The runtime

The adaptation contracts are executable. `src/runtime/` + `src/cli.ts` implement Elle's
witnessing loop: log sessions (with blockers and pillar evidence), and the engine detects
signals deterministically against each unit's pacing envelope, executes the contracted move,
and writes everything to the witness log. Sealed readings are hash-chained (tamper-evident),
and a unit cannot complete without all four pillars evidenced plus a sealed unit-close
reading — a refused completion is logged as `shallow-completion` and answered with the
unit's own `reinforce` instruction.

```bash
npm run elle -- enroll stewart
npm run elle -- log stewart --unit b1-ai-for-everyone --minutes 90 \
    --evidence structure="AI landscape map v1"
npm run elle -- seal stewart --kind weekly --tier1 "..." --tier2 "..." --tier3 "..."
npm run elle -- advise stewart      # detect signals, execute contracts
npm run elle -- complete stewart --unit b1-ai-for-everyone   # gated
npm run elle -- review stewart --phase p1-foundations        # witness review
npm run elle -- verify stewart      # verify the sealed-corpus hash chain
```

## Repo layout

```
src/types/course.ts        # the schema — ethics + adaptation are required fields
src/validate.ts            # referential integrity + first-class-citizen invariants
src/build.ts               # compiles course TS → dist/courses/*.json
src/runtime/               # the engine: state, signals, contract execution, sealing
src/cli.ts                 # `elle` — drive the runtime from the terminal
test/                      # node:test suite over signals, gate, and sealing
courses/ai-engineer-stack/ # course data (TS, type-checked) + curriculum doc
courses/ai-coding-101/     # executable markdown curriculum (agent-run)
state/                     # learner state, one JSON per learner (gitignored)
docs/ARCHITECTURE.md       # how the pieces fit, and how Elle consumes them
```

## Develop

Node ≥ 22.6 (uses `--experimental-strip-types`; the only dependency is TypeScript itself).

```bash
npm install
npm run check      # type-check everything, including course data
npm run validate   # runtime invariants: schedule integrity, pacing sanity, ethics present
npm run build      # check + validate + emit dist/courses/*.json for consumers
```

The emitted JSON is the interchange format for downstream consumers — Elle's runtime, the
worker, any frontend. The TS source is the authoring format; the type checker is the first
line of curriculum review.
