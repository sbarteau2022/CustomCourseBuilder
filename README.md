# CustomCourseBuilder

Building custom education courses in coding with intelligence and ethics as **first-class
citizens**. Elle witnesses the cognitive learning experience in real time and adapts the
program and pace to the learner. We start from Structure, Reading/Logic Reasoning, Testing,
and Building while we learn to code.

"First-class citizen" is enforced, not aspirational: in the course schema
([`src/types/course.ts`](src/types/course.ts)) a unit **cannot exist** without a three-tier
ethics reading and an adaptation contract for Elle, and in the curriculum schema
([`src/types/curriculum.ts`](src/types/curriculum.ts)) a course **cannot exist** without a
descent arc and an ethics thread. A definition that skips any of these does not type-check
and does not pass validation (`npm run validate`, `npm run validate:curriculum`).

## What's actually here

The repo holds three things, at three different stages of completeness:

1. **A witnessing/adaptation runtime** (`src/runtime/`, `src/cli.ts`) — implemented and
   tested (30 passing `node:test` cases). This is the only part of the repo that *executes*
   anything; everything else is course content the runtime (or an agent) consumes.
2. **Course content in two authoring formats** — typed schedules over external credentials
   (`courses/ai-engineer-stack/`) and an executable markdown curriculum run live by an agent
   (`courses/ai-coding-101/`).
