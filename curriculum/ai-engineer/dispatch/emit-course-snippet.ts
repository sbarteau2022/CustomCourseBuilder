/**
 * Emit the embedded-course-data snippet for dispatch-course.js.
 *
 * Workflow scripts run sandboxed with NO filesystem or Node API access, so
 * they cannot `import` curriculum.ts directly — the course data a dispatch
 * run needs (descentArc, outpaces, ethicsThread, prereqNote, toolchain,
 * modules[]) has to be embedded as a literal in the script. This tool is
 * the single source of truth for that embedding: it reads the real
 * curriculum.ts and prints the JS object literal to paste into
 * dispatch-course.js's COURSES map, so the two can never silently drift.
 *
 * A field not present in curriculum.ts (prereqNote, toolchain — free-text
 * context a dispatched agent needs but the typed manifest doesn't carry)
 * is filled from PACKET_CONTEXT below; add an entry there for any new
 * course before dispatching it.
 *
 * Usage: node --experimental-strip-types curriculum/ai-engineer/dispatch/emit-course-snippet.ts AIE-201
 */
import { aiEngineerCurriculum } from "../curriculum.ts";

// Free-text dispatch context per course — not in the typed manifest because
// it's authoring guidance, not curriculum data. Add an entry before
// dispatching a course that isn't here yet.
const PACKET_CONTEXT: Record<string, { prereqNote: string; toolchain: string; packetFocus: Record<string, string> }> = {
  "AIE-201": {
    prereqNote:
      "Prereq AIE-103 (math as instruments — gradients, optimization, probability, information theory all built and hand-derived) and AIE-110 (data structures/scale — top-k, complexity budgets). Learners can derive a gradient by hand, compute in NumPy, and reason about algorithmic cost, but have never trained a model. This is the first ML course: no deep learning yet (AIE-202), no neural nets. Every algorithm here is built from raw NumPy first, THEN matched against scikit-learn to prove it's not incantation — sklearn is a late-arriving check, never the starting point.",
    toolchain: "Python 3.12+, NumPy, pandas, scikit-learn (comparison/verification only, never the primary implementation), pytest, matplotlib. No GPUs, no deep learning frameworks — those wait for AIE-202.",
    packetFocus: {
      "AIE-201-M01": "Descend beneath 'the model learns' to what learning actually IS: a bet that the training set resembles the world, made precise via generalization, capacity, bias-variance, and the no-free-lunch reality. Build the first learning curve by hand (train/val error vs. model complexity) and watch overfitting happen live on a toy problem before any named algorithm exists. This module sets the whole course's stance: every later algorithm is just a different way of making this same bet.",
      "AIE-201-M02": "Build linear and logistic regression from raw NumPy: closed-form OLS, then gradient descent (callback to AIE-103-M06), then regularization (L1/L2) as a literal penalty term added to the loss, watched live via coefficient paths as the penalty strength moves. Match every result against sklearn's LinearRegression/Ridge/Lasso to the same tolerance the earlier courses used for their reference implementations. Predict which regularization kills which coefficients before running.",
      "AIE-201-M03": "Build a decision tree from scratch (recursive splitting on information gain / Gini, by hand-computed on a tiny dataset first), then bagging (random forest) and boosting (gradient boosting) as compositions of that one tree. The descent is literal: from one hand-traceable split to an ensemble, built up piece by piece, never imported whole. Match against sklearn's RandomForestClassifier/GradientBoostingClassifier. Predict which ensemble handles a specific messy dataset (missing values, outliers) better, and why, before measuring.",
      "AIE-201-M04": "Build k-means (Lloyd's algorithm, from scratch, watch it converge on a 2D toy set you can plot) and PCA (via the eigendecomposition/SVD machinery from AIE-103-M02, not a library call) from raw NumPy. Connect PCA's low-rank approximation directly to what an 'embedding' will mean starting in AIE-202/AIE-301 — this module is where that word stops being a black box. Predict how many components explain 95% of variance before computing the scree plot.",
      "AIE-201-M05": "The single most load-bearing module in the course: leakage, honest train/val/test splits, cross-validation, and baselines that must be beaten before any claim of 'it works' is credible. Build a leakage bug into a pipeline on purpose (e.g. scaling before splitting, target leakage via a proxy column) and have the learner FIND it from suspiciously good numbers alone — that's the certification artifact, not a passing script. This is the module every later evaluation discipline (AIE-204) assumes was internalized here first.",
      "AIE-201-M06": "The failure catalog, hands-on: Simpson's paradox reproduced on real aggregated data, base-rate neglect demonstrated with a concrete confusion-matrix example, distribution shift simulated by training on one slice and testing on a deliberately different one, and the specific ways an accuracy number lies about a rare-class problem. Each failure mode gets a lab where the learner is handed a model that LOOKS good and must find the lie using only the data, before being told what's wrong.",
      "AIE-201-M07": "Feature engineering as the actual day-to-day work of tabular ML: encoding categoricals (and why one-hot vs target-encoding is a leakage risk, tying back to M05), handling missing data honestly (not just dropna), feature interactions, and why gradient-boosted trees on well-engineered tabular features still beat deep learning on most real tabular problems — a fact the course states and defends with a real benchmark comparison, not received wisdom.",
      "AIE-201-M08": "The course's payoff and its most unusual assessed outcome: given a real business problem, argue — with evidence, not vibes — that ML is the WRONG tool (a rule-based system, a lookup table, or 'don't build it' is better), or that it's the right tool but a much simpler model than the fancy one suffices. Graded on the argument's rigor, not on which answer was reached. This is the module that makes the whole course honest about when NOT to reach for the hammer everyone assumes you want.",
    },
  },
  "AIE-202": {
    prereqNote:
      "Prereq AIE-201 (ML from first principles — the learning problem, gradient descent by hand, the evaluation contract, the failure catalog, all internalized). Co-req AIE-203 (data engineering — not load-bearing for this course's own labs, but running in parallel). Learners have derived gradients by hand (AIE-103) and built linear/logistic regression via hand-rolled gradient descent (AIE-201-M02), but have NEVER built an autograd engine, a neural net, or trained anything with more than one layer. This is the flagship descent-and-build course of the whole curriculum: everything is built from raw NumPy arrays FIRST (autograd, then every architecture), and PyTorch arrives only in M06, as a fluency layer over mechanics already fully understood — never as the starting point.",
    toolchain: "Python 3.12+, NumPy for M01-M05 (autograd through the transformer — all built from raw arrays), PyTorch from M06 onward, matplotlib for loss curves, pytest. GPU access is helpful but not required for the from-scratch modules (small toy models); PyTorch modules assume at least a laptop CPU, GPU optional with a documented CPU fallback.",
    packetFocus: {
      "AIE-202-M01": "Descend to raw NumPy arrays and build a real autograd engine from scratch: a Value/Tensor class with a computation-graph tape, .backward() implementing reverse-mode automatic differentiation via the chain rule the learner already derived by hand in AIE-103-M03. Verify every gradient against manual finite-difference checks (gradcheck) before trusting a single backward pass. This module is the hinge of the whole course: every later architecture (M02-M08) is built ON this engine, not on PyTorch, until M06.",
      "AIE-202-M02": "Train real (tiny) networks on the M01 engine and confront why training is hard: weight initialization (and why naive init explodes/vanishes, demonstrated by deliberately breaking it), batch/layer normalization (built from scratch, not imported), optimizers beyond vanilla SGD (momentum, Adam — derived and implemented, not just named), and learning-rate schedules. Every fix is demonstrated as a fix: show the broken training curve first, apply the technique, show it recover.",
      "AIE-202-M03": "Build a CNN from scratch on the M01 engine: convolution as a specific weight-sharing pattern (not a mysterious operator — implement it as an explicit sliding-window matrix operation first, THEN as the optimized im2col/conv routine), pooling, and what representation learning actually means (visualize learned filters on a small trained model). Connect back to AIE-201-M04's PCA — both are ways of finding structure, one linear, one learned and nonlinear.",
      "AIE-202-M04": "Build an RNN from scratch (the recurrence as an explicit unrolled loop over the M01 engine, watch vanishing gradients happen live on a long sequence), then motivate attention as the SOLUTION to exactly that vanishing-gradient problem — build a minimal attention mechanism from scratch before any 'transformer' vocabulary appears. The descent here is temporal: from a sequential bottleneck to parallel attention, and the learner should feel why the field made that move, not just be told it happened.",
      "AIE-202-M05": "The capstone build: implement the full transformer block from the original paper's actual equations — multi-head self-attention, positional encoding, layer norm placement, the feed-forward sublayer — on the M01 engine, then verify it reproduces expected shapes and gradient flow on a toy sequence task. This is AIE-102-M03's quality bar applied to the hardest architecture in the curriculum: nothing is imported, every equation in the paper becomes a line of code the learner wrote and can explain.",
      "AIE-202-M06": "The re-ascent begins: rebuild M01-M05's architectures in idiomatic PyTorch (nn.Module, autograd, DataLoader) and show that PyTorch's abstractions are now simply faster versions of exactly the mechanics already built by hand — never a new mystery. Benchmark hand-rolled vs PyTorch on the same toy task to make the 'PyTorch is just fast infrastructure over what you understand' claim measurable, not asserted.",
      "AIE-202-M07": "The pathology clinic: hand the learner a training run that is broken in one of several specific, realistic ways (exploding loss, a silent data bug, a frozen-gradient layer, a normalization mistake) and have them diagnose it from the loss curve, gradient norms, and activation statistics ALONE — before being shown the code. This is debugging as a first-class skill, built the same way AIE-100/AIE-101's debugging modules were: reproduce, isolate, hypothesize, verify, on someone else's (deliberately broken) training run.",
      "AIE-202-M08": "Ablation and attribution as the course's evaluation discipline (callback to AIE-201-M05/M06 and forward to AIE-204): given a trained model, systematically remove/vary one component at a time (an attention head, a normalization layer, a skip connection) and attribute the performance change to that component with a defensible experiment design — not vibes. The certification artifact is a written ablation study a skeptical reader would trust.",
    },
  },
  "AIE-203": {
    prereqNote:
      "Prereq AIE-101 (Python fluency, real toolchain — testing, packaging, debugging discipline) and AIE-110 (data structures/scale — the learner already reasons about complexity budgets and can build an index or a cache by hand). Co-req none, but runs alongside AIE-202 in the core tier. This course is NOT about ML — no models are trained here. It is the plumbing every later course assumes exists: a queryable warehouse, pipelines that survive replays and out-of-order data, and — its differentiator — a training/eval corpus built by hand with documented provenance, dedup, filtering, and a written consent posture. AIE-301 (the RAG/retrieval course) directly reuses this course's corpus-construction artifact, so M05 in particular must produce something concrete and reusable, not a toy.",
    toolchain: "Python 3.12+, SQLite/PostgreSQL (SQL fluency built on a real engine, not a toy in-memory table), pandas for batch work, a lightweight orchestrator built by hand first (a DAG-runner in ~200 lines) before naming what Airflow/Dagster add, a minimal streaming harness (a Python generator/queue-based simulation of a log — no Kafka cluster required, but the exactly-once/at-least-once semantics must be real, not hand-waved), pytest, and standard corpus tooling (regex/hash-based dedup, a real contamination-check script run against a held-out set). No GPUs needed.",
    packetFocus: {
      "AIE-203-M01": "Descend from 'query the database' to relational modeling as a discipline: normalization and when to deliberately break it, indexes as a concrete trade (build one by hand on a large table, measure the query-plan difference before and after), and SQL fluency exercised against a real engine (SQLite or Postgres, not an in-memory toy) with schemas that have to survive being asked questions nobody designed them for. Predict what an unindexed query plan will do before running EXPLAIN and finding out.",
      "AIE-203-M02": "Build a batch ETL pipeline from raw scripts first (so every failure mode is visible and hand-traceable), then introduce idempotency as a property you must design for, not get for free — replay the same batch twice on purpose and watch a naive pipeline corrupt itself before fixing it. Build a minimal DAG-runner (~200 lines) before naming what a real orchestrator (Airflow/Dagster) adds on top. Grading is on failure behavior (replays, partial failures, out-of-order arrival), never on a clean happy-path demo.",
      "AIE-203-M03": "Descend into what 'real-time' actually means: logs as the substrate, at-least-once vs exactly-once as a genuinely hard distributed-systems problem (not a checkbox), and a hand-built streaming simulation (Python generator/queue, not a Kafka cluster) that makes the learner produce a duplicate or an out-of-order event on purpose and handle it. The 'exactly-once illusion' in the module title is the lesson: name precisely what mechanism (idempotency keys, dedup windows) is doing the actual work when a system claims exactly-once.",
      "AIE-203-M04": "Data quality as an engineering discipline with the same rigor as testing code: write data expectations (schema, range, null-rate, referential) as executable checks, not documentation; build a minimal lineage tracker that answers 'which raw source produced this row' after several pipeline hops; and instrument monitoring that catches a silent quality regression (a source schema drift, a null-rate spike) before it reaches a downstream consumer. Predict which of several planted data-quality bugs each check will and won't catch, before running them.",
      "AIE-203-M05": "The course's differentiator and its most consequential module: construct an actual training/eval corpus from raw sources by hand — deduplication (exact and near-duplicate, e.g. minhash/simhash), filtering (quality heuristics, language ID, toxicity/PII screens with documented false-positive/negative trade-offs), a real contamination check against a held-out eval set (not just an assertion that one was run), and a written provenance record and consent posture for every source. This corpus artifact is directly reused by AIE-301, so it must be a real, documented, defensible deliverable — graded on the written judgment trail (what was excluded and why), not on corpus size.",
      "AIE-203-M06": "Storage economics as a durable-core lesson wrapped around a swappable-surface subject: the actual trade-offs between row vs. columnar formats (build a small benchmark showing why Parquet beats CSV for the analytic queries this course has been running), what a data lake vs. a warehouse is actually optimizing for, and a real cost model (bytes scanned, storage tier, query frequency) the learner computes by hand for a given workload before naming which current vendor/tool fits it — with the current-tools specifics isolated into a clearly marked section per the course's 'mixed' durability rating.",
    },
  },
  "AIE-204": {
    prereqNote:
      "Prereq AIE-201 (the evaluation discipline's roots: honest train/val/test splits, leakage, baselines that must be beaten, the whole M05/M06 failure catalog). Co-req AIE-203 (data engineering — not load-bearing for this course's own labs). This course is positioned deliberately BEFORE the LLM/generative tier (AIE-301+): the thesis is that a learner should know how to design an eval before they ever build the system it will judge. No new model-building here — every lab is about measurement: gold sets, metrics that resist gaming, statistics that survive scrutiny, and (starting M04) evaluating generative/LLM systems specifically, including building and VALIDATING an LLM-as-judge pipeline against real human-labeled disagreement — not just asserting the judge is good. M04's LLM-as-judge labs need an actual model call path; use a small, cheap, swappable model behind a thin interface (isolate the current-model specifics per the course's own durability-discipline convention) so the durable lesson (judge validation methodology) doesn't rot when the model changes.",
    toolchain: "Python 3.12+, pandas, scipy/statsmodels for the statistics modules (real power analysis, real significance tests — no hand-waved p-values), pytest, a thin LLM-client interface for M04's judge labs (swappable backend, current-model specifics isolated per durability discipline), matplotlib for distributions/power curves. No GPU training — this course measures systems, it doesn't build or train them.",
    packetFocus: {
      "AIE-204-M01": "Descend to why 'it seems to work' is not knowledge: the module opens by handing the learner a system that LOOKS good on a demo and asking them to say, with evidence, whether it actually works — and watching them discover they can't, because no eval exists yet. Build the case, from first principles, for why an eval must be designed before the system it measures, tying directly back to AIE-201-M05's leakage/baseline discipline as the ancestor of everything in this course. This module sets the whole course's stance: an eval is a claim about the world, and claims need evidence.",
      "AIE-204-M02": "Build a gold set by hand for a real task (labeling criteria, inter-annotator agreement measured not assumed, edge cases deliberately included) and a metric that resists gaming — hand the learner a metric, have them find the gaming exploit themselves (a degenerate output that scores perfectly), then fix the metric and prove the exploit no longer works. This is AI-PRIMM applied to measurement itself: predict the gaming vector before being shown it.",
      "AIE-204-M03": "Descend into the actual statistics of experimentation: power analysis (compute the sample size a real experiment needs, by hand, before running it), significance testing done honestly (multiple-comparisons correction, why p-hacking works and how to close it), and regression to the mean demonstrated live on a dataset engineered to produce it. The certification artifact is a statistics clinic: find the specific, named flaw in a real published experiment design, not a generic checklist.",
      "AIE-204-M04": "Evaluating generative systems specifically: rubric-based grading, pairwise comparison (and why pairwise resists a scoring bias that absolute rubrics don't), and building an LLM-as-judge pipeline from scratch — then the module's real payoff: VALIDATE the judge against real human-labeled disagreement data, measure agreement rate, and characterize exactly where and why the judge and the humans diverge. A judge that is merely built and never validated fails this module's whole premise.",
      "AIE-204-M05": "Benchmark forensics as a hands-on investigation: detect contamination in a provided eval set (a held-out set that turns out to overlap training data — find the overlap yourself, don't be told it exists), and Goodharting demonstrated live (optimize hard against a metric on a toy system and watch the metric rise while the real capability it was supposed to measure doesn't, or gets worse). Connects directly to this course's own ethics thread: leaderboards suppress the gap between measured task and claimed capability.",
      "AIE-204-M06": "Error analysis as a practice, not an afterthought: read a large batch of real transcripts/outputs from a provided (flawed) system, build an error taxonomy FROM the data (not from a template handed down), and quantify which error categories actually drive the metric's shortfall — the certification artifact is a taxonomy a second reader could apply consistently, tying back to M02's inter-annotator-agreement discipline.",
      "AIE-204-M07": "The re-ascent and the course's payoff: write an eval report for a genuinely skeptical reader — someone financially or politically motivated to find a hole in the claim. The report must state the eval's own limitations, the confidence level, and what would change the conclusion, modeled directly on the 'defensible judgment trail' standard the whole curriculum has been building toward. Graded on whether a skeptic actually signs it, not on polish.",
    },
  },
  // Add AIE-301, 302, 303, 304, 401 ... here before dispatching them.
};

