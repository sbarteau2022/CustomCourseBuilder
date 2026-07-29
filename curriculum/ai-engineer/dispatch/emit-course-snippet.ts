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
  // Add AIE-202, AIE-203, AIE-204, ... here before dispatching them.
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
