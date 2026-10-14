---
title: "Site Delivery Check: local AI for the final handoff"
published: false
tags: devchallenge, hf26challenge, opensource, ai
---

My entry for [Hacktoberfest Week 2: Side Hustle](https://dev.to/challenges/hacktoberfest-week2-2026-10-12).

## What I Built

A landing page can look finished while its contact link points to the wrong address.
Another promise is harder to judge: a form can have the right fields without
delivering a message.

Site Delivery Check helps a freelance web developer turn a brief into a reviewed
checklist and a record of what the page actually proves.

Paste an English or Roman Urdu brief. A local Qwen model proposes up to eight
checks, each attached to the client's original wording. Review the list, correct
mistakes, then inspect a developer-controlled local page. The result includes
desktop/mobile captures and an exportable Markdown report.

The intended customer is a freelancer preparing a small-business site for delivery.
The value to test is less checklist preparation and a clearer handoff. Paid setup
or support could be a side hustle around it. I have no customer, payment or
measured time-saving evidence yet.

## Demo

[Watch the 45-second walkthrough](https://github.com/HuzaifaAbdulRehman/site-delivery-check/blob/build/local-evidence/docs/demo.webm).

![Actual report for a fictional café with planted defects](https://raw.githubusercontent.com/HuzaifaAbdulRehman/site-delivery-check/refs/heads/build/local-evidence/docs/screenshots/app-report-desktop.png)

This is automated operation of the real local app with synthetic data, not a
customer session. The recording is silent and uncut, including the 32.1-second
inference wait.

The defective café produces three Failed checks: hidden hours, the wrong email
destination and mobile overflow. Switching to the good fixture produces three
Verified checks. The email-delivery promise stays **Unverified** in both.

That last outcome matters. No form was submitted; nothing established that a
message reached an inbox. The report preserves that limit beside its findings.

## Code

[Source, setup instructions and evaluation evidence](https://github.com/HuzaifaAbdulRehman/site-delivery-check).

The application is MIT licensed. All application code, café fixtures and evaluation
briefs were written during this challenge window. Previously downloaded runtime,
weight and browser caches were reused locally.

## How I Built It

The app uses TypeScript, React, a small Node HTTP server, Ollama 0.40.0, the
qwen3:1.7b tag and Playwright 1.63.0.

The model returns structured check data. Literal text, link labels and destinations
are grounded in the source quote. Known optional and negated wording restricts
concrete proposals. Every draft still needs review for omissions and meaning.

Fixed checks measure visible text, exact link destinations, specified form fields
and horizontal overflow at 1366 × 900 and 390 × 844. The browser uses fresh
contexts and bounded requests to one explicit local origin. Forms are never
submitted. Editing the brief, checklist or target discards the report.

My first evaluation was disappointing:

| Frozen set | Complete pipeline | Keyword comparator |
| --- | --- | --- |
| Original held-out 16 briefs | 12/16 | 14/16 |
| Fresh 16 briefs after grounding revision | 16/16 | 8/16 |

The original model dropped required form fields and misread vague or contradictory
Roman Urdu requests. I retained those failures, tightened grounding, then froze
new cases before rerunning.

A stronger comparator using the same grounding rules scored **11/16** on the fresh
set. The revised **16/16** result belongs to the complete pipeline. These small,
targeted synthetic sets do not establish general reliability, and they are
different populations.

Four planted browser defects failed, while an unsupported delivery promise stayed
Unverified: zero false Verified outcomes across those five assertions.

Performance is unfinished. The single-requirement revision cases took 5.2–13.3
seconds on my i5-8350U laptop. Both eight-check requests hit the 45-second timeout.
The planned 30-second eight-check target remains unmet.

## Why Does Open Innovation Matter?

[Qwen's open weights](https://huggingface.co/Qwen/Qwen3-1.7B) and
[Ollama](https://github.com/ollama/ollama) keep inference on the developer's laptop.
The app does not send client briefs to a hosted inference API. I can inspect and
change the schema, revise the grounding rules, or test another model without
depending on a provider's endpoint.

[Playwright](https://github.com/microsoft/playwright) supplies reproducible browser
measurements and captures. The repository records the actual weights, runtime
settings, frozen inputs and raw outputs.

The tradeoff is visible in the demo: local inference on this machine is slow.
There is no per-request API bill, but hardware, electricity and setup still cost
something. Open components made this particular local workflow possible; they did
not remove the need to measure it.

Next I want a consenting freelancer to compare it with their existing delivery
checklist. That would test the business idea better than another synthetic success
count.
