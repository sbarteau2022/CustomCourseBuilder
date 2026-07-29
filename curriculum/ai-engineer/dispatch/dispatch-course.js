// CANONICAL dispatch script — battle-tested authoring the foundation tier
// (AIE-100/101/102/103/104/110, 39 packets). Author every packet of ONE
// course, four-gate each, agents write files straight to disk.
//
// The process (see curriculum/ai-engineer/DISPATCH.md for the full contract):
//   1. Generate this course's COURSES entry:
//        node --experimental-strip-types curriculum/ai-engineer/dispatch/emit-course-snippet.ts AIE-201
//      Paste the output into the COURSES map below, and set SELECTED to
//      that course's code.
//   2. Invoke via Workflow({ scriptPath: "curriculum/ai-engineer/dispatch/dispatch-course.js" }).
//      No `args` — Workflow's args-threading is unreliable for this; the
//      course data is embedded (Workflow scripts have no filesystem access,
//      so they can't import curriculum.ts directly — emit-course-snippet.ts
//      is what keeps this embedding from drifting out of sync with it).
//   3. LESSON LEARNED THE HARD WAY: dispatch ONE course at a time. Running
//      four courses concurrently (16+ agents) hit a session token limit
//      partway through every one of them. One course (5-9 agent calls) is
//      the safe unit; wait for it to land before starting the next.
//   4. Read the gate results. Any packet with overallPass:false has a real,
//      specific defect (the gates are adversarial by design) — fix it with
//      a focused agent that reads the flagged file, applies exactly the
//      named fixes, and re-gates. finish-course.js in this directory
//      handles the case where a dispatch run authored some packets but
//      didn't finish gating all of them (background runs can stall).
//   5. Regenerate the runnable Course and rebuild:
//        node --experimental-strip-types src/generate-course-from-curriculum.ts
//        npm run build && npm test
export const meta = {
  name: 'dispatch-course-materials',
  description: 'Author and four-gate every module packet of one foundation course; agents write materials to disk',
  phases: [
    { title: 'Author', detail: 'one agent per packet writes full lesson material to disk' },
    { title: 'Gate', detail: 'four-gate review per packet: technical, eval-discipline, ethics, coherence' },
  ],
}

// ─────────── EDIT THIS PER RUN ───────────
const SELECTED = 'AIE-100'
// ─────────────────────────────────────────

