# UNIT 9 — Judgment, security & responsibility

**Dimensions exercised:** `SEC` (primary), `TRACE`, `COMPOSE` (secondary)
**Typical entry:** `SEC` at D0–D1.

---

## 1. Learning objectives

By the end of Unit 9 the learner can:

1. Identify the security flaws AI writes confidently and often: injection, secrets in source, unsafe
   defaults, missing authorization, leaked sensitive data in logs and errors.
2. Reason about *why* each flaw is exploitable in the specific code in front of them, given its
   actual trust boundaries — rather than citing a rule.
3. Assess provenance and licensing: whether generated code resembles a known licensed source, and
   what obligations would attach.
4. State when *not* to trust AI output at all, on grounds other than "it might be wrong."
5. Accept ownership of a security outcome regardless of who or what typed the code — and demonstrate
   that by deciding, in the first person, what they will and will not sign off on.

---

## 2. Notional-machine concepts introduced

Security concepts framed as machine behavior, consistent with the rest of the course:

- **Trust boundary.** The line where data stops being yours. Every input crossing it is adversarial
  until proven otherwise.
- **Data flow from source to sink.** Untrusted input reaching an interpreter (SQL, shell, `eval`,
  path resolution, deserialization, template) is the shape of nearly every injection.
- **Interpretation vs. data.** Why parameterized queries work and escaping mostly doesn't: the
  parameter is never parsed as syntax. This is a machine-level fact and should be taught as one.
- **Defaults as decisions.** `verify=False`, `debug=True`, binding `0.0.0.0`, permissive CORS,
  world-readable files. Nobody chose these; the generation did.
- **Secrets as state with a lifetime.** A key in source is in git history forever, and "we'll move it
  later" is a claim about the future that the repository does not honor.
- **Authorization vs authentication.** Knowing who someone is, versus knowing what they may do. AI
  output reliably implements the first and omits the second, because the first is in the prompt and
  the second is in the requirements nobody wrote down.

---

## 3. Why AI writes insecure code confidently

Teach this explicitly; it makes the flaws predictable rather than arbitrary.

1. **Training data contains the common case, and the common case is a tutorial.** Tutorials
   demonstrate a mechanism with the security elided for clarity. That elision is now the norm.
2. **Security requirements are almost never in the prompt.** The learner asks for a search feature,
   not a search feature that resists injection. Absence produces the plausible completion, which is
   the tutorial version (invariant 2, Unit 7).
3. **Insecure code passes every functional test.** The happy path is unaffected. Unit 4's suite will
   not catch any of this, and the learner should feel the force of that.
4. **The prose is equally confident either way.** There is no tell. Fluency of explanation carries no
   information about security posture, and learners must stop reading it as if it does.

Consequence, stated to the learner: **security is a place where "it works" and "it's fine" are
maximally decoupled.** Everything else in this course has been practice for this.

---

## 4. Exercise templates

### Template 9-A — "Audit the generated feature"

**Shape:** an AI-generated feature with real external boundaries. The learner performs a systematic
audit: enumerate boundaries, trace each untrusted input to its sinks, assess.

- **D1 / S2** — a 40-line search endpoint building SQL with an f-string from a query parameter.
  Textbook injection, deliberately unsubtle. Everyone should catch this; it establishes the method.
- **D3 / S3** — a 150-line file-upload handler. It validates the extension and then joins the
  user-supplied filename to a directory, so `../../etc/whatever` escapes. Also logs the full request
  body, which contains a password. Two findings of different classes; a learner who stops at the
  first has not audited, they have spotted.
- **D4 / S4, DECOY** — a 350-line API module. One real flaw (`missing_authz_check`: the endpoint
  authenticates the caller and never checks whether the requested record belongs to them). Two
  decoys: a raw SQL string that is actually parameterized correctly two lines later, and a
  `subprocess` call whose arguments are a fixed list, not a shell string. Flagging a decoy costs
  rubric criterion 5.4 and it should — over-flagging is the failure mode of newly security-aware
  learners and it destroys their credibility with engineers.

### Template 9-B — "Secrets and defaults"

**Shape:** generated configuration and setup code. Flaws are in what was assumed, not in the logic.

- **D1 / S1** — an API key hardcoded in the module. Trivially visible; the graded part is the
  learner's account of *why it matters after it's removed* (git history, deployed images, logs).
- **D2 / S3** — `requests.get(url, verify=False)` added because "it fixed a certificate error,"
  with a comment saying so. The learner must explain what protection was removed and what an
  attacker on the network can now do.
- **D3 / S4, CLEAN** — configuration that looks alarming (a debug flag, a broad CORS origin) but is
  correctly gated on an environment check, with the production path safe. Correct verdict: no flaw
  here; here is the gate. Clean runs matter more in this unit than anywhere except Unit 5, because
  a security reviewer who cries wolf gets ignored, and being ignored is how real flaws ship.

### Template 9-C — "Provenance and licensing"

**Shape:** generated code that closely resembles a recognizable source — a distinctive algorithm, an
idiosyncratic implementation, a well-known library's internals reproduced inline.