const code = process.argv[2];
if (!code) {
  console.error("usage: emit-course-snippet.ts <COURSE-CODE>  (e.g. AIE-201)");
  process.exit(1);
}
const course = aiEngineerCurriculum.courses.find((c) => c.code === code);
if (!course) {
  console.error(`unknown course code: ${code}`);
  process.exit(1);
}
const ctx = PACKET_CONTEXT[code];
if (!ctx) {
  console.error(`no PACKET_CONTEXT entry for ${code} — add one to emit-course-snippet.ts first (prereqNote, toolchain).`);
  process.exit(1);
}

const esc = (s: string) => JSON.stringify(s);

const lines: string[] = [];
lines.push(`  '${course.code}': {`);
lines.push(`    code: '${course.code}', title: ${esc(course.title)}, tier: '${course.tier}', durability: '${course.durability}',`);
lines.push(`    descentArc: ${esc(course.descentArc)},`);
lines.push(`    outpaces: ${esc(course.outpaces)},`);
lines.push(`    ethicsThread: ${esc(course.ethicsThread)},`);
lines.push(`    prereqNote: ${esc(ctx.prereqNote)},`);
lines.push(`    toolchain: ${esc(ctx.toolchain)},`);
lines.push(`    packets: [`);
for (const m of course.modules) {
  const focus = ctx.packetFocus[m.id];
  if (!focus) {
    console.error(`warning: no packetFocus for ${m.id} — using its title as a weak placeholder; add real dispatch guidance before running`);
  }
  lines.push(`      { id: ${esc(m.id)}, title: ${esc(m.title)}, hours: ${m.hours}, focus: ${esc(focus ?? m.title)} },`);
}
lines.push(`    ],`);
lines.push(`  },`);

console.log(lines.join("\n"));
