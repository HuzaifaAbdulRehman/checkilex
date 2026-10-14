# Evaluation

Measured 14 October 2026. All inputs and pages are synthetic.

| Run | Pipeline | Correct mappings | Comparator |
| --- | --- | --- | --- |
| V1 held out | Qwen + quote validation | 12/16 (75%) | English keywords: 14/16 |
| V2 fresh holdout | Qwen + literal grounding | 16/16 | English keywords: 8/16 |
| V2 rule-matched comparison | Same grounding veto after keywords | 11/16 | Same fresh 16 cases |

These are different sets. V2 is not a before/after percentage on the same test
population. It measures the complete constrained pipeline, not model-only skill.

## Method

V1 used eight development briefs and sixteen held-out briefs, balanced across
English and Roman Urdu. The evaluator requires the annotated kinds and named
literal parameters to match; a right kind with a wrong required field fails.
Extraction errors remain in the denominator. V1 had no extraction errors and
scored 7/8 on development cases. Development form labels had fewer annotated
constraints than the held-out form cases.

The original failures matter. Both held-out form requests lost one required
field. A vague Roman Urdu aesthetic request became visible text. A contradictory
Roman Urdu request produced an unsafe concrete check. The development optional
dark-mode request also became visible text.

The revision constrains text and link parameters to literals in their source
quote, retains all quoted form labels, and retains every required field when
the wording says both/all are required. Explicit English/Roman Urdu optional
and negation phrases restrict concrete proposals. Unsupported requests still
need manual proof. These rules are part of the result, not evidence that the
small model understands every such phrase.

A fresh, balanced set of sixteen briefs was frozen before V2 inference.
The old held-out failures became development evidence. No V2 prompt, rules or
labels were changed after its freeze. The same author wrote the cases knowing
the earlier failures; this is a small targeted check, not a representative,
externally blinded benchmark.

The keyword baseline splits sentences without breaking email addresses,
recognizes English qualifiers, quoted text, explicit contacts/forms and mobile
wording, and otherwise marks a requirement Unverified. It has no language model.
The stronger comparator applies the exact same grounding veto; rejected
keyword proposals become Unverified only inside that evaluation script.
Neither comparator is an application fallback.

## Browser findings

The defective café has four planted defects: hidden hours, a wrong email
destination, a missing required field and horizontal overflow on mobile.
All four failed, while an email-delivery promise remained Unverified:
**zero false Verified results across five expected outcomes**.

Separate tests cover duplicate matches, opacity-hidden content, fields spread
across different forms, rejected target addresses, unavailable pages and
cancellation. Escape fixtures received no cross-origin or non-read requests.
These bounded cases do not establish correctness on arbitrary websites.

## Latency and limits

Machine: Intel Core i5-8350U, 8 logical CPUs, 15.9 GiB RAM, Intel UHD 620.
Runtime: Ollama 0.40.0, tag qwen3:1.7b, Q4_K_M, nonthinking mode,
temperature 0, context 4096, output budget 1400 tokens, 45-second client timeout.
The runtime reports parameter_size 2.0B; the tag and exact weight digest are
preserved in the evidence.

V2's single-requirement cases took 5.2–13.3 seconds (median 8.9).
The actual four-check UI demo took **32.1 seconds** to draft.
The eight-check requests timed out in both versions. The planned warm
eight-check target of 30 seconds remains **unmet**. Eight reviewed browser
checks are supported; fast eight-check AI extraction is not demonstrated.

The first V1 cold inference took 38.3 seconds. Do not compare that directly
with warm single-requirement timings. No hosted inference API was used.
Hardware, electricity and setup time still have costs.

## Reproduce and inspect

Follow the README, run the local model and fixture server, then run
`node scripts/run-evaluation-v2.ts`. This overwrites the current V2 run files;
commit or preserve an earlier result before rerunning.

[Original outputs](evidence/evaluation-v1.json),
[original freeze](evidence/evaluation-freeze-v1.json),
[revised outputs](evidence/evaluation-v2.json),
[revised freeze](evidence/evaluation-freeze-v2.json),
[rule-matched comparator](evidence/grounded-baseline-v2.json),
[demo run](evidence/demo-run.json) and
[model metadata](evidence/model-details.json) retain the inputs and results.
V1's model source is available at local commit c4401da; compare the recorded
hashes when reconstructing that historical run.

Clean dependency installation and production bundling passed in an isolated
directory using documented runtime/browser resources. Fresh Windows setup and
fresh model/browser downloads were not tested. npm audit reported zero
advisories for the lockfile on the measurement date.

No consenting customer session, payment or time-saving measurement exists.
The next useful check is a real freelancer's workflow, not a larger synthetic
success count.
