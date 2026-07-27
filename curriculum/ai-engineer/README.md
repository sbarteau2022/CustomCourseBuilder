# The AI Engineer Curriculum

First-party. Not a map over other people's courses — every course here is ours
to teach, built on a philosophy rather than inherited from how these subjects
have been taught.

**15 courses · 100 dispatchable module packets · ~1,590 learner-hours · weights sum to 100.**

The machine-readable source of truth is [`curriculum.ts`](curriculum.ts)
(type-checked against `src/types/curriculum.ts`, validated by
`npm run validate:curriculum`). Per-course briefs are in [`syllabi/`](syllabi/);
[`AIE-102.md`](syllabi/AIE-102.md) is authored in full as the reference for the
depth every packet should reach. Parallel material production is governed by
[`DISPATCH.md`](DISPATCH.md).

## The philosophy (the spine, applied to every course)

1. **Descend, build, re-ascend.** Every subject is entered below its
   abstraction. Go down to the substrate, build it there by hand, re-ascend to
   command the high-level tool. Python → C → fast Python. Symbols → the raw
   computation → the symbol you now trust. sklearn only after you've matched it
   from scratch. The framework only after the primitive.
2. **Verification before generation.** Reading and verifying are taught before
   fluent producing. AI-PRIMM under every lab; the judgment trail, not a
   program that runs, is the certification artifact.
3. **Evaluation is a spine, not a module.** You may not claim a thing works
   until you can measure it. A full evaluation course sits *before* the LLM
   tier; nothing ships afterward without its own eval harness.
4. **Ethics with structural teeth.** An engineering constraint, not a
   discussion week — three-tier readings on every subject, then eval gates,
   abuse-cases-before-use-cases, and a capstone defense that asks who bears the
   cost if you're wrong.
5. **Durable core, swappable surface.** Fundamentals that outlast tools are
   taught as durable; the current-tools layer is marked swappable and refreshed
   without touching the core. The curriculum is built to not decay in months.
6. **The judgment trail is the credential.** Assessment measures judgment
   demonstrated, never content retained; the sealed corpus is the credential no
   certificate pile can match.

## Why it outpaces the field

Built against the measured gaps in the best existing curricula (CS336,
Karpathy, fast.ai, DeepLearning.AI, HF, the zoomcamps, the evals cohort):

- **One coherent full-stack arc** — nobody spans metal → math → from-scratch
  models → application → evals → production → cost as a single designed
  sequence. Everyone else makes the learner stitch it.
- **Evaluation as a spine** — the #1 industry shift of 2025-26, taught nowhere
  as a threaded discipline. Here it precedes the LLM work and gates everything
  after.
- **The descent to the metal** — Python → C → back up, and the same move in
  every course. No bootcamp does this; it's why the graduate understands *why*
  training is slow and inference is expensive at the level of the hardware.
- **Data engineering for AI, un-orphaned** — corpus construction with
  provenance, contamination discipline, and consent posture: the skill the LLM
  era runs on, taught nowhere.
- **Security taught offensively** — learners break real sandboxed systems, then
  patch them, inside the program that teaches building.
- **Cost as a graded discipline** — scored on $/request against SLOs, which no
  course anywhere does.
- **CS336-grade assessment at accessible prerequisites** — from-scratch, graded,
  gaming-resistant, with the ramp built into our own foundation tier.
- **Staleness-resistance by architecture** — durable vs swappable, so the
  program stays ahead as tools churn.

## Course map

| Code | Course | Tier | Wt% | Hrs | Durability |
|---|---|---|---|---|---|
| AIE-100 | Working With AI Without Outsourcing Judgment | foundation | 4 | 60 | durable |
| AIE-101 | Python and Software Craft | foundation | 7 | 120 | durable |
| AIE-102 | Down to the Metal: C, and the Machine Under Python | foundation | 6 | 100 | durable |
| AIE-104 | The Machine at Scale: Linux, Networks, Concurrency, Containers | foundation | 4 | 70 | durable |
| AIE-103 | Mathematics for AI, Taught as Instruments | foundation | 8 | 120 | durable |
| AIE-110 | Data Structures, Algorithms, and Scale | foundation | 5 | 80 | durable |
| AIE-201 | Machine Learning from First Principles | core | 9 | 130 | durable |
| AIE-202 | Deep Learning: Autograd to Transformers | core | 9 | 150 | durable |
| AIE-203 | Data Engineering for AI | core | 7 | 100 | mixed |
| AIE-204 | Evaluation and Experimentation | core | 8 | 110 | durable |
| AIE-301 | Large Language Models: Pretraining to Post-Training | specialization | 9 | 140 | mixed |
| AIE-302 | Building with Foundation Models: Context, RAG, and Agents | specialization | 8 | 120 | swappable |
| AIE-303 | Production AI: Serving, Inference, and Operations | specialization | 7 | 110 | mixed |
| AIE-304 | AI Security, Safety, and Governance | specialization | 4 | 60 | mixed |
| AIE-401 | Capstone: Ship a Production AI System | capstone | 5 | 120 | durable |

## Working with it

```bash
npm run check                 # type-check the manifest
npm run validate:curriculum   # weights=100, hours consistent, prereq DAG acyclic, syllabi present
node --experimental-strip-types curriculum/ai-engineer/gen-syllabi.ts   # regenerate syllabus scaffolds
npm test                      # curriculum invariants + the rest of the suite
```

Regenerating syllabi preserves everything authored below the marker line, so
material added by design agents survives a manifest change.
