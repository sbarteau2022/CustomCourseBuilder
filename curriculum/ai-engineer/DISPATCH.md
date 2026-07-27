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

## Durability discipline

Durable packets (the metal, the math, the from-scratch builds) are authored to
last years. Swappable packets (AIE-302's frameworks, AIE-301/303's current
model APIs) isolate every version-specific detail into a clearly marked
"current tools" section so it can be refreshed without touching the durable
lesson around it. A packet that hard-codes a today-only tool into its durable
core fails coherence review.
