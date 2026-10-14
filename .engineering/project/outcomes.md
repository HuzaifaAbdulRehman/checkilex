# Outcome review

Review date: 14 October 2026.
Decision: iterate on the product; source and Week 2 submission are published and verified.

## Expected and actual

The original mapping target was at least 85% and an improvement over keywords.
V1 missed both: 12/16 held-out mappings versus 14/16 for keywords.
The revised complete pipeline passed 16/16 fresh synthetic cases, versus 8/16
for keywords and 11/16 when the same grounding veto was added to keywords.
The small targeted set does not establish general reliability.

Four planted page defects failed; the unsupported delivery promise stayed
Unverified. No false Verified outcome occurred in those five assertions.
The 30-second warm eight-check drafting target failed in both versions.
A real four-check demo took 32.1 seconds to draft.

## User and operational evidence

No customer feedback, payment or preparation-time measurement is available.
Huzaifa delegated the tester decision; no consented tester was supplied.
Demand remains unconfirmed.

The actual app supports review/edit/export, stale-result removal and keyboard
and mobile use. Model-offline testing preserved the brief and required an
explicit manual check rather than manufacturing a draft. Clear/reload removed
UI state; no cookies or browser history storage were observed. Downloads and
Ollama's local inference context have separate lifetimes.

A clean dependency installation and production build passed using reused,
documented runtime/browser resources. A fresh Windows setup was not tested.
No hosted inference spending was introduced.

## What changed

Exact quote validation alone did not stop semantically wrong checks.
Literal grounding and conservative phrase rules now constrain model output.
They are disclosed parts of the pipeline. Human review remains necessary.

The recorded demo uses native WebM because the available local encoder supports
VP8. All displayed businesses, briefs and browser results are synthetic.
The recording is automated operation of the real app, not a customer session.

## Follow-up

Source push and owner publication are complete. [The DEV post](https://dev.to/huzaifa_abdulrehman9/checkilex-local-ai-for-the-final-handoff-28c2)
was published on 14 October 2026 at 20:24 Karachi. Its Week 2 submission badge,
required tags, tag-feed membership and source/demo/image links were verified.
See [the receipt](../../docs/evidence/submission-receipt.json).

- Huzaifa: seek optional consented freelancer feedback by 18 October. Leave
  demand unconfirmed if no feedback arrives.
- Huzaifa: revisit eight-check latency before promising it as a paid workflow.
  Target decision: 19 October 2026; do not hide the current timeout.

## Playbook candidates

An exact-substring quote can accompany a wrong semantic check. A small model's
schema validity and useful task mapping need separate evaluation.
