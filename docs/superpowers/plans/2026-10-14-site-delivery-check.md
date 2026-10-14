# Site Delivery Check Implementation Plan

> **Execution:** Use superpowers:executing-plans to implement this plan task by task in this session after the user reviews it.

**Goal:** Build a local brief-to-page evidence workflow for freelance landing-page delivery, then prepare and verify its Week 2 DEV entry.

**Architecture:** Local Qwen proposes quote-grounded data for a finite catalog of checks. The user reviews that data before a fixed Playwright inspector measures a developer-controlled page. A small Node server coordinates bounded work; React presents the checklist, evidence and Markdown export.

**Tech Stack:** Node 24.13.0, TypeScript 5.9.3, React/React DOM 19.3.0, Vite 8.3.1, Playwright 1.63.0, Ollama 0.40.0 and Qwen3 1.7B.

**Spec:** ../../../.engineering/project/brief.md

## Global Constraints

- One page, up to eight reviewed requirements, desktop and mobile captures.
- English or Roman Urdu briefs; English interface and write-up.
- Outcomes: Verified, Failed or Unverified. Form structure never proves message delivery.
- Inspect only a developer-controlled HTTP page on an explicitly selected 127.0.0.1 port.
- New code and repository inside the Week 2 window.
- Submission deadline: 19 October 2026, 11:59 AM Karachi; prepare publication by 10:30 AM.
- No new cloud spend or training. Reuse downloaded models and the matching browser.
- No generated-code execution, shared browser profile, remote inference or automatic public actions.
- Meaningful local commits; no push without an explicit request. Review public prose with humanize.
- Complete the local contribution profile before coding; use post-code playbook checks on actual slices.

## Review Focus

1. Optional, negated, contradictory and vague requests must not become unsupported Verified claims.
2. Missing, hidden or duplicate page elements must not pass through an accidental selector match.
3. Redirects, cross-origin requests, WebSockets and service workers must respect the inspection boundary.
4. Edits, concurrent jobs, cancellation and timeouts must not expose stale results or discard the brief.
5. Model failure, omitted requirements and invalid quotes must remain visible for operator review.

## File map and shared contracts

Create src/checks.ts for validated data and limits, src/model.ts for local extraction,
src/inspect.ts for fixed measurements, src/report.ts for export, src/server.ts for
HTTP coordination, and src/App.tsx plus src/styles.css for the review workflow.
scripts/model.mjs starts a fresh project-local model profile against the preserved
runtime/weights; scripts/browser.mjs selects the preserved browser cache.
Keep synthetic fixtures under fixtures/ and evidence under docs/evidence/.
Use Node's test runner for domain/API checks and Playwright for browser journeys.

CheckKind is visible_text | link_destination | form_structure | horizontal_overflow | unverified.
CheckSpec contains id, sourceQuote, kind and a discriminated params object:
visible_text uses text; link_destination uses label and hrefPrefix; form_structure
uses labels and requiredLabels; horizontal_overflow has no editable parameters;
unverified uses reason. DraftCheck also contains reviewNotes and never a verdict.
CheckResult contains checkId, status, measuredFacts, limitations and evidenceIds.
InspectionReport contains the reviewed checks, results, two viewport captures,
target URL, timestamp, versions and an input fingerprint.

Application defaults: port 4318; fictional fixture server port 4319; fixed model
endpoint 127.0.0.1:11434. Reject inspector/model/application origins as targets.
Accept an explicit target port from 1024-65535 after validation. Viewports are
1366x900 and 390x844. A report states these dimensions; it makes no all-device claim.

### Task 1: Validated check catalog and baseline

**Files:** package.json, package-lock.json, tsconfig.json, src/checks.ts,
scripts/baseline.ts, tests/checks.test.ts, fixtures/briefs/development.json.
Initialize a fresh Git repository and keep local runtime/profile downloads ignored.
Check exact type-only dependencies before selecting them; do not copy old app code.

**Interfaces:** validateDraft(brief: string, raw: unknown): DraftCheck[];
validateReviewed(raw: unknown): CheckSpec[]; fingerprint(brief: string,
targetUrl: string, checks: CheckSpec[]): string. baselineDraft(brief: string):
DraftCheck[] is a documented keyword comparator, never a silent model fallback.

- [ ] Write failing assertions: a fabricated quote is rejected; nine checks are rejected;
  blank, malformed and oversized brief data are rejected; unsupported requirements
  remain unverified; changed reviewed data changes the fingerprint.
  Test names: rejectsFabricatedQuote, rejectsNinthCheck, invalidatesEditedInput.
  Representative assertions:
  ~~~ts
  assert.throws(() => validateDraft("Show opening hours", [{ id: "hours", kind: "visible_text", sourceQuote: "invented", params: { text: "hours" }, reviewNotes: "" }]), /quote/);
  assert.notEqual(fingerprint(brief, url, checks), fingerprint(brief + "!", url, checks));
  ~~~
