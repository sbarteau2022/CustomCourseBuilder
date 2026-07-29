# DISPATCH — parallel material design for the AI Engineer Curriculum

This is the contract for fanning course-material production across parallel
agents (Cowork) without losing coherence. The typed manifest
([`curriculum.ts`](curriculum.ts)) is the source of truth; the per-course
syllabus scaffolds ([`syllabi/`](syllabi/)) are the per-course briefs; this
file is how the work is cut up and handed out.

## The unit of work is the module packet

The curriculum is **15 courses → 100 module packets** (`AIE-XXX-MYY`). One
packet is one agent assignment. Packets within a course share context but are
independently authorable, so a course can be built by one agent or by six in
parallel.

## What a packet must deliver

Per the manifest's `dispatch.packetContract`, every packet produces:

1. **Lesson notes** — for each lesson in the module: teaching text that
   embodies the descent arc (descend below the abstraction, build at the
   substrate, re-ascend), worked examples, and the common misconceptions with
   how to surface them.
2. **Labs** — starter code, reference solution, and autograded tests. Every
   lab states its **Predict** step before its **Build** step (AI-PRIMM is not
   optional). Code runs under the repo toolchain (Python 3.12+ / pytest; C
   with a provided harness where the course is AIE-102; TS where stated).
3. **Module assessment + rubric** — mapped to the course's assessment weights.
   It must be gaming-resistant: a learner cannot pass it without the outcome.
4. **Elle/instructor notes** — the pacing signals to watch on this module, the
   known walls, and reroute options. These feed the adaptation runtime.
5. **The three-tier reading prompt** — specific to this module's subject:
   material ground, what the field suppresses, and the "sit with this"
   question. Never boilerplate.

## Dispatch order (dependencies are real)

Author in tier order so later courses can reference earlier artifacts (the
AIE-110 ANN index reused in AIE-302; the AIE-203 corpus used in AIE-301):

1. **Foundations** — AIE-100, 101, 102, 104, 103, 110 (parallelizable within the tier)
2. **Core** — AIE-201, 202, 203, 204
3. **Specialization** — AIE-301, 302, 303, 304
4. **Capstone** — AIE-401

Within a tier, packets fan out freely. Across tiers, hold the barrier: a
later-tier packet may reference an earlier artifact by its packet id, so the
earlier one must be accepted first.

## The four quality gates (every packet passes all four)

Per `dispatch.qualityGates`:

1. **Technical review** — a second agent attempts every lab from the materials
   alone. Any friction that isn't the intended lesson is a defect.
2. **Eval-discipline review** — the assessment is checked for gaming
   resistance: can it be passed without demonstrating the outcome? If yes, it
   fails.
3. **Ethics review** — the tier readings are specific to the subject, not
   boilerplate; "sit with this" is a question, not a lecture.
4. **Coherence review** — every cross-module reference (imports from earlier
   courses, artifacts reused later) resolves to a real, accepted packet.

## A ready-to-dispatch packet brief (what each agent receives)

```
PACKET: AIE-XXX-MYY — <module title>
COURSE CONTEXT: <course title>, tier <tier>, durability <durability>
DESCENT ARC (course): <course.descentArc>
PHILOSOPHY (binding): descend→build→re-ascend · verify before generate ·
  evaluation is a spine · ethics with teeth · durable core vs swappable surface ·
  the judgment trail is the credential
SYLLABUS: curriculum/ai-engineer/syllabi/AIE-XXX.md (this module's row)
DELIVER: lesson notes · labs (starter/solution/tests, Predict-before-Build) ·
  assessment + rubric (gaming-resistant) · Elle pacing notes · 3-tier reading
GATES: technical · eval-discipline · ethics · coherence
TOOLCHAIN: Python 3.12+ / pytest (C harness for AIE-102; TS where stated)
```

A Cowork orchestration reads the manifest, emits one brief per packet in
dependency order, fans out within each tier, runs the four gates as a verify
stage, and collects accepted packets. The manifest's totals — 100 packets,
1590 learner-hours — are the scope; nothing is silently dropped.

## The reproducible tooling (`dispatch/`) — battle-tested on the foundation tier

The foundation tier (`AIE-100`, `101`, `102`, `103`, `104`, `110` — 39 packets) was
authored through this exact process, and the scripts are checked in at
[`dispatch/`](dispatch/) rather than living only in an ephemeral session:

- **`dispatch/emit-course-snippet.ts`** — the single source of truth for a
  course's dispatch context. Reads the real `curriculum.ts` (never hand-copy
  a course's `descentArc`/`outpaces`/`ethicsThread` — they drift) and prints
  the JS object literal to paste into the Workflow script's `COURSES` map.
  Add a `PACKET_CONTEXT` entry for the course first (free-text authoring
  guidance the typed manifest doesn't carry: `prereqNote`, `toolchain`, and
  ideally a one-line `focus` per packet — the more specific the focus, the
  better the authored material).
- **`dispatch/dispatch-course.js`** — the Workflow script: author every
  packet of ONE course in parallel, four-gate each, agents write files
  straight to disk. Run via `Workflow({ scriptPath:
  "curriculum/ai-engineer/dispatch/dispatch-course.js" })` — no `args`
  (Workflow's args-threading proved unreliable for this; course data is
  embedded in the script instead, kept in sync via `emit-course-snippet.ts`).
- **`dispatch/finish-course.js`** — recovery: authors only a course's
  missing packets, then gates everything in it. Use when a
  `dispatch-course.js` run stalls partway (this happened twice during the
  foundation tier — once from a session token limit, once from a background
  workflow that stopped returning results without erroring).

### Dispatch cadence — lessons learned the hard way

- **One course at a time.** Dispatching all four remaining foundation
  courses concurrently (16+ agents at once) hit a session token limit
  partway through every one of them. A single course (5–9 agent calls,
  author + gate) is the safe unit. Wait for it to land, review the gate
  results, then start the next.
- **A `overallPass: false` is the pipeline working, not breaking.** Across
  the foundation tier the gates caught real, specific, verifiable defects —
  an answer key whose claimed compiler warning didn't actually fire under
  the stated flags, a resize worked example that didn't match its own
  code's arithmetic, a Dockerfile linter that couldn't see past a
  backslash-continued line, an assessment component called "optional" in
  one place and required in another. Every one was fixed by a small,
  focused agent that read the flagged file, applied exactly the named
  fixes (never a rewrite), and was re-gated — not by loosening the gate.
- **Reconcile the packet's own in-file gate report after every fix.** A
  stale `FAIL` verdict sitting next to now-corrected material is worse than
  no report at all — it's the same failure mode as a wrong tier reading,
  just about the pipeline instead of the subject.
- **After a course reaches 100%**, regenerate the runnable course and
  rebuild before committing:
  ```bash
  node --experimental-strip-types src/generate-course-from-curriculum.ts
  npm run build && npm test
  ```
  `src/generate-course-from-curriculum.ts` is what turns landed materials
  into something Elle and the `elle` CLI can actually enroll a learner in —
  see the root [`README.md`](../../README.md#the-runtime).

## Durability discipline

Durable packets (the metal, the math, the from-scratch builds) are authored to
last years. Swappable packets (AIE-302's frameworks, AIE-301/303's current
model APIs) isolate every version-specific detail into a clearly marked
"current tools" section so it can be refreshed without touching the durable
lesson around it. A packet that hard-codes a today-only tool into its durable
core fails coherence review.