const COURSES = {
  'AIE-100': {
    code: 'AIE-100', title: 'Working With AI Without Outsourcing Judgment', tier: 'foundation', durability: 'durable',
    descentArc: 'Descend beneath the illusion that generated code you can run is code you understand. Build the judgment instruments — prediction, tracing, verification — by hand on tiny artifacts. Re-ascend able to direct any AI coder while holding the responsibility it cannot.',
    outpaces: 'No mainstream curriculum teaches verification before generation. This is the program’s front door: the stance every later course assumes. The certification artifact is the judgment trail — the spec, the read, the caught error — never a program that runs.',
    ethicsThread: 'Tier 1: what code assistants verifiably do and whose labor trained them. Tier 2: what ‘productivity’ framing suppresses — the transfer of understanding away from the person responsible. Tier 3: when the code fails in production, what exactly did you own?',
    prereqNote: 'NO prior coding assumed — this is the entry point. Learners do NOT know C yet (that is AIE-102) and are only beginning Python (AIE-101 is a co-requisite). All labs use Python read at a beginner level, or pseudocode. The skill taught is directing, reading, and verifying AI-written code — not writing it fluently.',
    toolchain: 'Python 3.12+ read at beginner level; an AI coding assistant (any) as the thing being directed and verified; pytest for the verification labs.',
    packets: [
      { id: 'AIE-100-M01', title: 'The competence trap and the loop', hours: 8, focus: 'Name the competence trap on day one: AI output raises apparent capability faster than actual understanding, invisibly, because the code runs. Introduce AI-PRIMM (Predict, Prompt, Read, Verify, Integrate) and make Prediction-before-Prompting a hard habit. Light on code, heavy on the stance; sets the constitution for the whole program.' },
      { id: 'AIE-100-M02', title: 'Reading code you didn’t write', hours: 12, focus: 'The core skill: read unfamiliar (AI-generated) code line by line and say what it does before running it. Hand-tracing, predicting output, building an accurate mental model of someone else’s code. Assessed as hard as writing. Beginner Python artifacts.' },
      { id: 'AIE-100-M03', title: 'Specification as the decidable contract', hours: 10, focus: 'Turn intent into a specification precise enough that correctness is decidable. Ambiguity is the lesson — the AI does exactly what an ambiguous spec permits. Learners write specs, watch the AI satisfy them in unintended ways, and tighten. The spec becomes the thing you own.' },
      { id: 'AIE-100-M04', title: 'Verification instruments: traces, assertions, tests', hours: 14, focus: '‘It ran without error’ is never verification. Build the discriminating checks: hand-traces, assertions, and the first real tests (pytest). Every AI-generated artifact from here ships with a check that could have failed. The heaviest lab-based module of the course.' },
      { id: 'AIE-100-M05', title: 'Debugging generated code', hours: 10, focus: 'Reproduce, isolate, hypothesize, verify — on code you didn’t write and don’t fully understand. Debugging as the moment fundamentals arrive as instruments (a bug requires you to learn the concept to fix it). Beginner Python bugs with planted defects.' },
      { id: 'AIE-100-M06', title: 'Ownership, provenance, licensing', hours: 6, focus: 'Accepting the outcome regardless of who or what produced the artifact. Provenance of AI-generated code, licensing and training-data questions, what it means to sign your name to code a model wrote. Ethics of ownership made concrete. Lighter; closes the course.' },
    ],
  },
  'AIE-101': {
    code: 'AIE-101', title: 'Python and Software Craft', tier: 'foundation', durability: 'durable',
    descentArc: 'Descend from ‘it works’ to why: read the machine’s behavior in small programs before writing large ones, and prove every claim with a test. Build a real toolkit by hand. Re-ascend fluent, with tests as the instrument you reach for first, not last.',
    outpaces: 'Codebase-reading is assessed as hard as writing (no one else does this); testing taught from week one as the primary verification instrument, not a later chapter; every lab is a real artifact in the learner’s growing published toolkit repo.',
    ethicsThread: 'Tier 1: open source runs the world and is maintained by unpaid labor. Tier 2: what ‘community’ framing suppresses — extraction without contribution as the industry norm. Tier 3: your toolkit depends on maintainers you’ll never thank; what do you owe the commons you build on?',
    prereqNote: 'Prereq AIE-100 (the AI-PRIMM verification stance and reading discipline). Co-req with AIE-103 (math). Learners can read beginner Python and verify AI code; this course makes them fluent WRITERS. No C yet (AIE-102). Every lab is a real artifact committed to a published, CI-green toolkit package the learner maintains across the whole course.',
    toolchain: 'Python 3.12+, pytest (and property-based tests via hypothesis), git, a CI provider (GitHub Actions), packaging (pyproject/uv or pip).',
    packets: [
      { id: 'AIE-101-M01', title: 'The interpreter, values, names, and state', hours: 14, focus: 'What a Python program actually is: the interpreter, objects, names as bindings (callback to AIE-100’s aliasing), mutability, and state as the thing that makes programs hard. Predict-before-run on aliasing and mutation. Build the first toolkit module.' },
      { id: 'AIE-101-M02', title: 'Functions, data, and the standard library', hours: 16, focus: 'Functions as contracts, the core data structures (list/dict/set/tuple) and when each is right, iterators/generators, comprehensions, and the standard library as a toolbox to read before reaching for pip. Real toolkit functions with tests.' },
      { id: 'AIE-101-M03', title: 'Classes, protocols, and typing', hours: 16, focus: 'Classes, dunder methods, protocols/duck typing, and type hints as a machine-checked contract (mypy/pyright). Predict shape/type errors before running. When a class is right and when a function is enough.' },
      { id: 'AIE-101-M04', title: 'Testing as a way of thinking (pytest, property tests)', hours: 16, focus: 'Testing as the primary verification instrument, not a chore: pytest fluency, fixtures, parametrization, and property-based testing (hypothesis) — tests that find the inputs you didn’t think of. Tests written before or alongside code, always.' },
      { id: 'AIE-101-M05', title: 'Git, review, and collaborative craft', hours: 12, focus: 'Git fluency beyond commit/push: branching, rebase, resolving conflicts, reading history, and the review workflow (PRs, giving and taking review). Collaboration as a craft. The toolkit repo gets real branches and PRs.' },
      { id: 'AIE-101-M06', title: 'Errors, logging, debugging, profiling', hours: 16, focus: 'Errors and exceptions done right, structured logging, debugging with a debugger (not print), and profiling to fix slowness by measurement, not guessing. Given a slow/broken toolkit function, diagnose and fix with evidence.' },
      { id: 'AIE-101-M07', title: 'Packaging, environments, CI', hours: 14, focus: 'Reproducible environments, packaging the toolkit as a real installable, and wiring CI so tests run on every push. The learner ships a published, CI-green package. Predict what breaks a build before it breaks.' },
      { id: 'AIE-101-M08', title: 'Reading real codebases', hours: 16, focus: 'The capstone skill: read a 2,000-line unfamiliar real open-source repo and produce an accurate structural map in under two hours. Assessed as hard as writing. Timed structural-map exam on an unseen repo.' },
    ],
  },
  'AIE-103': {
    code: 'AIE-103', title: 'Mathematics for AI, Taught as Instruments', tier: 'foundation', durability: 'durable',
    descentArc: 'Descend from the symbol to the raw computation it compresses: compute the gradient, the projection, the expectation by hand and in NumPy before trusting the notation. Build each concept as a working operation. Re-ascend able to read a paper’s math as instruments, seeing exactly what each equation buys.',
    outpaces: 'Math arrives exactly when a real problem needs it (a shape error, an exploding loss, a misread benchmark) — never as prerequisite lectures. Every concept is taught twice: once in symbols, once in NumPy, and assessed by PREDICTING real numerical behavior, then measuring.',
    ethicsThread: 'Tier 1: mathematical results are the least contestable knowledge in the stack. Tier 2: what mathematical dressing suppresses — an equation lends false authority to whatever assumptions were fed into it. Tier 3: which number in your model’s report would you least like an auditor to ask you to derive?',
    prereqNote: 'Prereq AIE-100. Co-req with AIE-101 (Python). Learners can read/write beginner-to-intermediate Python and use NumPy. Every concept is taught in symbols AND in NumPy; labs predict numerical behavior then measure. No ML yet — this is the instrument-building that AIE-201/202 will wield.',
    toolchain: 'Python 3.12+, NumPy, matplotlib for seeing; pytest for the prediction-vs-measurement labs. By-hand derivation on paper is a graded artifact.',
    packets: [
      { id: 'AIE-103-M01', title: 'Linear algebra I: vectors, matrices, shape discipline', hours: 18, focus: 'Vectors and matrices as data and as operations; shape as a contract you predict before running (the shape error before it happens). Matrix-vector and matrix-matrix products by hand and in NumPy. Broadcasting rules. This is the module that ends shape-error confusion forever.' },
      { id: 'AIE-103-M02', title: 'Linear algebra II: decompositions, projections, embeddings', hours: 16, focus: 'Dot products as similarity, projections, norms, eigen/SVD intuition, and why embeddings are vectors in a learned space. Compute a projection and a low-rank approximation by hand and in NumPy. Connect to what AIE-201/301 will call embeddings.' },
      { id: 'AIE-103-M03', title: 'Calculus and gradients: the chain rule as an engine', hours: 18, focus: 'Derivatives as sensitivity, the gradient as a direction, and the chain rule as the engine backprop will automate (forward reference to AIE-202’s autograd). Take gradients of small compositions by hand, verify numerically. Predict which way a loss moves.' },
      { id: 'AIE-103-M04', title: 'Probability: uncertainty stated honestly', hours: 18, focus: 'Distributions, expectation, variance, conditional probability, Bayes, and likelihood. Uncertainty as something you state, not hide. Simulate to check every analytic claim. Predict a distribution’s behavior, then sample and measure.' },
      { id: 'AIE-103-M05', title: 'Statistics: estimation, intervals, and the lies of averages', hours: 16, focus: 'Estimation, confidence intervals, hypothesis testing done honestly, and the specific ways averages and samples lie (Simpson’s paradox, survivorship, base rates). This is the statistical honesty AIE-204 will make a full discipline. Find the lie in a real chart.' },
      { id: 'AIE-103-M06', title: 'Optimization: loss landscapes, SGD, convergence intuition', hours: 18, focus: 'Loss landscapes, gradient descent and SGD, learning rate, convexity vs the reality of deep-net landscapes, and convergence intuition. Implement gradient descent from scratch, watch it converge/diverge, predict the effect of a learning-rate change before running.' },
      { id: 'AIE-103-M07', title: 'Information theory: entropy, cross-entropy, KL as distance', hours: 16, focus: 'Entropy, cross-entropy (the loss AIE-202 will train with), and KL divergence as a directed distance between distributions. Compute each by hand and in NumPy. Why cross-entropy is THE classification loss. Predict which distribution has higher entropy, then compute.' },
    ],
  },
  'AIE-104': {
    code: 'AIE-104', title: 'The Machine at Scale: Linux, Networks, Concurrency, Containers', tier: 'foundation', durability: 'durable',
    descentArc: 'Descend from ‘the server handles it’ to the socket, the process, the shared byte two threads fight over. Build a service from those parts. Re-ascend able to reason about a running system’s failure modes instead of trusting its abstractions.',
    outpaces: 'The operational half of the machine, taught right after the C descent so concurrency lands on top of real memory understanding, not before it. Every concept is exercised on real systems; the container is opened up, not invoked.',
    ethicsThread: 'Tier 1: the systems that scale are the systems designed to operate without knowing their users individually. Tier 2: what ‘scale’ suppresses — scale is a decision about relationship, not just throughput. Tier 3: the service you just built holds strangers’ data; what do you owe them that no container enforces?',
    prereqNote: 'Prereq AIE-102 (C, the memory hierarchy, the GIL). Learners know C, pointers, processes-vs-threads at the memory level, and Python. This course adds the OS/network/concurrency/container layer ON TOP of that metal understanding — e.g. the GIL from AIE-102 explains why Python parallelism is process-level.',
    toolchain: 'Linux shell (bash), C and Python for the socket/concurrency labs, Docker for containers, standard tools (curl, ss/netstat, strace/ltrace where useful). Real machines, measured.',
    packets: [
      { id: 'AIE-104-M01', title: 'Linux, the shell, processes, and signals', hours: 14, focus: 'The OS as the thing running your program: the shell, processes and the process tree, file descriptors, permissions, and signals. Write shell that composes real tools; send and handle a signal. Predict what a pipeline does before running it.' },
      { id: 'AIE-104-M02', title: 'Networking and APIs from the wire up', hours: 16, focus: 'Networking from the socket up: TCP, HTTP as text on a wire, TLS, DNS, latency vs bandwidth. Write a tiny socket server and client in C and/or Python, then an HTTP handler. Predict round-trip behavior; read a real request/response by hand.' },
      { id: 'AIE-104-M03', title: 'Concurrency, parallelism, and shared state', hours: 16, focus: 'Concurrency vs parallelism, threads vs processes, the shared-mutable-state hazard (callback to AIE-102’s non-atomic increment and the GIL), locks, and why Python parallelism is process-level. Build a program with a real race, then fix it. Predict the race before you see it.' },
      { id: 'AIE-104-M04', title: 'Containers and reproducible environments, opened up', hours: 14, focus: 'What a container actually IS (namespaces + cgroups over one kernel, not a VM), images and layers, and reproducibility. Build and inspect a container from a Dockerfile; open it up to see the process from the host. Predict image size and what a layer caches.' },
      { id: 'AIE-104-M05', title: 'Putting it together: a measured, containerized service', hours: 10, focus: 'Capstone: containerize a small service, put it under load, and measure its real resource envelope (latency, memory, CPU) and failure behavior. Predict the SLO before load-testing; explain where it breaks and why in the terms of M01–M04.' },
    ],
  },
  'AIE-110': {
    code: 'AIE-110', title: 'Data Structures, Algorithms, and Scale', tier: 'foundation', durability: 'durable',
    descentArc: 'Descend beneath the library call to the structure doing the work, and watch it break at 10^9 items. Build the structures AI leans on — the ANN index, the streaming counter — by hand. Re-ascend choosing data structures by measured cost, not habit.',
    outpaces: 'Ruthlessly scoped to what AI systems use — vector search, top-k, streaming aggregation, graph algorithms — with every structure benchmarked at scale rather than recited. No leetcode theater; assessment is building components later courses import (the ANN index is reused in AIE-302).',
    ethicsThread: 'Tier 1: algorithmic choices are measurable trade-offs. Tier 2: what ‘efficiency’ suppresses — approximate algorithms trade correctness for speed, and the error lands on whoever is hardest to retrieve. Tier 3: your ANN index will silently fail to find someone; who?',
    prereqNote: 'Prereq AIE-101 (Python fluency, testing). Co-req AIE-102 (the memory hierarchy — why cache-friendly layout matters). Learners write tested Python and understand memory cost. Every structure is built from scratch, tested, and benchmarked AT SCALE; the ANN index built here is imported by AIE-302 (RAG).',
    toolchain: 'Python 3.12+, NumPy for the vector/ANN work, pytest for correctness, and a benchmarking harness (time/memory at growing N). Big-O claims must be demonstrated with measured curves.',
    packets: [
      { id: 'AIE-110-M01', title: 'Complexity as a budget', hours: 10, focus: 'Big-O as a spending budget, not an exam trick: what breaks at 10^6, 10^9, 10^12 items. Amortized analysis (callback to AIE-102’s growable vector doubling). Measure a real curve and match it to its complexity class. Predict where a structure falls over.' },
      { id: 'AIE-110-M02', title: 'Arrays, hashing, and the structures under NumPy and dicts', hours: 14, focus: 'The structures under the ones you already use: contiguous arrays (why NumPy is fast — callback to AIE-102), hash tables (what a Python dict really is), collision handling, load factor. Build a hash table from scratch; benchmark against dict; predict collision behavior.' },
      { id: 'AIE-110-M03', title: 'Trees, heaps, and top-k at scale', hours: 14, focus: 'Trees, balanced trees, and heaps — with top-k (the operation retrieval and ranking actually need) as the driving problem. Build a heap; implement top-k two ways; benchmark. Predict which wins at large N vs small k before measuring.' },
      { id: 'AIE-110-M04', title: 'Graphs: traversal, shortest paths, PageRank intuition', hours: 14, focus: 'Graphs as the structure under knowledge, links, and relationships: representation, BFS/DFS, shortest paths, and PageRank intuition (eigenvector centrality, forward link to AIE-103 linear algebra). Build a graph and traverse it; predict traversal order and cost.' },
      { id: 'AIE-110-M05', title: 'Similarity search: exact to approximate nearest neighbors', hours: 16, focus: 'THE differentiator module: exact nearest-neighbor search, why it dies at scale, and approximate NN (LSH / HNSW intuition) as the trade of correctness for speed. Build an ANN index from scratch that AIE-302 (RAG) will import. Measure recall vs speed; predict the recall cliff.' },
      { id: 'AIE-110-M06', title: 'Streaming and sketching: counting when you can’t hold the data', hours: 12, focus: 'Counting and aggregating when the data does not fit in memory: streaming, reservoir sampling, and sketches (Bloom filter, HyperLogLog, Count-Min) as bounded-memory approximations. Build a Bloom filter and a HLL; predict the false-positive rate, then measure it.' },
    ],
  },
}

