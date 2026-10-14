# Site Delivery Check

Status: planning complete; clarify the technical assumption before a full build.
Owner: Huzaifa Abdul Rehman. Decision date: 14 October 2026.

## Project profile

ML/AI project delivered as a local Windows web app, public source and a recorded
demo. Normal risk. Node 24.13.0, TypeScript 5.9.3, React/React DOM 19.3.0,
Vite 8.3.1, Playwright 1.63.0, Ollama 0.40.0 and Qwen3 1.7B are proposed.
Triggered overlays and their boundaries are recorded in evidence.json.

## Problem

Freelance developers compare finished pages with client briefs before delivery.
Generic scope tools already appear in the DEV sample. The proposed value is a
reviewable record of actual checks; demand and time saved remain hypotheses.

## User and outcome

Independent developers delivering small business landing pages from a local
build. Target less checklist preparation and clearer delivery evidence.
Payment is outside this prototype.

## Evidence

[ScopeCraft](https://dev.to/harshalranjhani/scopecraft-a-clearer-scope-a-fairer-quote-and-a-model-you-can-own-2cla)
covers proposal drafting.
[Playwright](https://playwright.dev/docs/api/class-browsercontext) supports
fresh browser contexts; the preserved Chromium revision matches version 1.63.0.
The [test-generation comparator](https://github.com/TinasheBA/playwright-ai-testgen)
shows why reported coverage needs verification. Customer validation is missing.

## Scope

One page, up to eight reviewed requirements, desktop and mobile captures.
Local Qwen proposes checks from English or Roman Urdu text, preserving exact
brief quotes. The user confirms the checklist before inspection. Fixed code
checks visible text, contact/navigation destinations, specified form-field
structure, and horizontal overflow. Outcomes are Verified, Failed or Unverified,
with measured facts and the scope of each check. Export a Markdown report.
Form structure never proves message delivery.

## Non-goals

Proposal pricing, contracts, full accessibility or security certification,
visual taste judgments, form submission, payments, login sessions, arbitrary
generated test code, public-site crawling, and a hosted scanning service.

## Constraints

New code and repository inside the Week 2 window. Submission deadline:
19 October 2026, 11:59 AM Karachi; prepare publication by 10:30 AM.
No new cloud spend or training. Reuse downloaded models and the matching browser.
Inspect only a developer-controlled HTTP page on an explicitly selected
127.0.0.1 port. Use a fresh context, bounded same-origin reads and honest
resource-blocking notices. Client text and reports stay local.

## Risks and assumptions

Risks: misclassified requests, checks narrower than their promises, and unwanted
page requests. Test classification and quoting first. Human review, fixed checks,
bounded inspection and Unverified results constrain the risk. Roman Urdu quality
and willingness to pay are untested.

## Success and stop conditions

Freeze 24 original synthetic briefs: eight for prompt development and sixteen
held out, balanced across English and Roman Urdu. Compare with a documented
keyword/manual-checklist baseline. Target at least 85% check mapping accuracy
and a measurable improvement over the automatic keyword baseline. Require zero
false Verified results on planted defects and unsupported promises. Record raw
outputs, misses and latency; target a warm eight-check draft within 30 seconds.
Measure on 15-17 October. A 60-minute prompt experiment that cannot support a
reliable reviewed checklist triggers a plan revision, not a disguised template
replacement.

## First slice

One fictional cafe page and brief: contact link and opening hours. Real local
inference proposes quote-grounded checks; operator review precedes inspection.
Correct and defective pages produce different evidence. An email-delivery
promise stays Unverified. Retain the run, timings and failures.

## Delivery path

15 October: classification proof and fixed checks with defective fixtures.
16 October: review UI, state changes, failure handling and Markdown export.
17 October: frozen evaluation, browser/privacy checks and a clean setup check.
18 October: a real demo video, screenshots, README and evidence-based DEV draft.
19 October morning: approved publication, explicit push authorization and
verification of the public post, tags, links and challenge entry.

## Lifecycle gates

Huzaifa owns the brief review, classification proof, coherent-slice review,
release review, submission approval and outcome decision. Each gate's trigger,
evidence and date are in evidence.json. Future targets use plannedFor because
the checker rejects future targetDate values; that bug remains recorded.
outcomes.md stays unfilled until measurements exist.
