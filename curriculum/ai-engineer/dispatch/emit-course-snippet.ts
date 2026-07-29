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
  // Add AIE-203, AIE-204, ... here before dispatching them.
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