- [ ] Run node --test tests/checks.test.ts and observe the expected missing-module failure.
- [ ] Implement the catalog, exact-substring quote validation and baseline with built-in
  APIs. Bound briefs at 4,000 characters, source quotes at 1,000, and lists at eight.
  Empty extraction requires review rather than an all-clear result.
- [ ] Run the affected tests and typecheck. Check the first resolved lockfile for advisories.
- [ ] Commit the independently testable data contract.

### Task 2: Real local classification proof

**Files:** src/model.ts, scripts/model.mjs, tests/model.test.ts,
scripts/probe-model.ts, docs/evidence/first-model-run.json.

**Interfaces:** draftChecks(brief: string, signal: AbortSignal): Promise<ModelDraft>,
where ModelDraft contains validated checks, raw output, model identity and timings.
It consumes validateDraft from Task 1.

- [ ] Write failing tests for invalid JSON, invalid quotes, timeout, model unavailable,
  incomplete output and a prompt-instruction string inside the brief. Assert no positive
  model verdict is accepted and the original input remains available.
  Test names: rejectsInvalidJson, rejectsInvalidQuote, exposesTimeout, exposesUnavailableModel.
  Assert rejected promises and unchanged original input; a mock response's
  verdict field cannot enter DraftCheck.
  ~~~ts
  await assert.rejects(draftChecks(brief, expiredSignal), /abort|timeout/i);
  assert.equal(originalBrief, brief);
  ~~~
- [ ] Run node --test tests/model.test.ts and observe the missing adapter failure.
- [ ] Implement fixed-loopback fetch, bounded schema output and nonthinking generation.
  The model returns check data only. A single call has a 45-second timeout and an
  explicitly limited token/context budget; record the actual settings with evidence.
  The launcher uses a fresh ignored local profile, disabled cloud and the existing weights.
- [ ] Run unit checks, then real inference on the first cafe brief and development cases.
  Record raw responses, quote failures, latency and the exact weight digest.
- [ ] Stop prompt iteration after 60 minutes. Continue only if reviewed checks are useful;
  revise the plan if the model cannot do the intended task. Commit the adapter and evidence.

### Task 3: Fixed browser measurements and defective pages

**Files:** src/inspect.ts, scripts/browser.mjs, fixtures/sites/cafe.html,
fixtures/sites/cafe-defective.html, tests/inspect.test.ts, scripts/probe-page.ts.

**Interfaces:** inspectPage(targetUrl: string, checks: CheckSpec[],
signal: AbortSignal): Promise<InspectionReport>. It consumes only reviewed checks.
validateTargetUrl(raw: string, reservedPorts: number[]): URL owns the target boundary.

- [ ] Write failures for absent/hidden/duplicate expected content, wrong link destinations,
  missing required fields, mobile overflow, unsupported email delivery and unreachable pages.
  Assert no false Verified result on each planted defect.
  Test names: detectsWrongContact, detectsHiddenHours, refusesEmailDeliveryProof,
  blocksOtherOrigin, closesOnAbort. Exact expected results:
  ~~~ts
  assert.equal(broken.results.find(r => r.checkId === "contact")?.status, "Failed");
  assert.equal(report.results.find(r => r.checkId === "email-delivery")?.status, "Unverified");
  assert.throws(() => validateTargetUrl("http://127.0.0.1:11434", [4318, 11434]), /target/i);
  ~~~
- [ ] Run node --test tests/inspect.test.ts and observe the absent inspector failure.
- [ ] Implement fixed check functions and literal parameters, not generated selectors/code.
  Create fresh nonpersistent contexts. Permit bounded same-origin GET/HEAD resources;
  block other origins, non-read methods, downloads, popups, WebSockets and service workers.
  Check redirects. Close contexts on completion, error and cancellation.
- [ ] Capture actual facts and screenshots at both dimensions. Ambiguous matching,
  unavailable evidence or blocked resources affecting a check produce Unverified.
  Horizontal overflow proves only the measured viewport condition. Form-field checks
  prove only their stated structure.
- [ ] Verify good and defective local fixtures plus boundary escape fixtures. Retain
  first-slice evidence and commit the bounded inspector.

### Task 4: Review workflow, local API and report

**Files:** src/server.ts, src/report.ts, src/App.tsx, src/main.tsx, src/styles.css,
index.html, vite.config.ts, tests/server.test.ts, tests/report.test.ts,
tests/browser.spec.ts.

**Interfaces:** createServer(dependencies: { draftChecks: typeof draftChecks; inspectPage: typeof inspectPage }): Node HTTP server; renderMarkdown(
report: InspectionReport): string. API: POST /api/draft and POST /api/inspect,
GET /api/health. Frontend owns brief, draft, reviewed checklist and current fingerprint.