- **D2** — a distinctive routine reproduced near-verbatim from a widely-copied source. Learner must
  notice the recognizability and state what they'd do about it (check, attribute, or replace).
- **D3** — generated code plus three added dependencies, one of which is copyleft. Learner must
  identify the license of each and state the obligation, if any, for their intended distribution.
- **D4** — the ambiguous case: code that is idiomatic-to-the-point-of-standard, where "resembles a
  source" is not a meaningful claim. The correct answer is that there is no provenance concern here,
  and the graded skill is the ability to tell the two situations apart rather than to worry
  uniformly.

**Honesty requirement for the agent:** provenance detection by inspection is weak and the learner
should be told so. The skill being taught is *noticing the question exists and knowing what would
answer it*, not reliable identification. Do not imply the learner can eyeball license compliance.

### Template 9-D — "When not to trust it at all"

**Shape:** a scenario, not code. The learner decides whether AI generation is appropriate here at
all, and states the grounds.

- **D2** — a password-hashing routine. Correct answer: use a vetted library; do not accept generated
  crypto. Grounds: the failure is silent, the verification is beyond the learner, and the consequence
  is unbounded.
- **D3** — a payment reconciliation script handling real money. Generation is fine; unreviewed
  deployment is not. The graded distinction is between "don't generate" and "don't ship unverified."
- **D4** — a scenario where the *correct* answer is that AI generation is appropriate and the
  learner's instinct to refuse is wrong (e.g. a well-specified internal report with no external
  input and no sensitive data). Prevents the unit from producing blanket refusal, which is the same
  policy-instead-of-judgment failure the whole course is built against.

---

## 5. Certification artifact — *the security audit*

**Definition.** A written audit of an AI-generated component at `D ≥ 3`, containing:

1. **Scope and method** — what was audited, what was not, and why. Boundaries enumerated explicitly.
2. **Data flow** — for each untrusted input, its path to every sink it reaches.
3. **Findings** — for each: location (file, line), class, the concrete attack (the input and what it
   achieves), impact, and priority with the reason for the priority.
4. **Reasoning per finding** — why it is exploitable *here*, given this code's actual trust
   boundaries. Not the general rule; this instance.
5. **Cleared constructs** — at least one thing that looks unsafe and is not, with the reasoning that
   cleared it. Required. An audit with no cleared constructs is a scan, not an audit.
6. **Provenance & licensing** — what was checked and what was concluded, including "no concern, and
   here's why."
7. **The sign-off** — first person, explicit: what the learner would ship, what they would not, what
   they would need before shipping the remainder, and who is accountable if it goes wrong. The
   correct answer to the last part is the learner.

---

## 6. Grading rubric — Unit 9 artifact

Uses `RUBRICS.md` §5 in full. Weights:

| Criterion | Weight |
|---|---|
| 5.1 Coverage | 15% |
| 5.2 Finding quality | 20% |
| 5.3 Reasoning (**gated ≥ 3**) | 25% |
| 5.4 False positives (**gated ≥ 2**) | 20% |
| 5.5 Provenance & licensing | 5% |
| 5.6 Ownership | 15% |

**Pass bar:** mean ≥ 2.6 with both gates.

**Why over-flagging fails the unit.** This mirrors the false-positive discipline running through the
whole course, and here it has a professional consequence worth naming to the learner: a reviewer who
flags everything is routed around. Their real findings arrive with the same weight as their noise,
which is none. Precision is not politeness; it is what makes the findings actionable.

**Grader traps.**
- *OWASP recital.* A generic list applied to code it doesn't fit scores 1 on 5.2 and 5.3 even if one
  item coincidentally lands. Require the concrete attack.
- *"Sanitize the input."* Names a category, not a mechanism, and is frequently the wrong fix.
  Score 5.3 = 1 and ask what "sanitize" means for this sink specifically.
- *Ownership deflection.* "The AI generated it" anywhere in the sign-off caps 5.6 at 1.
- *Severity inflation.* Every finding marked critical is the same failure as flagging everything.

---

## 7. Notes for the running agent

- **The ownership question is the unit.** Ask it directly and do not accept a hedge: "This ships and
  it leaks customer data. Who is responsible?" The only passing answer is the learner. Not the model,
  not the vendor, not the reviewer who didn't catch it.
- Watch the FPR closely here. Newly security-aware learners flag everything for about three
  exercises. That is normal; it must resolve before certification. If it doesn't, serve consecutive
  clean-with-decoy exercises until it does, and name what is happening.
- **Do not teach exploitation technique beyond what is needed to establish that a flaw is real.** The
  concrete attack in a finding is "an input containing a quote character reaches the query parser and
  changes its structure" — enough to demonstrate exploitability, and no further.
- The `D4` scenario in 9-D (where generation *is* appropriate) is easy to leave out and important to
  keep. A course that ends by teaching learners to distrust everything has taught a policy, and the
  whole design is an argument against policies substituting for judgment.
- Security is where a weak `TRACE` becomes fatal. A learner who cannot follow data through three
  functions cannot audit. If `SEC` stalls, check `TRACE` before adding more security material.