const course = COURSES[SELECTED]
if (!course) throw new Error(`unknown course: ${SELECTED}`)
const packets = course.packets
const DIR = `/home/user/CustomCourseBuilder/curriculum/ai-engineer/materials/${course.code}`

const PHILOSOPHY = `Binding curriculum philosophy — build to THIS, not textbook convention:
1. Descend, build, re-ascend: enter below the abstraction, build the thing at the substrate by hand, re-ascend to command the high-level tool.
2. Verification before generation: AI-PRIMM (Predict, Prompt, Read, Verify, Integrate) is the loop under every lab. Every lab states its Predict step (on paper, before code) before its Build step. A program that merely runs is never sufficient evidence — the artifact is the judgment trail.
3. Evaluation is a spine: every assessment must be gaming-resistant — a learner must not be able to pass without demonstrating the outcome. Grade the prediction and the reasoning, not just a passing program.
4. Ethics with teeth: the three-tier reading is specific to THIS module's subject — Tier 1 material ground (verifiable facts), Tier 2 what the field suppresses (what boosters can't say and critics idealize), Tier 3 "sit with this" (a QUESTION the learner cannot unknow, not a lecture).
5. The judgment trail is the credential: assessment measures judgment demonstrated, never content retained.`

const BAR = `THE QUALITY BAR (match this depth). The reference is AIE-102-M03 "The heap, manual memory, structs, and the segfault": 4 lessons each with teaching text + a worked example + named misconceptions; 3 labs each with explicit Predict (on paper, before code) / Build / Verify subsections and real starter+solution+test code; a gaming-resistant assessment graded on the judgment trail (predict, locate, fix, prove) not "it runs"; Elle pacing notes naming the walls, the reroutes, the accelerate conditions, and which struggle is productive vs blocked; and a subject-specific three-tier reading whose Tier 3 is a real question. Be concrete and technical — real code, real numbers, real worked examples. This is the material a learner actually uses, not an outline.`