- [ ] Write failing API and journey checks: inspection requires explicit reviewed checks;
  edits invalidate results; busy/timeout/cancel states preserve input; malformed bodies
  and foreign browser origins fail; report output preserves limitations and source quotes.
  Test names: rejectsUnreviewedChecks, rejectsForeignOrigin, preservesBriefOnBusy,
  invalidatesReportAfterEdit, exportsLimitations. Exact assertions:
  ~~~ts
  assert.equal(unreviewedResponse.status, 400);
  assert.equal(foreignOriginResponse.status, 403);
  assert.match(renderMarkdown(report), /Unverified/);
  ~~~
  In the browser test, change the brief after a report; expect the report hidden
  and the edited brief preserved. A subsequent timeout also preserves that value.
- [ ] Run node --test tests/server.test.ts tests/report.test.ts and npm.cmd run test:browser;
  observe missing server/UI behavior.
- [ ] Implement one bounded active job, body limits, same-origin browser access and fixed
  runtime configuration. Keep reports in bounded memory; clear on reset/restart.
  Do not log briefs or persist histories. Validate target and checks again on the server.
- [ ] Build a three-stage interface: brief, reviewed checklist, evidence report.
  Show scope-specific outcomes, unresolved items and the full quoted wording.
  Expose manual review openly; failed AI does not manufacture a successful draft.
  Export Markdown by explicit user action. Keyboard focus and status changes stay usable.
- [ ] Verify desktop/mobile and keyboard journeys with synthetic data, plus stale-report,
  escaping, concurrency and cleanup cases. Review the actual diff through the relevant
  playbook routes, then commit the coherent product slice.

### Task 5: Frozen evaluation and useful delivery evidence

**Files:** fixtures/briefs/heldout.json, scripts/evaluate.ts, tests/evaluation.test.ts,
docs/evaluation.md, docs/evidence/evaluation.json, README.md, THIRD_PARTY_NOTICES.md,
LICENSE, .engineering/project/evidence.json, .engineering/project/outcomes.md.

**Interfaces:** evaluateCases(cases, extractor, inspector): evaluation results with
mapping outcomes, errors, latency and planted-defect findings. Keep development and
held-out inputs separate; the evaluator must not let failures improve the denominator.

- [ ] Author 24 synthetic briefs: eight development and sixteen held out, balanced by
  English/Roman Urdu. Include optional, negated, ambiguous, conflicting and unsupported
  requests. Freeze labels and prompts before held-out inference.
- [ ] Add tests countsFailedExtractionInDenominator and detectsFalseVerified.
  ~~~ts
  assert.equal(evaluation.totalCases, cases.length);
  assert.equal(evaluation.falseVerified, 1);
  ~~~
  A fixture with one deliberately wrong Verified result must produce the second
  assertion. Implement the runner and run node --test tests/evaluation.test.ts.
- [ ] Run actual inference and compare with the documented keyword baseline. Target at
  least 85% mapping accuracy, measurable improvement over that baseline, zero false
  Verified on planted defects, and warm eight-check drafts within 30 seconds.
  Report misses and limited sample size; a failed target triggers a recorded revision.
- [ ] Run proportional build, model-free checks, browser boundary tests, runtime-offline
  behavior, local data lifecycle, lockfile advisory and licensing checks. Verify a clean
  install using documented downloads/configuration, retaining valid earlier results.
- [ ] Ask for authentic tester feedback if a consenting freelancer is available; send
  nothing automatically. Record measured technical outcomes and leave demand unconfirmed
  when no user/payment evidence exists. Commit the verified release candidate.

### Task 6: Demo, DEV write-up and verified submission

**Files:** docs/screenshots/, docs/demo.mp4, docs/dev-submission.md,
docs/demo.md, README.md, .engineering/project/evidence.json.

**Interfaces:** Consumes the exact measured release candidate. Produces a reviewable
submission package and, after separate publication authorization, verified public URLs.

- [ ] Capture a real synthetic-data walkthrough with local inference, checklist review,
  a failing check and an Unverified promise. Inspect every image/video; label any edited
  waits or fixture data. Include readable screenshots and reproducible setup.
- [ ] Write an English DEV post using the official Week 2 template and both required
  tags. Explain customer value, implementation, open-model benefits, baseline, results
  and failures. Credit substantive prior work and enter only implemented partner categories.
- [ ] Humanize the exact public prose and review the complete package with Huzaifa.
  Obtain explicit push authorization and final publication approval.
- [ ] Publish through authorized tools or provide the prepared post for the user when
  account access is unavailable. Verify the public post, tags, repository/demo links and
  actual challenge entry before reporting submission. A draft or enabled button is insufficient.
- [ ] Record publication evidence and the dated outcome decision. Complete the goal only
  after the full submission requirements are proven.

## Handoff and self-review

Coverage: Tasks 1-3 prove the core technical assumption; Task 4 delivers the reviewed
workflow; Task 5 covers evaluation, setup, privacy and licenses; Task 6 reaches the
actual submission. All five Review Focus classes have owning tests. Interfaces use
the same names across tasks. Routine framework choices need no separate ADR.

The first execution decision is whether the real classification/inspection proof
supports the full build. The known future-date validator issue remains recorded in
the evidence pack, with planned dates preserved separately. No application code has
been written in this planning run. Review this plan before execution.
