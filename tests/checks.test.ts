import test from 'node:test';
import assert from 'node:assert/strict';
import { validateDraft, validateReviewed, fingerprint } from '../src/checks.ts';
import { baselineDraft } from '../scripts/baseline.ts';
const brief = 'Show opening hours';
const check = { id: 'hours', sourceQuote: brief, kind: 'visible_text', params: { text: 'opening hours' }, reviewNotes: '' };
test('rejectsFabricatedQuote', () => assert.throws(() => validateDraft(brief, [{ ...check, sourceQuote: 'invented' }]), /quote/i));
test('rejectsNinthCheck', () => assert.throws(() => validateDraft(brief, Array.from({ length: 9 }, (_, i) => ({ ...check, id: `c${i}` }))), /eight/i));
test('rejects blank, oversized and malformed input', () => {
  for (const text of ['', ' '.repeat(20), 'x'.repeat(4001)]) assert.throws(() => validateDraft(text, []), /brief/i);
  for (const value of [null, {}, [{ ...check, params: { text: '' } }], [{ ...check, status: 'Verified' }], [check, check]]) assert.throws(() => validateDraft(brief, value));
  assert.throws(() => validateReviewed([{ ...check, kind: 'execute_code' }]));
});
test('invalidatesEditedInput', () => {
  const checks = validateReviewed([check]);
  const original = fingerprint(brief, 'http://127.0.0.1:4319/', checks);
  assert.notEqual(original, fingerprint(brief + '!', 'http://127.0.0.1:4319/', checks));
  assert.notEqual(original, fingerprint(brief, 'http://127.0.0.1:4320/', checks));
  assert.notEqual(original, fingerprint(brief, 'http://127.0.0.1:4319/', [{ id:'hours', sourceQuote:brief, kind:'visible_text', params: { text: 'Monday' } } ]));
});
test('unsupported promises remain unverified in the explicit baseline', () => {
  assert.equal(baselineDraft('Contact form must deliver email')[0].kind, 'unverified');
  assert.deepEqual(validateDraft(brief, []), []);
});

test('English baseline preserves email punctuation and recognizes explicit form labels',()=>{
 const link=baselineDraft('Add a link labelled "Email" to hello@junipercafe.test.')[0];
 assert.equal(link.kind,'link_destination');if(link.kind==='link_destination')assert.equal(link.params.hrefPrefix,'mailto:hello@junipercafe.test');
 const form=baselineDraft('Contact form must have fields labelled "Name" and "Email", both required.')[0];
 assert.equal(form.kind,'form_structure');
});
