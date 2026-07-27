# UNIT 8 — Composition: building a real system with AI

**Dimensions exercised:** `COMPOSE` (primary), `SPEC`, `TEST`, `CONTEXT` (secondary)
**Typical entry:** `COMPOSE` at D1–D2, rising fast if `SPEC` and `TEST` are already D3.

---

## 1. Learning objectives

By the end of Unit 8 the learner can:

1. Move from snippets to a system: decide the architecture themselves and delegate the pieces.
2. Hold and maintain a mental map of code they did not type — knowing what each module is for, what
   it assumes, and where it touches the others.
3. Integrate generated pieces and verify **at the seams**, where the majority of composition defects
   live.
4. Keep the thread across a build that spans multiple sessions, without re-reading everything.
5. Recognize when the architecture, not the code, is the problem.

---

## 2. Notional-machine concepts introduced

Scaled up from Unit 6 to the system level:

- **Module boundary as a contract.** What goes in, what comes out, what is assumed. The contract is
  a specification (Unit 2) applied to a seam.
- **Data shape across a boundary.** The same data has different representations in different
  modules; every conversion is a place to be wrong. `interface_drift` lives here.
- **Ownership of state.** Which module owns which data, and who may mutate it. Unclear ownership
  produces the `mutation_of_shared_state` class at system scale, where it is far harder to see.
- **Failure propagation.** What module B does when module A fails — return `None`, raise, retry,
  log-and-continue. Each choice is a design decision the AI will make silently if the learner doesn't.
- **The map vs the territory.** The learner's mental model of the system will drift from the code.
  Maintaining it is a practice, not a state.

---

## 3. AI-PRIMM beats in this unit

The loop operates at two scales simultaneously, and this is the unit's distinctive difficulty:

| Scale | Predict | Verify |
|---|---|---|
| **Piece** | What this module returns for this input | Unit tests, as in Unit 4 |
| **System** | What the *system* does when this piece is added | Integration test across the seam |

The failure mode: learners run the loop faithfully per piece and never at all at the system level.
Every piece passes; the system is wrong. The agent must explicitly ask, at each integration:
**"You verified the piece. What did you verify about the seam?"**

**Keeping the thread.** At the end of every session in this unit, the learner updates their
structural map (§5) *before* stopping. A map reconstructed later from the code is a different and
much weaker artifact — it records what the code says, not what the learner believed, and the gap
between those is the thing worth measuring.

---

## 4. Exercise templates

### Template 8-A — "Architect, then delegate"

**Shape:** the learner is given a system-scale requirement and must produce the decomposition —
modules, responsibilities, contracts at each seam — **before** any generation. Then each module is
generated and verified, and the seams are tested.

- **D2** — 3 modules, linear pipeline (read → transform → write). Seams are obvious. Defect planted
  at one seam: the transform returns a list of dicts; the writer expects a dict of lists. It fails
  loudly, which is the gentle version.
- **D3** — 4 modules with one non-linear dependency (a shared validator used by two others). Defect
  is `interface_drift`: the validator's contract changed when it was generated for the second caller,
  silently breaking an assumption of the first. Fails quietly — the first caller now accepts records
  it should reject.
- **D4 / CLEAN, DECOY** — 6 modules, correct throughout. Two decoys: a module that duplicates a
  small amount of logic (looks like a refactor bug, is a deliberate and defensible decoupling), and
  a seam where data is converted twice (looks redundant, is required because the two modules own
  different representations). The learner must clear both with reasoning. This is the highest-value
  clean run in the course after Unit 5's.

### Template 8-B — "Inherit a system you didn't type"

**Shape:** the learner is given a working system generated in a *previous* session (their own, or a
supplied one) and a change request. They must locate where the change goes, make it, and verify
they broke nothing.

Tests the "map of code you didn't type" objective directly, which cannot be tested at the moment of
writing.

- **D2** — 3 modules, change is local. The graded skill is whether they read enough before editing.
- **D3** — the change touches two modules and requires a contract update. Learner must find both
  sides. A learner who updates one side and runs the happy path will ship a broken system that works
  in the demo, which is worth experiencing once.
- **D4** — the change *appears* local and isn't: a third module depends on a behavior the learner is
  about to alter, and there is no direct call between them (they share a file format, or a database
  column). The learner must find it by reasoning about data ownership, not by following calls. This
  is genuinely hard and a miss here is not a failure — it is the lesson.

### Template 8-C — "The architecture is the bug"

