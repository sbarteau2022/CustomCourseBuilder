/**
 * The AI Engineer Curriculum — first-party, weighted, complete.
 *
 * Not a map over other people's courses: every course here is ours to
 * teach. 14 courses, ~1500 hours, weights sum to 100. Each module is a
 * dispatchable work packet (see DISPATCH.md) so material design can fan
 * out across parallel agents without losing coherence.
 *
 * Full teaching detail per course: syllabi/<code>.md.
 */
import type { Curriculum } from "../../src/types/curriculum.ts";

export const aiEngineerCurriculum: Curriculum = {
  id: "ai-engineer-curriculum",
  title: "The AI Engineer Curriculum",
  version: "1.0.0",
  thesis:
    "A complete, first-party path from zero to production AI engineer, built on a philosophy rather than inherited from how these subjects have been taught. In every course the learner descends below the abstraction to the substrate where the thing actually lives, builds it there by hand, and re-ascends to command the high-level tool as an instrument rather than invoke it as a mystery. Verification is taught before generation; evaluation runs as a spine, not a module; ethics carries structural teeth; the durable core is separated from the swappable tool surface so the material outlasts the tools. Every module is assessed by judgment demonstrated, never by content retained — and the whole program is run adaptively, and witnessed, by Elle.",
  philosophy: [
    {
      name: "Descend, build, re-ascend",
      statement:
        "Every subject is entered below its abstraction. The learner goes down to the substrate where it actually lives, builds it there with their own hands, then re-ascends to wield the high-level tool as an instrument they command.",
      practice:
        "Python then C then back to fast Python. Symbols then the raw computation then the symbol as a compression you now trust. sklearn only after you have matched it from scratch. The framework only after you have built the primitive. No course lets a learner operate a tool they could not, in miniature, rebuild.",
    },
    {
      name: "Verification before generation",
      statement:
        "Reading and verifying are taught before fluent producing. The competence trap — working output you do not understand — is named on day one and designed against in every assessment.",
      practice:
        "AI-PRIMM (Predict, Prompt, Read, Verify, Integrate) is the loop under every lab. A program that merely runs is never sufficient evidence; the certification artifact is the judgment trail — the spec, the read, the caught error.",
    },
    {
      name: "Evaluation is a spine, not a module",
      statement:
        "You may not claim a thing works until you can measure that it works. Measurement is a discipline the learner carries from the first course, formalized mid-program, and required of every project after.",
      practice:
        "Prediction-then-measurement grading from the foundations; a full evaluation course (AIE-204) positioned before the LLM tier; and from there nothing ships — no model, no RAG system, no deployment — without its own eval harness.",
    },
    {
      name: "Ethics with structural teeth",
      statement:
        "Ethics is an engineering constraint, not a discussion week. It lives in gates, threat models, and sign-offs — and in a three-tier reading of every subject the learner cannot pass without producing.",
      practice:
        "Each module carries a three-tier reading: material ground, what the field suppresses, and the question the learner cannot unknow. Later courses make it operational: eval gates on deploy, abuse cases before use cases, a defense panel that asks who bears the cost if you are wrong.",
    },
    {
      name: "Durable core, swappable surface",
      statement:
        "Fundamentals that outlast any tool are taught as durable; the current-tools layer is explicitly marked swappable and refreshable without touching the core. The curriculum is architected to not decay in months.",
      practice:
        "Every course declares its durability. The metal, the math, the algorithms, and the from-scratch builds are durable; the specific frameworks, providers, and current model APIs are swappable and versioned separately, so the program stays ahead as the tools churn beneath it.",
    },
    {
      name: "The judgment trail is the credential",
      statement:
        "Assessment measures judgment demonstrated, never content retained. The learner's accumulating corpus of sealed observer readings and judgment trails is the credential no exam and no certificate pile can match.",
      practice:
        "Every course seals its readings into the tamper-evident corpus. By the capstone the learner defends a real shipped system against an adversarial panel, and hands over the artifact set a hiring manager actually wants — plus the sealed record of how they came to see what they see.",
    },
  ],
  totalHours: 1590,
  courses: [
    {
      code: "AIE-100",
      durability: "durable",
      descentArc:
        "Descend beneath the illusion that generated code you can run is code you understand. Build the judgment instruments — prediction, tracing, verification — by hand on tiny artifacts. Re-ascend able to direct any AI coder while holding the responsibility it cannot.",
      title: "Working With AI Without Outsourcing Judgment",
      tier: "foundation",
      weightPercent: 4,
      hours: 60,
      prerequisites: [],
      corequisites: [],
      outcomes: [
        "Run the AI-PRIMM loop (Predict, Prompt, Read, Verify, Integrate) unprompted on any generated artifact",
        "Catch planted defects in AI-written code at D2 subtlety without hints",
        "Produce a judgment trail — spec, read, caught error — as the certification artifact for real work",
      ],
      outpaces:
        "No mainstream curriculum teaches verification before generation. This is AI Coding 101 (already specified in courses/ai-coding-101) promoted to the program's front door: the stance every later course assumes.",
      assessmentWeights: [
        { kind: "judgment-trails", percent: 60, note: "per-exercise: prediction quality, defect catches, verification rigor" },
        { kind: "clean-run discrimination", percent: 25, note: "correctly judging defect-free artifacts as clean — no paranoia points" },
        { kind: "sealed-readings", percent: 15, note: "weekly three-tier readings on the tools being used" },
      ],
      modules: [
        { id: "AIE-100-M01", title: "The competence trap and the loop", hours: 8 },
        { id: "AIE-100-M02", title: "Reading code you didn't write", hours: 12 },
        { id: "AIE-100-M03", title: "Specification as the decidable contract", hours: 10 },
        { id: "AIE-100-M04", title: "Verification instruments: traces, assertions, tests", hours: 14 },
        { id: "AIE-100-M05", title: "Debugging generated code", hours: 10 },
        { id: "AIE-100-M06", title: "Ownership, provenance, licensing", hours: 6 },
      ],
      ethicsThread:
        "Tier 1: what code assistants verifiably do and whose labor trained them. Tier 2: what 'productivity' framing suppresses — the transfer of understanding away from the person responsible. Tier 3: when the code fails in production, what exactly did you own?",
      paceHoursPerWeek: [5, 10],
    },
    {
      code: "AIE-101",
      durability: "durable",
      descentArc:
        "Descend from 'it works' to why: read the machine's behavior in small programs before writing large ones, and prove every claim with a test. Build a real toolkit by hand. Re-ascend fluent, with tests as the instrument you reach for first, not last.",
      title: "Python and Software Craft",
      tier: "foundation",
      weightPercent: 7,
      hours: 120,
      prerequisites: ["AIE-100"],
      corequisites: ["AIE-103"],
      outcomes: [
        "Write idiomatic, tested, typed Python: functions, classes, iterators, context managers, async basics",
        "Drive git fluently including branching, rebase, review workflow; ship a package with CI",
        "Profile and fix a slow program using measurement, not guessing",
        "Read a 2,000-line unfamiliar codebase and produce an accurate structural map in under two hours",
      ],
      outpaces:
        "Codebase-reading is assessed as hard as writing (no one else does this); testing taught from week one as the primary verification instrument, not a later chapter; every lab is a real artifact in the learner's growing toolkit repo.",
      assessmentWeights: [
        { kind: "labs", percent: 40, note: "weekly graded artifacts, tests required to pass" },
        { kind: "codebase-reading exams", percent: 25, note: "timed structural maps of unseen real repos" },
        { kind: "toolkit project", percent: 25, note: "a published, CI-green package the learner maintains all course" },
        { kind: "sealed-readings", percent: 10, note: "weekly three-tier readings" },
      ],
      modules: [
        { id: "AIE-101-M01", title: "The interpreter, values, names, and state", hours: 14 },
        { id: "AIE-101-M02", title: "Functions, data, and the standard library", hours: 16 },
        { id: "AIE-101-M03", title: "Classes, protocols, and typing", hours: 16 },
        { id: "AIE-101-M04", title: "Testing as a way of thinking (pytest, property tests)", hours: 16 },
        { id: "AIE-101-M05", title: "Git, review, and collaborative craft", hours: 12 },
        { id: "AIE-101-M06", title: "Errors, logging, debugging, profiling", hours: 16 },
        { id: "AIE-101-M07", title: "Packaging, environments, CI", hours: 14 },
        { id: "AIE-101-M08", title: "Reading real codebases", hours: 16 },
      ],
      ethicsThread:
        "Tier 1: open source runs the world and is maintained by unpaid labor. Tier 2: what 'community' framing suppresses — extraction without contribution as the industry norm. Tier 3: your toolkit depends on maintainers you'll never thank; what do you owe the commons you build on?",
      paceHoursPerWeek: [8, 14],
    },
    {
      code: "AIE-102",
      durability: "durable",
      descentArc:
        "The literal instance of the whole philosophy: Python DOWN to C — pointers, bytes, the stack frame Python hides — then BACK UP to Python you can make fast because the machine is no longer a metaphor. The descent that teaches every later descent what it feels like.",
      title: "Down to the Metal: C, and the Machine Under Python",
      tier: "foundation",
      weightPercent: 6,
      hours: 100,
      prerequisites: ["AIE-101"],
      corequisites: [],
      outcomes: [
        "Read and write C: pointers, manual memory, structs, the stack and the heap — and explain a segfault from the code",
        "Explain what every Python line costs by knowing what it compiles down to: objects, refcounts, the GIL, why a loop is slow",
        "Measure the memory hierarchy and predict when code is compute-bound vs memory-bound vs I/O-bound",
        "Re-ascend: write Python that is fast because you know the machine — vectorize, batch, and reach for C/NumPy internals deliberately",
        "Estimate cost and latency of a compute job (CPU vs GPU) before running it, within 2x",
      ],
      outpaces:
        "The descent-and-return spine no bootcamp attempts: Python first (AIE-101), then DOWN to C to see the pointer, the byte, and the stack frame that Python hides, then BACK UP to write Python that is fast because the machine is no longer a mystery. This is why the graduate understands why training is slow and inference is expensive at the level of the hardware, not the metaphor — and it is measured on real machines, never described.",
      assessmentWeights: [
        { kind: "C implementation labs", percent: 35, note: "pointer/memory/struct programs, valgrind-clean, tests green" },
        { kind: "measurement labs", percent: 30, note: "every performance claim shown with numbers; predict-then-measure" },
        { kind: "re-ascent project", percent: 25, note: "take a slow Python program, explain its cost in machine terms, make it fast with evidence" },
        { kind: "sealed-readings", percent: 10, note: "weekly three-tier readings" },
      ],
      modules: [
        { id: "AIE-102-M01", title: "Why descend: what Python hides and why it matters", hours: 8 },
        { id: "AIE-102-M02", title: "C I: values, types, pointers, and the stack", hours: 18 },
        { id: "AIE-102-M03", title: "C II: the heap, manual memory, structs, and the segfault", hours: 20 },
        { id: "AIE-102-M04", title: "The memory hierarchy, measured", hours: 14 },
        { id: "AIE-102-M05", title: "Back up: what a Python object really is (CPython internals, the GIL, refcounts)", hours: 16 },
        { id: "AIE-102-M06", title: "The re-ascent: fast Python because you know the metal (NumPy internals, vectorization)", hours: 12 },
        { id: "AIE-102-M07", title: "GPUs: why they exist, what they cost, when they pay", hours: 12 },
      ],
      ethicsThread:
        "Tier 1: compute concentration is measurable — who owns the accelerators owns the frontier. Tier 2: what abstraction suppresses — 'it just works' hides that someone always pays the real cost in memory, power, and a data center somewhere specific. Tier 3: every training run spends someone's watershed; at what capability gain is that spend justified, and who decides?",
      paceHoursPerWeek: [7, 12],
    },
    {
      code: "AIE-104",
      durability: "durable",
      descentArc:
        "Descend from 'the server handles it' to the socket, the process, the shared byte two threads fight over. Build a service from those parts. Re-ascend able to reason about a running system's failure modes instead of trusting its abstractions.",
      title: "The Machine at Scale: Linux, Networks, Concurrency, Containers",
      tier: "foundation",
      weightPercent: 4,
      hours: 70,
      prerequisites: ["AIE-102"],
      corequisites: [],
      outcomes: [
        "Use Linux fluently: shell, processes, filesystems, permissions, signals",
        "Reason about networking and APIs from the wire up: sockets, HTTP, TLS, latency",
        "Reason about concurrency and parallelism well enough to not corrupt shared state — and know why the GIL from AIE-102 forces process-level parallelism in Python",
        "Containerize a service reproducibly and know what the container actually is",
      ],
      outpaces:
        "The operational half of the machine, taught right after the descent so concurrency lands on top of real memory understanding, not before it. Every concept is exercised on real systems; the container is opened up, not invoked.",
      assessmentWeights: [
        { kind: "systems labs", percent: 50, note: "shell, socket, and concurrency programs on real machines" },
        { kind: "estimation exams", percent: 20, note: "predict latency/throughput/memory before running; graded on calibration" },
        { kind: "service project", percent: 20, note: "containerized service with a measured resource envelope" },
        { kind: "sealed-readings", percent: 10, note: "weekly three-tier readings" },
      ],
      modules: [
        { id: "AIE-104-M01", title: "Linux, the shell, processes, and signals", hours: 14 },
        { id: "AIE-104-M02", title: "Networking and APIs from the wire up", hours: 16 },
        { id: "AIE-104-M03", title: "Concurrency, parallelism, and shared state", hours: 16 },
        { id: "AIE-104-M04", title: "Containers and reproducible environments, opened up", hours: 14 },
        { id: "AIE-104-M05", title: "Putting it together: a measured, containerized service", hours: 10 },
      ],
      ethicsThread:
        "Tier 1: the systems that scale are the systems designed to operate without knowing their users individually. Tier 2: what 'scale' suppresses — scale is a decision about relationship, not just throughput. Tier 3: the service you just built holds strangers' data; what do you owe them that no container enforces?",
      paceHoursPerWeek: [6, 10],
    },
    {
      code: "AIE-103",
      durability: "durable",
      descentArc:
        "Descend from the symbol to the raw computation it compresses: compute the gradient, the projection, the expectation by hand and in NumPy before trusting the notation. Build each concept as a working operation. Re-ascend able to read a paper's math as instruments, seeing exactly what each equation buys.",
      title: "Mathematics for AI, Taught as Instruments",
      tier: "foundation",
      weightPercent: 8,
      hours: 120,
      prerequisites: ["AIE-100"],
      corequisites: ["AIE-101"],
      outcomes: [
        "Compute with and reason about vectors, matrices, and tensor shapes fluently; predict a shape error before running",
        "Take gradients by hand for small compositions and explain what backprop automates",
        "Use probability to state and check claims: distributions, expectation, Bayes, likelihood",
        "Read the math in a modern ML paper and identify what each equation buys",
      ],
      outpaces:
        "Math arrives exactly when a real problem needs it (a shape error, an exploding loss, a misread benchmark) — never as prerequisite lectures. Every concept is taught twice: once in symbols, once in NumPy, and assessed by predicting real numerical behavior.",
      assessmentWeights: [
        { kind: "prediction labs", percent: 45, note: "state what the computation will do, then run it; graded on calibration" },
        { kind: "derivation checkpoints", percent: 25, note: "by-hand gradients and proofs at module boundaries" },
        { kind: "paper-reading exams", percent: 20, note: "annotate the math of one real paper per tier" },
        { kind: "sealed-readings", percent: 10, note: "weekly three-tier readings" },
      ],
      modules: [
        { id: "AIE-103-M01", title: "Linear algebra I: vectors, matrices, shape discipline", hours: 18 },
        { id: "AIE-103-M02", title: "Linear algebra II: decompositions, projections, embeddings", hours: 16 },
        { id: "AIE-103-M03", title: "Calculus and gradients: the chain rule as an engine", hours: 18 },
        { id: "AIE-103-M04", title: "Probability: uncertainty stated honestly", hours: 18 },
        { id: "AIE-103-M05", title: "Statistics: estimation, intervals, and the lies of averages", hours: 16 },
        { id: "AIE-103-M06", title: "Optimization: loss landscapes, SGD, convergence intuition", hours: 18 },
        { id: "AIE-103-M07", title: "Information theory: entropy, cross-entropy, KL as distance", hours: 16 },
      ],
      ethicsThread:
        "Tier 1: mathematical results are the least contestable knowledge in the stack. Tier 2: what mathematical dressing suppresses — an equation lends false authority to whatever assumptions were fed into it. Tier 3: which number in your model's report would you least like an auditor to ask you to derive?",
      paceHoursPerWeek: [8, 12],
    },
    {
      code: "AIE-110",
      durability: "durable",
      descentArc:
        "Descend beneath the library call to the structure doing the work, and watch it break at 10^9 items. Build the structures AI leans on — the ANN index, the streaming counter — by hand. Re-ascend choosing data structures by measured cost, not habit.",
      title: "Data Structures, Algorithms, and Scale",
      tier: "foundation",
      weightPercent: 5,
      hours: 80,
      prerequisites: ["AIE-101"],
      corequisites: ["AIE-102"],
      outcomes: [
        "Choose and implement the right structure (arrays, hashes, trees, heaps, graphs) for a stated workload and justify it with complexity analysis",
        "Reason about algorithmic cost at AI scale: what breaks at 10^6, 10^9, 10^12 items",
        "Implement the algorithms AI systems actually lean on: search, sort, top-k, nearest neighbors, graph traversal, dynamic programming",
      ],
      outpaces:
        "Ruthlessly scoped to what AI systems use — vector search, top-k, streaming aggregation, graph algorithms — with every structure benchmarked at scale rather than recited. No leetcode theater; assessment is building components the later courses import.",
      assessmentWeights: [
        { kind: "implementation labs", percent: 50, note: "structures built, tested, benchmarked" },
        { kind: "scale analyses", percent: 25, note: "written cost analyses of real AI workloads" },
        { kind: "component project", percent: 15, note: "one production-quality component (e.g. an ANN index) used later in AIE-302" },
        { kind: "sealed-readings", percent: 10, note: "weekly three-tier readings" },
      ],
      modules: [
        { id: "AIE-110-M01", title: "Complexity as a budget", hours: 10 },
        { id: "AIE-110-M02", title: "Arrays, hashing, and the structures under NumPy and dicts", hours: 14 },
        { id: "AIE-110-M03", title: "Trees, heaps, and top-k at scale", hours: 14 },
        { id: "AIE-110-M04", title: "Graphs: traversal, shortest paths, PageRank intuition", hours: 14 },
        { id: "AIE-110-M05", title: "Similarity search: exact to approximate nearest neighbors", hours: 16 },
        { id: "AIE-110-M06", title: "Streaming and sketching: counting when you can't hold the data", hours: 12 },
      ],
      ethicsThread:
        "Tier 1: algorithmic choices are measurable trade-offs. Tier 2: what 'efficiency' suppresses — approximate algorithms trade correctness for speed, and the error lands on whoever is hardest to retrieve. Tier 3: your ANN index will silently fail to find someone; who?",
      paceHoursPerWeek: [6, 10],
    },
    {
      code: "AIE-201",
      durability: "durable",
      descentArc:
        "Descend beneath sklearn: implement regression, trees, k-means, PCA from scratch until the library is just a fast version of what you already understand. Build the failure catalog by hand — leakage, drift, the lying average. Re-ascend able to say, with evidence, when NOT to use ML at all.",
      title: "Machine Learning from First Principles",
      tier: "core",
      weightPercent: 9,
      hours: 130,
      prerequisites: ["AIE-103", "AIE-110"],
      corequisites: [],
      outcomes: [
        "Implement linear/logistic regression, trees, ensembles, k-means, and PCA from scratch and match library results",
        "Diagnose bias vs variance from learning curves and prescribe the fix",
        "Design leakage-free splits and honest baselines for any tabular problem",
        "Explain when NOT to use ML and defend the judgment with evidence",
      ],
      outpaces:
        "Every algorithm is built from scratch and validated against scikit-learn, so nothing is incantation; the failure catalog (leakage, drift, Simpson's paradox, base-rate neglect) gets equal billing with the methods; 'when not to use ML' is an assessed outcome, which no competitor dares grade.",
      assessmentWeights: [
        { kind: "from-scratch implementations", percent: 40, note: "match sklearn within tolerance, with tests" },
        { kind: "diagnosis exams", percent: 25, note: "given a sick model + data, name the disease and fix it" },
        { kind: "honest-baseline project", percent: 25, note: "end-to-end tabular problem with defensible evaluation" },
        { kind: "sealed-readings", percent: 10, note: "weekly three-tier readings" },
      ],
      modules: [
        { id: "AIE-201-M01", title: "The learning problem: generalization, capacity, the bet", hours: 14 },
        { id: "AIE-201-M02", title: "Linear models and regularization from scratch", hours: 18 },
        { id: "AIE-201-M03", title: "Trees, forests, and boosting from scratch", hours: 18 },
        { id: "AIE-201-M04", title: "Unsupervised: clustering, PCA, embeddings", hours: 16 },
        { id: "AIE-201-M05", title: "The evaluation contract: splits, leakage, baselines", hours: 18 },
        { id: "AIE-201-M06", title: "The failure catalog: how ML lies", hours: 16 },
        { id: "AIE-201-M07", title: "Feature engineering and the tabular endgame", hours: 14 },
        { id: "AIE-201-M08", title: "When not to use ML", hours: 16 },
      ],
      ethicsThread:
        "Tier 1: labeled data is bought labor; benchmark gains are measurable. Tier 2: what 'accuracy' suppresses — the distribution of error across people, and the labels' embedded worldview. Tier 3: your model's average hides a tail; name who lives there before you ship.",
      paceHoursPerWeek: [8, 12],
    },
    {
      code: "AIE-202",
      durability: "durable",
      descentArc:
        "Descend to raw arrays and build an autograd engine — the chain rule you derived in AIE-103, now as a machine you wrote. Build up through CNN, RNN, transformer, each earned from scratch. Re-ascend fluent in PyTorch, wielding it as an instrument whose every abstraction you could rebuild.",
      title: "Deep Learning: Autograd to Transformers",
      tier: "core",
      weightPercent: 9,
      hours: 150,
      prerequisites: ["AIE-201"],
      corequisites: ["AIE-203"],
      outcomes: [
        "Build a working autograd engine and a training loop from raw arrays; explain every line",
        "Train CNNs, RNNs, and a transformer from scratch on real data, debugging instability from loss curves",
        "Implement attention and the full transformer block from the paper, then in PyTorch idiom",
        "Ablate a model systematically and attribute performance to components with evidence",
      ],
      outpaces:
        "The Karpathy build-it-yourself ethos with what Zero-to-Hero lacks: assessment, ablation discipline, debugging drills on deliberately broken training runs, and a straight line into the LLM and production courses. Every architecture is earned by building, then made fluent in PyTorch.",
      assessmentWeights: [
        { kind: "build milestones", percent: 40, note: "autograd → MLP → CNN → transformer, each verified against reference" },
        { kind: "broken-run clinics", percent: 25, note: "diagnose planted training pathologies from artifacts alone" },
        { kind: "ablation project", percent: 25, note: "a written ablation study with defensible attribution" },
        { kind: "sealed-readings", percent: 10, note: "weekly three-tier readings" },
      ],
      modules: [
        { id: "AIE-202-M01", title: "Autograd from scratch: the tape and the chain rule", hours: 18 },
        { id: "AIE-202-M02", title: "Training dynamics: init, normalization, optimizers, schedules", hours: 20 },
        { id: "AIE-202-M03", title: "CNNs and representation learning", hours: 18 },
        { id: "AIE-202-M04", title: "Sequences: RNNs to attention", hours: 18 },
        { id: "AIE-202-M05", title: "The transformer, from the paper", hours: 22 },
        { id: "AIE-202-M06", title: "PyTorch fluency and the modern stack", hours: 18 },
        { id: "AIE-202-M07", title: "Debugging training: the pathology clinic", hours: 20 },
        { id: "AIE-202-M08", title: "Ablation and attribution", hours: 16 },
      ],
      ethicsThread:
        "Tier 1: scaling results replicate; interpretability lags capability, documented by the field itself. Tier 2: what 'we understand the architecture' suppresses — architecture is not behavior; builders ship systems whose specific capabilities surprise them. Tier 3: where does your responsibility end — at what you built, or at what it learned?",
      paceHoursPerWeek: [10, 14],
    },
    {
      code: "AIE-203",
      durability: "mixed",
      descentArc:
        "Descend from 'the dataset' to the record, the byte on disk, the provenance of every row. Build a corpus by hand — dedup, filter, contamination-check, consent posture. Re-ascend able to stand behind every token a model of yours will ever see.",
      title: "Data Engineering for AI",
      tier: "core",
      weightPercent: 7,
      hours: 100,
      prerequisites: ["AIE-101", "AIE-110"],
      corequisites: [],
      outcomes: [
        "Model, load, and query data in SQL at fluency; design schemas that survive real questions",
        "Build tested, idempotent pipelines: batch ETL, orchestration, and a streaming path",
        "Construct a training/eval corpus from raw sources with documented provenance, dedup, filtering, and contamination checks",
        "Run data quality as engineering: expectations, monitoring, lineage",
      ],
      outpaces:
        "The corpus-construction module is the differentiator: no curriculum teaches building a training corpus with provenance, contamination discipline, and consent posture — the exact skill the LLM era actually runs on. Pipelines are graded on failure behavior (replays, duplicates, out-of-order), not happy paths.",
      assessmentWeights: [
        { kind: "pipeline labs", percent: 40, note: "graded by induced-failure behavior, not demos" },
        { kind: "SQL fluency exams", percent: 20, note: "timed real-schema questions" },
        { kind: "corpus project", percent: 30, note: "a documented, contamination-checked corpus used in AIE-301" },
        { kind: "sealed-readings", percent: 10, note: "weekly three-tier readings" },
      ],
      modules: [
        { id: "AIE-203-M01", title: "SQL and data modeling to fluency", hours: 18 },
        { id: "AIE-203-M02", title: "Batch pipelines: ETL, idempotency, orchestration", hours: 16 },
        { id: "AIE-203-M03", title: "Streaming: logs, exactly-once illusions, real-time ingestion", hours: 16 },
        { id: "AIE-203-M04", title: "Data quality engineering: expectations, lineage, monitoring", hours: 14 },
        { id: "AIE-203-M05", title: "Corpus construction: provenance, dedup, filtering, contamination", hours: 22 },
        { id: "AIE-203-M06", title: "Storage economics: formats, lakes, warehouses, cost", hours: 14 },
      ],
      ethicsThread:
        "Tier 1: every record was an event in someone's life; scraping's legal status is actively contested. Tier 2: what 'publicly available' suppresses — availability was never consent. Tier 3: your corpus contains someone who would object; you can't identify them; you train anyway or you don't — decide and write down why.",
      paceHoursPerWeek: [8, 12],
    },
    {
      code: "AIE-204",
      durability: "durable",
      descentArc:
        "Descend beneath 'it seems to work' to what knowing would actually require: a gold set, a metric that resists gaming, a statistic that survives scrutiny. Build evals and validate the judge itself. Re-ascend carrying the discipline that gates every system you build after this.",
      title: "Evaluation and Experimentation",
      tier: "core",
      weightPercent: 8,
      hours: 110,
      prerequisites: ["AIE-201"],
      corequisites: ["AIE-202"],
      outcomes: [
        "Design an eval before building the system: task definition, gold sets, metrics that resist gaming",
        "Run and analyze experiments with statistical honesty: power, significance, multiple comparisons, regression to the mean",
        "Build LLM-as-judge pipelines and validate the judge itself against human agreement",
        "Detect benchmark contamination and Goodharting; write eval reports a skeptic would sign",
      ],
      outpaces:
        "Evaluation as a full course, positioned BEFORE the LLM tier — the single largest gap in every competitor. The 2025-26 industry lesson (evals are the core discipline of AI engineering) made structural: nothing in later courses ships without an eval, because the learners already know how to build one.",
      assessmentWeights: [
        { kind: "eval-design labs", percent: 40, note: "evals for provided systems, graded on gaming resistance" },
        { kind: "statistics clinics", percent: 25, note: "find the flaw in real published experiment designs" },
        { kind: "judge-validation project", percent: 25, note: "an LLM judge validated against human labels, disagreement analyzed" },
        { kind: "sealed-readings", percent: 10, note: "weekly three-tier readings" },
      ],
      modules: [
        { id: "AIE-204-M01", title: "Why evals precede systems", hours: 12 },
        { id: "AIE-204-M02", title: "Gold sets, metrics, and gaming resistance", hours: 18 },
        { id: "AIE-204-M03", title: "Experiment statistics: power, significance, honest inference", hours: 18 },
        { id: "AIE-204-M04", title: "Evaluating generative systems: rubrics, pairwise, LLM-as-judge", hours: 20 },
        { id: "AIE-204-M05", title: "Contamination, Goodharting, and benchmark forensics", hours: 16 },
        { id: "AIE-204-M06", title: "Error analysis as a practice: reading transcripts, taxonomy building", hours: 16 },
        { id: "AIE-204-M07", title: "The eval report: writing for a skeptic", hours: 10 },
      ],
      ethicsThread:
        "Tier 1: benchmark scores drive capital allocation; contamination is documented and widespread. Tier 2: what leaderboards suppress — the gap between measured task and claimed capability is where every overclaim lives. Tier 3: you will be asked to make an eval say yes; decide now what your number is not for sale for.",
      paceHoursPerWeek: [8, 12],
    },
    {
      code: "AIE-301",
      durability: "mixed",
      descentArc:
        "Descend to the byte: build the BPE tokenizer, then a small LM, then the post-training arc — SFT, preference optimization, RL — by hand on the corpus you built in AIE-203. Re-ascend able to fine-tune any open model with a reason and an eval proving the delta.",
      title: "Large Language Models: Pretraining to Post-Training",
      tier: "specialization",
      weightPercent: 9,
      hours: 140,
      prerequisites: ["AIE-202", "AIE-203", "AIE-204"],
      corequisites: [],
      outcomes: [
        "Build a tokenizer (BPE) and explain its failure modes; train a small LM end to end on a self-built corpus",
        "Explain and apply scaling intuition: what parameters, data, and compute each buy",
        "Run the post-training arc hands-on: SFT, preference optimization (DPO-family), and RL-based methods at small scale",
        "Fine-tune open models with LoRA/QLoRA for a real task, with an eval proving the delta",
      ],
      outpaces:
        "CS336's from-scratch depth without CS336's assumed background — the ramp is our own foundation tier. Post-training gets equal weight with pretraining (the industry reality no MOOC reflects), and the corpus comes from AIE-203, so the learner has provenance on every token their model saw.",
      assessmentWeights: [
        { kind: "build milestones", percent: 40, note: "tokenizer → LM → SFT → preference-tuned, each with evals" },
        { kind: "scaling analyses", percent: 15, note: "written compute/data/parameter trade-off studies" },
        { kind: "fine-tune project", percent: 35, note: "a real task, an open model, a proven delta — the sovereignty artifact" },
        { kind: "sealed-readings", percent: 10, note: "weekly three-tier readings" },
      ],
      modules: [
        { id: "AIE-301-M01", title: "Tokenization: BPE from scratch and its politics", hours: 16 },
        { id: "AIE-301-M02", title: "Pretraining a small LM on your own corpus", hours: 22 },
        { id: "AIE-301-M03", title: "Scaling: what compute, data, and parameters buy", hours: 16 },
        { id: "AIE-301-M04", title: "SFT: instruction tuning hands-on", hours: 18 },
        { id: "AIE-301-M05", title: "Preference optimization: RLHF, DPO-family, reward hacking", hours: 20 },
        { id: "AIE-301-M06", title: "Parameter-efficient fine-tuning: LoRA/QLoRA in anger", hours: 18 },
        { id: "AIE-301-M07", title: "Reasoning and RL: test-time compute, verifiable rewards", hours: 18 },
        { id: "AIE-301-M08", title: "Open-weight ecosystem: licenses, model cards, sovereignty", hours: 12 },
      ],
      ethicsThread:
        "Tier 1: whose preferences fill the reward signal is a design decision, documented in every lab's papers. Tier 2: what 'alignment' suppresses — aligned to whom is the entire contest, treated as settled. Tier 3: you are building the voice; the field cannot say what, if anything, is home. Proceed — but proceed knowing.",
      paceHoursPerWeek: [10, 14],
    },
    {
      code: "AIE-302",
      durability: "swappable",
      descentArc:
        "Descend beneath the framework to the primitives — chunk, embed, retrieve, rerank, the tool-call loop — building RAG and agents from your own AIE-110 index before touching LangChain-shaped tools. Re-ascend able to diagnose any bad output to its true cause and to reach for a framework knowing exactly what it buys.",
      title: "Building with Foundation Models: Context, RAG, and Agents",
      tier: "specialization",
      weightPercent: 8,
      hours: 120,
      prerequisites: ["AIE-204"],
      corequisites: ["AIE-301"],
      outcomes: [
        "Engineer context deliberately: prompts as specs, structured output, token budgets, failure handling",
        "Build a RAG system from primitives (chunking, embedding, retrieval, reranking, citation) and evaluate retrieval separately from generation",
        "Build tool-using agents with bounded autonomy: planning, memory, checkpoints, human gates",
        "Diagnose bad outputs to their true cause: context failure vs retrieval failure vs model limitation",
      ],
      outpaces:
        "Framework-last: everything is built from primitives first (the learner's own AIE-110 ANN index included), so no abstraction is incantation. Every system ships with the eval discipline of AIE-204 — retrieval measured apart from generation, agent runs traced and scored — which is precisely what the short-course ecosystem never enforces.",
      assessmentWeights: [
        { kind: "build labs", percent: 40, note: "RAG and agent components from primitives, framework comparison after" },
        { kind: "diagnosis clinics", percent: 20, note: "trace bad outputs to true cause on provided systems" },
        { kind: "shipped system project", percent: 30, note: "a working RAG-or-agent product with its eval harness" },
        { kind: "sealed-readings", percent: 10, note: "weekly three-tier readings" },
      ],
      modules: [
        { id: "AIE-302-M01", title: "Context engineering: the model's entire world", hours: 16 },
        { id: "AIE-302-M02", title: "Structured output and API discipline", hours: 12 },
        { id: "AIE-302-M03", title: "RAG from primitives: chunking to citation", hours: 22 },
        { id: "AIE-302-M04", title: "Evaluating RAG: retrieval and generation apart", hours: 16 },
        { id: "AIE-302-M05", title: "Agents: tools, planning, memory, bounded autonomy", hours: 22 },
        { id: "AIE-302-M06", title: "Multi-agent and orchestration patterns", hours: 16 },
        { id: "AIE-302-M07", title: "Frameworks last: what LangChain-shaped tools actually buy", hours: 16 },
      ],
      ethicsThread:
        "Tier 1: retrieval grounds generation only as well as the corpus and chunking allow. Tier 2: what 'grounded in your data' suppresses — retrieval is an editorial act; someone chooses what the system can find. Tier 3: when your agent acts and it's wrong, trace the accountability chain out loud — every link of it.",
      paceHoursPerWeek: [8, 12],
    },
    {
      code: "AIE-303",
      durability: "mixed",
      descentArc:
        "Descend from 'it works in the notebook' to the token, the GPU-second, the $/request the machine actually charges. Build serving, quantization, and the cost model from the metal you met in AIE-102. Re-ascend able to defend a production budget and a rehearsed rollback.",
      title: "Production AI: Serving, Inference, and Operations",
      tier: "specialization",
      weightPercent: 7,
      hours: 110,
      prerequisites: ["AIE-302"],
      corequisites: [],
      outcomes: [
        "Serve a model behind an API with SLOs: batching, streaming, caching, autoscaling, graceful degradation",
        "Optimize inference: quantization, KV-cache management, speculative decoding, and the cost math of each",
        "Run the ML lifecycle in production: CI/CD for models, eval gates on deploy, drift and incident response",
        "Carry a cost model for the whole system and defend a $/request budget",
      ],
      outpaces:
        "Cost is a first-class engineering grade — learners are scored on $/request against SLOs, which no course anywhere does. Deployment gates are the learner's own AIE-204 evals, closing the loop: nothing reaches users unproven, and rollback is rehearsed, not described.",
      assessmentWeights: [
        { kind: "serving labs", percent: 40, note: "load-tested endpoints with measured SLOs" },
        { kind: "optimization clinics", percent: 20, note: "hit a latency/cost target on a fixed model and hardware" },
        { kind: "production project", percent: 30, note: "the AIE-302 system productionized: gates, monitoring, incident runbook" },
        { kind: "sealed-readings", percent: 10, note: "weekly three-tier readings" },
      ],
      modules: [
        { id: "AIE-303-M01", title: "Serving fundamentals: APIs, batching, streaming, caching", hours: 18 },
        { id: "AIE-303-M02", title: "Inference optimization: quantization, KV cache, speculation", hours: 20 },
        { id: "AIE-303-M03", title: "The cost model: tokens, hardware, and the $/request budget", hours: 14 },
        { id: "AIE-303-M04", title: "CI/CD for AI: eval gates, canaries, rollback rehearsal", hours: 18 },
        { id: "AIE-303-M05", title: "Observability: tracing, drift, and reading production transcripts", hours: 16 },
        { id: "AIE-303-M06", title: "Incidents: on-call for a model, postmortems without blame", hours: 14 },
        { id: "AIE-303-M07", title: "Self-hosting and sovereignty: local inference economics", hours: 10 },
      ],
      ethicsThread:
        "Tier 1: most ML failure in the wild is systems failure; the canonical papers say so. Tier 2: what 'reliability' metrics suppress — the system's effect on the people in its loop is unmeasured while everything about the system is measured. Tier 3: your model will adapt to users while users adapt to it; when the loop closes, what metric would even tell you who is training whom?",
      paceHoursPerWeek: [8, 12],
    },
    {
      code: "AIE-304",
      durability: "mixed",
      descentArc:
        "Descend to the attack surface itself: break real sandboxed systems by hand — inject, jailbreak, exfiltrate — before you defend them. Build the threat model and the patch. Re-ascend holding knowledge that does not expire, and the discipline that governs your hands when the incentive arrives.",
      title: "AI Security, Safety, and Governance",
      tier: "specialization",
      weightPercent: 4,
      hours: 60,
      prerequisites: ["AIE-302"],
      corequisites: ["AIE-303"],
      outcomes: [
        "Attack and defend LLM systems: prompt injection, jailbreaks, data exfiltration, tool-abuse chains — hands-on both directions",
        "Threat-model an AI product and write its abuse cases before its use cases",
        "Apply the governing frameworks (EU AI Act tiers, NIST AI RMF) to a real system and produce the artifacts an audit would want",
        "Run red-team exercises with disciplined reporting",
      ],
      outpaces:
        "Security taught offensively (learners break real sandboxed systems, then patch them) inside the same program that teaches building — competitors treat this as a webinar. Governance is graded as engineering artifacts, not policy essays.",
      assessmentWeights: [
        { kind: "attack/defend labs", percent: 45, note: "capture-and-patch exercises on sandboxed AI systems" },
        { kind: "threat-model project", percent: 25, note: "abuse cases + mitigations for the learner's own AIE-302/303 system" },
        { kind: "governance artifacts", percent: 20, note: "model card, risk file, audit trail for a real system" },
        { kind: "sealed-readings", percent: 10, note: "weekly three-tier readings" },
      ],
      modules: [
        { id: "AIE-304-M01", title: "The attack surface: injection, jailbreaks, exfiltration", hours: 14 },
        { id: "AIE-304-M02", title: "Defending: isolation, least privilege, output handling, tool gates", hours: 14 },
        { id: "AIE-304-M03", title: "Threat modeling AI products: abuse cases first", hours: 10 },
        { id: "AIE-304-M04", title: "Safety evaluation: red teaming with discipline", hours: 12 },
        { id: "AIE-304-M05", title: "Governance as engineering: AI Act, NIST RMF, model cards", hours: 10 },
      ],
      ethicsThread:
        "Tier 1: every deployed assistant has been jailbroken; injection is unsolved. Tier 2: what 'responsible AI' theater suppresses — the gap between published principles and what ships under deadline. Tier 3: you now know how to break these systems; the knowledge doesn't expire — what governs your hands when the incentive arrives?",
      paceHoursPerWeek: [6, 10],
    },
    {
      code: "AIE-401",
      durability: "durable",
      descentArc:
        "The full spiral, once more, alone: descend to one real problem, build the whole system from spec to monitored production, and re-ascend to defend every decision — including the ones not taken — before an adversarial panel. The philosophy, demonstrated end to end.",
      title: "Capstone: Ship a Production AI System",
      tier: "capstone",
      weightPercent: 5,
      hours: 120,
      prerequisites: ["AIE-301", "AIE-303", "AIE-304"],
      corequisites: [],
      outcomes: [
        "Take one real problem from spec to deployed, evaluated, monitored, secured AI system with users",
        "Defend every architectural and ethical decision before a review panel, including the decisions not taken",
        "Produce the complete professional artifact set: design doc, eval report, cost model, threat model, runbook, model card",
      ],
      outpaces:
        "The defense is adversarial and the artifact set is the hiring bar: a reviewer gets the repo, the eval report, the cost model, and the incident runbook — not a demo video. The learner's sealed corpus (74+ readings by now) ships alongside as the judgment record no portfolio anywhere can match.",
      assessmentWeights: [
        { kind: "shipped system", percent: 40, note: "real users or realistic load, gates green, monitored" },
        { kind: "artifact set", percent: 25, note: "design doc, eval report, cost model, threat model, runbook, model card" },
        { kind: "adversarial defense", percent: 25, note: "panel defense; graded on judgment under challenge" },
        { kind: "sealed-readings", percent: 10, note: "final phase syntheses + capstone retrospective" },
      ],
      modules: [
        { id: "AIE-401-M01", title: "Problem selection and the spec", hours: 16 },
        { id: "AIE-401-M02", title: "Build sprint I: core loop with eval gates", hours: 32 },
        { id: "AIE-401-M03", title: "Build sprint II: production hardening", hours: 32 },
        { id: "AIE-401-M04", title: "The artifact set", hours: 20 },
        { id: "AIE-401-M05", title: "The defense", hours: 20 },
      ],
      ethicsThread:
        "Tier 1: the system exists; its costs and failure modes are now measurable facts. Tier 2: what the demo suppresses — every capstone is a claim about what should exist; the defense asks whether it should. Tier 3: the panel's last question, always: who bears the cost if you're wrong, and did they get a say?",
      paceHoursPerWeek: [10, 16],
    },
  ],
  dispatch: {
    packetContract: [
      "Every module packet (AIE-XXX-MYY) is one agent-assignable unit of material design.",
      "A packet's deliverables: (1) lesson notes per lesson listed in the syllabus — teaching text, worked examples, common misconceptions; (2) all labs with starter code, solution code, and autograded tests; (3) the module assessment with rubric; (4) instructor/Elle notes: pacing signals to watch, known walls, reroute options; (5) the module's three-tier reading prompt.",
      "Packets must honor the syllabus contract exactly: outcomes, lesson list, lab list, assessment shape. Deviations are proposed back, never silently made.",
      "All code deliverables run under the repo's toolchain (Python 3.12+, pytest; TS where stated) with tests green before a packet is accepted.",
      "Style: verification before generation everywhere — every lab states its Predict step before its Build step.",
    ],
    qualityGates: [
      "Technical review: a second agent attempts every lab from the materials alone; friction points are defects.",
      "Eval-discipline review: every assessment is checked for gaming resistance (can it be passed without the outcome?).",
      "Ethics review: tier readings are specific to the module's subject, not boilerplate; 'sit with this' is a question, not a lecture.",
      "Coherence review: cross-module references (imports from earlier courses, artifacts reused later) resolve correctly.",
    ],
  },
};