const COURSE_CTX = `COURSE: ${course.code} — "${course.title}" (${course.tier} tier, durability ${course.durability}).
DESCENT ARC: ${course.descentArc}
WHAT OUTPACES THE FIELD: ${course.outpaces}
ETHICS THREAD (course-level): ${course.ethicsThread}
PREREQUISITE CONTEXT: ${course.prereqNote}
TOOLCHAIN: ${course.toolchain}`

const AUTHOR_SCHEMA = {
  type: 'object', additionalProperties: false,
  required: ['packetId', 'wrote', 'labCount', 'everyLabHasPredictStep'],
  properties: {
    packetId: { type: 'string' },
    wrote: { type: 'boolean', description: 'True if the full packet markdown was written to disk.' },
    labCount: { type: 'integer' },
    everyLabHasPredictStep: { type: 'boolean' },
    selfSummary: { type: 'string' },
  },
}

const GATE_SCHEMA = {
  type: 'object', additionalProperties: false,
  required: ['packetId', 'technical', 'evalDiscipline', 'ethics', 'coherence', 'overallPass', 'topFixes'],
  properties: {
    packetId: { type: 'string' },
    technical: { type: 'object', additionalProperties: false, required: ['pass', 'notes'], properties: { pass: { type: 'boolean' }, notes: { type: 'string' } } },
    evalDiscipline: { type: 'object', additionalProperties: false, required: ['pass', 'notes'], properties: { pass: { type: 'boolean' }, notes: { type: 'string' } } },
    ethics: { type: 'object', additionalProperties: false, required: ['pass', 'notes'], properties: { pass: { type: 'boolean' }, notes: { type: 'string' } } },
    coherence: { type: 'object', additionalProperties: false, required: ['pass', 'notes'], properties: { pass: { type: 'boolean' }, notes: { type: 'string' } } },
    overallPass: { type: 'boolean' },
    topFixes: { type: 'array', items: { type: 'string' } },
  },
}