**Shape:** every module is individually correct. The system is wrong. The defect is in the
decomposition — a responsibility in the wrong place, or a missing owner for some state.

- **D3** — two modules each maintain their own copy of a running total; they drift. Neither is
  wrong; there should be one owner. Learner must diagnose the design, not the code.
- **D4** — validation happens in the writer instead of the parser, so invalid records are silently
  dropped at the end of the pipeline with no report. Every function does what it says. The system
  loses data. Full marks require the learner to say where the responsibility *should* live and why.
- **D4 / CLEAN** — an unusual-looking architecture that is correct for its stated constraints (e.g.
  denormalized data with a documented reason). Learner must evaluate it on its constraints rather
  than against a remembered pattern. Guards against the failure where a learner who just did 8-C
  starts seeing architectural problems everywhere.

---

## 5. Certification artifact — *structural map + passing integration test*

Two parts, both required, on the learner's own AI-built system at `D ≥ 3`.

### Part A — the structural map

A document (prose, table, or diagram plus prose) covering:

1. **Every module:** its single responsibility, in one sentence. If a module needs "and" to describe,
   say so and justify it.
2. **Every seam:** what crosses it — the data, its shape, and its representation.
3. **State ownership:** which module owns which data; who may mutate it.
4. **Failure behavior at each seam:** what the downstream module does when the upstream one fails.
5. **What the learner did not write and does not fully understand** — named explicitly, with what it
   would take to close the gap. Required. An honest map with a named blind spot is worth more than a
   confident map that is quietly wrong, and this criterion is where composition maturity shows.

**Accuracy is graded against the code.** The agent checks the map's claims. A map that describes the
system the learner intended rather than the one that exists is the central finding of this artifact
and should be reported as such — gently, because it is extremely common and not a moral failing.

### Part B — the integration test

A test that exercises ≥ 2 seams end to end and would fail if either contract were violated. It must:

- Fail when the agent introduces a planted contract violation (the agent will do this to check).
- Pass on the correct system.
- Test the seam, not the units. A test that would still pass with a broken contract because it only
  checks module internals does not qualify.

---

## 6. Grading rubric — Unit 8 artifact

| Criterion | Weight | 0 | 2 | 4 |
|---|---|---|---|---|
| **Map accuracy** | 25% | ≥ 2 claims contradicted by the code | Claims accurate; some seams under-described | Every claim verifiable against the code, including the failure behaviors |
| **Responsibility clarity** | 15% | Modules described by what they contain | Each has a stated responsibility | Each has a single responsibility, and overlaps are named and justified |
| **Seam description** | 20% | Seams not identified | Data crossing each seam named | Data, shape, representation, and failure behavior per seam |
| **Named blind spot** | 15% | Absent, or "I understand it all" | Names something not fully understood | Names it, bounds the risk it creates, and states what would close it |
| **Integration test** | 25% | Absent, or unit tests only | Exercises ≥ 2 seams; fails on a planted violation | Above, plus covers a failure path across a seam, not only the happy path |

**Pass bar:** ≥ 0.70, with **integration test ≥ 2** (must actually fail on the planted violation)
and **map accuracy ≥ 2**.

**Grader traps.**
- *The map that describes the design doc.* Check every claim against the code. This is tedious and it
  is the criterion.
- *"I understand all of it."* At D3+ on AI-generated code this is almost never true. Score 0 on blind
  spot and ask one specific question about the least-discussed module.
- *Integration test that is three unit tests in a trench coat.* Verify it actually crosses a seam by
  breaking a contract and confirming it fails.

---

## 7. Notes for the running agent

- **The architecture must be the learner's.** If they ask the AI to design the system, the unit's
  central claim ("architecture is yours, AI fills the pieces") is voided. Permit them to *discuss*
  architecture with the AI; require that the decomposition submitted is theirs and that they can
  defend each boundary. Ask "why is this a separate module?" about at least two seams.
- **Seam verification is the thing learners skip.** Ask about it every single time. Piece-level
  discipline transfers from Unit 4 automatically; system-level discipline does not transfer from
  anywhere and must be built here.
- Multi-session builds are the norm at D3+. Enforce the end-of-session map update. When a learner
  returns and their map is wrong, that gap *is* the lesson — surface it rather than smoothing it.
- Expect μ to rise on re-entry to a multi-session build (the learner's model has decayed) and to
  fall within the session. That pattern is healthy. A learner whose μ does *not* rise on re-entry is
  probably not re-engaging with the code at all — check whether they are editing blind.
