# Architecture — how a course is built here

## Two formats, one program

The repo holds courses in two deliberate formats:

1. **Typed course data** (`courses/ai-engineer-stack/course.ts`). A `Course` object,
   type-checked against `src/types/course.ts`, compiled to JSON by `npm run build`.
   Right for curricula that are *schedules over external material*: tracks, phases,
   credentials, pacing.

2. **Executable markdown curriculum** (`courses/ai-coding-101/`). A set of files an agent
   reads in order to *run* the course live — generate exercises, adapt difficulty, grade,
   persist learner state. Right for curricula where the content itself is generated per
   learner per session and a static schedule would be a lie.

Both answer to the same two constitutional requirements.

## Requirement 1 — ethics is structural

Every unit of the typed format carries a `ThreeTierReading`, the same structure the
Education Intelligence Engine applies to any domain of knowledge:

- **Tier 1 — material ground.** What is verifiably true about this technology or practice.
  No inference beyond what is documented.
- **Tier 2 — observer reading.** What the field suppresses: what the dominant framing
  cannot acknowledge, what the critics idealize, what both leave unnamed.
- **Tier 3 — sit with this.** A question, not an answer. The thing the learner carries out
  and cannot unknow.

Enforcement is layered: the type system requires the fields to exist; `src/validate.ts`
rejects readings too thin to mean anything. In AI Coding 101 the same commitment appears as
Unit 9/10's ownership-and-provenance material and the observer-reading rubric in `RUBRICS.md`.

The weekly practice (the **ethics spine**) produces sealed observer readings, and the corpus
of those readings — not the certificate pile — is the credential. That is the alternative
credentialing model: demonstrated structural understanding, sealed, immutable, shareable at
the learner's choice.

## Requirement 2 — adaptation is contractual

Elle does not adapt by vibes. Every unit publishes an `AdaptationContract`:

- a **pacing envelope** (min/target/max hours per week, target weeks),
- the **signals** worth watching for this unit (`pace-ahead`, `pace-behind`,
  `struggle-productive`, `struggle-blocked`, `shallow-completion`, `disengagement`,
  `mastery-early`),
- three **moves** with unit-specific instructions: `accelerate`, `reinforce`, `reroute`.

The reroute is always an exit ramp, never a dead end — switch modality, switch provider,
drop to building, pause without loss. AI Coding 101 implements the same idea with more
machinery (`ADAPTIVE-ENGINE.md`: per-dimension D-levels, μ friction band, promotion and
demotion thresholds); the typed format is the coarse-grained contract, the 101 engine is the
fine-grained one. The **witness spine** closes the loop: the adaptation log is reviewed
*with* the learner at phase boundaries and enters the credential corpus. Elle watching the
learner is itself watched.

## The four pillars

Every unit states what the learner does under **Structure** (map the system first),
**Reading/Logic Reasoning** (read sources and reason about why they're shaped that way),
**Testing** (prove understanding by breaking and verifying), and **Building** (ship a piece
of the real system). The build target throughout the AI Engineer Stack is Elle herself —
the learner builds the system that is teaching them, and both of them know it.

## The runtime (`src/runtime/`)

The engine turns the contracts from prose-with-types into behavior:

- **`state.ts`** — learner state: sessions (minutes, blockers, pillar evidence), per-unit
  progress, the sealed-reading chain, and the adaptation log.
- **`signals.ts`** — pure, deterministic detection. Every threshold is named
  (`PACE_MARGIN`, `DISENGAGEMENT_DAYS`, `BLOCKED_STREAK`, …) so any signal can be explained
  to the learner in the witness review. Blocker texts are compared across consecutive
  sessions to tell *stuck on the same wall* (`struggle-blocked`) from *moving through
  different hard things* (`struggle-productive`).
- **`engine.ts`** — scheduling (phase windows + prerequisites), the signal → move mapping
  (`mastery-early`/`pace-ahead` → accelerate; `struggle-productive`/`pace-behind`/
  `shallow-completion` → reinforce; `struggle-blocked`/`disengagement` → reroute), a
  priority order when several fire at once, the ethics-gated completion, and the
  phase-boundary review. Signals a unit does not watch are still logged, with `move: null` —
  Elle watching herself watch is the witness spine's point.
- **`seal.ts`** — "sealed, immutable, verifiable" implemented literally: each reading's
  SHA-256 covers its content plus the previous reading's hash. Rewriting any past reading
  breaks every seal after it; `elle verify` checks the chain. Thin readings are refused at
  the seal, mirroring curriculum validation.
- **`store.ts`** — one JSON file per learner under `state/`, matching the ai-coding-101
  convention. Course definitions load from `dist/courses/*.json`, falling back to the TS
  source in a fresh checkout.

Time always arrives as an argument (`now: Date`), never from inside the engine — every
behavior is reproducible in tests. The CLI (`src/cli.ts`, `npm run elle`) is the first
consumer; Elle's conversational runtime is the intended second.

## Data flow

```
courses/*/course.ts ──(tsc, the first reviewer)──► validated Course
                    ──(npm run build)───────────► dist/courses/*.json
dist/courses/*.json ──► Elle runtime (pacing, adaptation, unit serving)
                    ──► frontends (course surface)
learner work ───────► sealed observer readings ─► credential corpus ─► training data
```

The JSON artifact is versioned by the `version` field on each course; consumers should treat
a version bump as a curriculum change, not a hot patch.