log(`Dispatching ${course.code}: ${packets.length} packets → author (to ${DIR}) → four-gate`)

const results = await pipeline(
  packets,
  (p) => agent(
    `You are a senior curriculum engineer authoring one module of a first-party AI Engineer curriculum built to outpace every course on the internet.\n\n${COURSE_CTX}\n\n${PHILOSOPHY}\n\n${BAR}\n\nAUTHOR THIS PACKET IN FULL and WRITE it to ${DIR}/${p.id}.md using the Write tool:\n${p.id} — "${p.title}" (${p.hours} learner-hours)\nModule focus: ${p.focus}\n\nThe file must contain: a header, ## Lessons (each with teaching text, worked example, named misconceptions), ## Labs (each with explicit Predict / Build / Verify and real starter+solution+test code in fenced blocks), ## Assessment (with a gaming-resistant rubric table), ## Elle pacing notes, ## Three-tier reading. Match the M03 reference depth. All code must be correct under the stated toolchain. Write the complete file, then report.`,
    { label: `author:${p.id}`, phase: 'Author', schema: AUTHOR_SCHEMA, effort: 'high' }
  ).then((authored) =>
    agent(
      `You are an adversarial curriculum reviewer running the four quality gates on a just-written module packet. READ ${DIR}/${p.id}.md with the Read tool — that file is the source of truth, not any summary.\n\n${COURSE_CTX}\n\n${PHILOSOPHY}\n\n${BAR}\n\nPACKET: ${p.id} — "${p.title}". Author reported labCount=${authored?.labCount}, everyLabHasPredictStep=${authored?.everyLabHasPredictStep}.\n\nRun the four gates strictly. TECHNICAL: could a learner do every lab from the materials alone, and is every code answer-key correct under the toolchain? (Trace the code yourself.) EVAL-DISCIPLINE: is the assessment gaming-resistant, is Predict-before-Build real in every lab? ETHICS: is the three-tier reading subject-specific and is Tier 3 a real question? COHERENCE: does it honor the descent arc and resolve cross-module references? overallPass only if all four pass. Append a "## Gate report" section to the END of the file (use Edit/Write) recording each gate's pass/notes and any top fixes, then return the verdict.`,
      { label: `gate:${p.id}`, phase: 'Gate', schema: GATE_SCHEMA, effort: 'medium' }
    ).then((verdict) => ({ p, authored, verdict }))
  )
)

const clean = results.filter(Boolean)
const passed = clean.filter((r) => r.verdict?.overallPass)
log(`${course.code}: ${passed.length}/${clean.length} packets passed all four gates`)

return {
  course: course.code,
  summary: clean.map((r) => ({
    packetId: r.p.id, title: r.p.title,
    wrote: r.authored?.wrote ?? false, labCount: r.authored?.labCount ?? 0,
    overallPass: r.verdict?.overallPass ?? false,
    gates: { technical: r.verdict?.technical?.pass, evalDiscipline: r.verdict?.evalDiscipline?.pass, ethics: r.verdict?.ethics?.pass, coherence: r.verdict?.coherence?.pass },
    topFixes: r.verdict?.topFixes ?? [],
  })),
}
