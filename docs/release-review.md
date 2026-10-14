# Release review

Reviewed 14 October 2026 against local candidate b627062 and the approved brief.
The independent whole-branch review found three important false Verified cases.
All three entered one fix pass. Two additional issues found during that pass
received the same failing-test-first treatment.

| Finding | Result after the fix |
| --- | --- |
| CSS clip-path or legacy clip hides matching text or controls | Unverified; visual review required |
| A disabled fieldset contains a required field | Failed; the first-legend exception stays enabled |
| HTML base changes a relative link's actual destination | Compare the browser-resolved href; wrong destination fails |
| An accessible name differs from visible link text | The promised visible text must match |
| Typing spaces and commas in form-label lists loses characters | Preserve raw input while updating the parsed checks |

Each regression failed before its implementation change. The final run passed
33 Node tests and two browser journeys, with zero failures or skips. Type checking,
the production build and diagnostics on the four changed files also passed.
A JSX delimiter error was caught by type checking and corrected before that run.
No model, grounding rule, frozen corpus or dependency changed; existing inference,
media and installation evidence remains applicable.

The review found no critical or minor issues. No second review was commissioned.

## Decisions and remaining limits

- These regressions establish the listed cases, not reliability on arbitrary
  pages. Human review and scoped report limitations remain necessary.
- Clipping yields Unverified even when a particular clip might leave content
  visible. The cost is additional visual review.
- Link labels mean visible text, as the brief promises. Icon-only links require
  another check or manual evidence; accessible names alone do not satisfy it.
- The unmet latency target and absent customer validation remain disclosed.
  This candidate supports a prototype submission, not a paid-ready claim.
- Browser request controls are not OS-level network isolation.
- Publishing and owner approval of the prepared source licence/data notice remain
  pending. No repository push, DEV publication or challenge receipt exists.

The implementation ledger remains local while the submission goal is pending.
[Evaluation](evaluation.md), [post](dev-submission.md) and
[publication steps](publication.md) retain the evidence and next gate.