3. **A first-party curriculum** (`curriculum/ai-engineer/`) — a 15-course, 100-module
   program the project authors and teaches itself, with 6 of those 15 courses (the whole
   foundation tier) fully
   authored and quality-gated so far (see [Curriculum authoring status](#curriculum-authoring-status)).

## The courses and curricula

| What | Location | Format | Status |
|---|---|---|---|
| AI Coding 101 | [`courses/ai-coding-101/`](courses/ai-coding-101/) | Executable markdown curriculum, run by an agent | v0.2 spec complete; unvalidated against real learners |
| AI Engineer Stack | [`courses/ai-engineer-stack/`](courses/ai-engineer-stack/) | Typed course data → JSON | 21 units, 4 phases, 5 tracks, 26 external credentials — type-checks and validates clean |
| AI Engineer Curriculum | [`curriculum/ai-engineer/`](curriculum/ai-engineer/) | Typed manifest + first-party markdown material, generated into a runnable `Course` | 15 courses / 100 module packets defined and validated; the foundation tier — 6 courses, 39 packets — fully authored, quality-gated, and enrollable; 9 courses still scaffold-only |

**AI Coding 101** is the on-ramp. Its thesis: *the AI can write the code; it cannot hold the
responsibility.* It teaches reading, verification, and ownership of AI-written software before
fluent generation, using the AI-PRIMM loop and an adaptive difficulty engine (`D0–D5` per skill
dimension). The curriculum files are instructions an agent reads to *run* the course — generate
fresh exercises, grade against rubrics, persist learner state. Start at
[`courses/ai-coding-101/README.md`](courses/ai-coding-101/README.md).

**The AI Engineer Stack** maps a 12-month, 5-track program (coding, AI/ML, data engineering,
business/founder, law/IP) over roughly 22 external credentials for $0–$500 total, defined as
typed data in [`course.ts`](courses/ai-engineer-stack/course.ts) and compiled to
`dist/courses/ai-engineer-stack.json`. Every unit carries:

- **Four pillars** — what the learner does under Structure, Reading/Reasoning, Testing, Building.
- **A three-tier reading** — Tier 1 *material ground* (what is verifiably true), Tier 2
  *observer reading* (what the field suppresses), Tier 3 *sit with this* (the question the
  learner cannot unknow).
- **An adaptation contract** — the pacing envelope, the signals Elle watches
  (`pace-ahead`, `struggle-blocked`, `shallow-completion`, …), and the moves she may make
  (accelerate / reinforce / reroute).

Three spines run the full year: the **ethics spine** (weekly sealed observer readings), the
**build spine** (the learner builds Elle while Elle teaches them), and the **witness spine**
(Elle's adaptation log, reviewed together at phase boundaries). The credential is the sealed
corpus of 74 observer readings (48 weekly + 18 unit syntheses + 4 phase syntheses + 4 build
retrospectives), per the alternative credentialing model described in
[`courses/ai-engineer-stack/README.md`](courses/ai-engineer-stack/README.md).

**The AI Engineer Curriculum** (`curriculum/ai-engineer/`) is a separate, first-party program:
15 courses the project designs and teaches itself rather than mapping over other people's
courses — foundation → core → specialization → capstone, weighted to sum to 100, built on a
named philosophy (descend-build-re-ascend, verification before generation, evaluation as a
spine, ethics with structural teeth, durable-core/swappable-surface, the judgment trail as the
credential). See [Curriculum authoring status](#curriculum-authoring-status) below for what is
actually written versus still scaffolding.

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
npm run elle -- brief stewart       # session brief for Elle's conversational layer
npm run elle -- status stewart      # current progress and available units
```

The runtime drives both typed courses via `--course`: `ai-engineer-stack` (the default) and
`ai-engineer-curriculum`, loading from `dist/courses/*.json` with a fallback to the TS source in
a fresh checkout. The curriculum isn't hand-authored as `Course`/`Unit` data — it's **generated**:
`src/generate-course-from-curriculum.ts` reads `curriculum/ai-engineer/curriculum.ts` plus every
dispatched module's markdown materials and emits `courses/ai-engineer-curriculum/course.ts`, with
each unit's adaptation contract and three-tier reading extracted from that specific module's own
authored "Elle pacing notes" and "Three-tier reading" sections — never boilerplate. Regenerate
after landing a new course's materials: `node --experimental-strip-types
src/generate-course-from-curriculum.ts && npm run build`. AI Coding 101 is the one format still
consumed directly by an agent rather than the runtime — it's a different shape (a generated-per-
learner curriculum, not a fixed schedule) and doesn't fit `Course`/`Unit` at all.

```bash
npm run elle -- enroll stewart --course ai-engineer-curriculum
npm run elle -- log stewart --unit AIE-100-M01 --minutes 45 \
    --evidence structure="drew the boxes-and-arrows pointer model"
npm run elle -- brief stewart   # contract move quotes THAT module's own pacing notes, verbatim
```

`elle brief` is the bridge to Elle's voice: it packages the engine's decisions (contract
moves with verbatim instructions and evidence), ethics-spine obligations (owed weekly
readings open the session), phase-boundary flags, and corpus integrity into one markdown
document. The conversational model reads it under the stance in
[`docs/FACILITATOR.md`](docs/FACILITATOR.md) — the engine decides, Elle speaks.

## Curriculum authoring status

`curriculum/ai-engineer/curriculum.ts` defines all 15 courses and their 100 module packets
(`AIE-XXX-MYY`); `npm run validate:curriculum` checks the manifest itself (weights sum to 100,
hours consistent, prerequisite graph acyclic, every course has a syllabus file, no course's
descent arc or ethics thread is a placeholder). That validation passes today. What it does
*not* check is whether a module's teaching content has actually been written — that's a
separate, manual process:

- **Fully authored and quality-gated — the entire foundation tier, 39/39 packets**
  (lesson notes, labs with starter/solution/tests, assessment + rubric, Elle pacing notes,
  three-tier reading — one file per module under `curriculum/ai-engineer/materials/<CODE>/`,
  each carrying its own in-file gate report):
  - `AIE-100` — Working With AI Without Outsourcing Judgment (6/6 packets)
  - `AIE-101` — Python and Software Craft (8/8 packets)
  - `AIE-102` — Down to the Metal: C, and the Machine Under Python (7/7 packets)
  - `AIE-103` — Mathematics for AI, Taught as Instruments (7/7 packets)
  - `AIE-104` — The Machine at Scale (5/5 packets)
  - `AIE-110` — Data Structures, Algorithms, and Scale (6/6 packets)
  These 39 packets are also **generated into a real, enrollable `Course`**
  (`courses/ai-engineer-curriculum/`, `dist/courses/ai-engineer-curriculum.json`) — see
  [The runtime](#the-runtime) above.
- **Scaffold only** (a generated syllabus with course metadata, outcomes, and the assessment
  table, but no module-level lesson/lab/assessment content yet): the remaining 9 courses —
  `AIE-201`, `AIE-202`, `AIE-203`, `AIE-204`, `AIE-301`, `AIE-302`, `AIE-303`, `AIE-304`,
  `AIE-401`.

Every packet is checked against four quality gates before it counts as done — technical
(a second agent runs every lab from the materials alone), eval-discipline (can the assessment
be passed without demonstrating the outcome?), ethics (readings are subject-specific, not
boilerplate), and coherence (cross-module references resolve to real, accepted packets). The
full contract for authoring a packet and running the gates is
[`curriculum/ai-engineer/DISPATCH.md`](curriculum/ai-engineer/DISPATCH.md); the course map,
philosophy, and rationale are in
[`curriculum/ai-engineer/README.md`](curriculum/ai-engineer/README.md). Syllabus scaffolds are
regenerated with `node --experimental-strip-types curriculum/ai-engineer/gen-syllabi.ts`, which
preserves any hand-authored content already appended below each file's marker line.

## Repo layout

```
src/types/course.ts          # course schema — ethics + adaptation are required fields
src/types/curriculum.ts      # curriculum schema — descent arc + ethics thread required per course
src/validate.ts              # AI Engineer Stack: referential integrity + first-class-citizen invariants
src/validate-curriculum.ts   # AI Engineer Curriculum: weights, hours, prereq DAG, syllabus presence
src/build.ts                 # compiles course TS → dist/courses/*.json
src/cli.ts                   # `elle` — drive the runtime from the terminal
src/runtime/                 # the engine: state, signals, contract execution, sealing, session briefs
test/                        # node:test suite over the runtime, briefs, and curriculum invariants
courses/ai-engineer-stack/   # course data (TS, type-checked) + curriculum doc
courses/ai-coding-101/       # executable markdown curriculum (agent-run) + its own learner state dir
curriculum/ai-engineer/      # the first-party 15-course curriculum: manifest, syllabi, dispatch, materials
state/                       # learner state for the AI Engineer Stack runtime, one JSON per learner (gitignored)
docs/ARCHITECTURE.md         # how the pieces fit, and how Elle consumes them
docs/FACILITATOR.md          # the stance a conversational model reads alongside a session brief
```

## Prerequisites

- Node.js ≥ 22.6 (the codebase runs TypeScript directly via `--experimental-strip-types` — no
  transpile step, no bundler).
- TypeScript is the only dependency; `devDependencies` are just `typescript` and `@types/node`.

## Setup

```bash
npm install
```

## Develop

```bash
npm run check                 # type-check src/, courses/, and test/ (tsc --noEmit)
npm run validate              # AI Engineer Stack runtime invariants: schedule integrity, pacing, ethics present
npm run validate:curriculum   # AI Engineer Curriculum invariants: weights=100, hours consistent, prereq DAG acyclic, syllabi present
npm run build                 # check + validate + emit dist/courses/*.json for consumers
npm test                      # the full node:test suite (runtime, briefs, curriculum)
npm run elle -- <command>     # drive the runtime CLI (see `src/cli.ts` for the full command list)
```

The emitted JSON (`dist/courses/*.json`, gitignored) is the interchange format for downstream
consumers — Elle's runtime, a worker, any frontend. The TS source is the authoring format; the
type checker is the first line of curriculum review.

## Testing

`npm test` runs `node --experimental-strip-types --test test/*.test.ts`: 30 tests across three
files — `test/runtime.test.ts` (signal detection, contract execution, gated completion, the
sealed-reading hash chain and tamper detection), `test/brief.test.ts` (the session-brief
markdown, ethics-spine due-tracking), and `test/curriculum.test.ts` (the AI Engineer Curriculum
manifest's validation invariants). There is no test coverage of AI Coding 101 or the AI
Engineer Curriculum's authored materials beyond their four-gate review process — neither has
been run with a real learner.

## Learner state

Runtime state lives under `state/` (one JSON file per learner, for the AI Engineer Stack
runtime) and `courses/ai-coding-101/state/` (one JSON file per learner, schema in
[`LEARNER-STATE.md`](courses/ai-coding-101/LEARNER-STATE.md)). Both are gitignored
(`state/*.json`, `courses/ai-coding-101/state/*.json`) — see [`state/README.md`](state/README.md).
