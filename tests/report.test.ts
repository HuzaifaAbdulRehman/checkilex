import test from 'node:test';import assert from 'node:assert/strict';import {renderMarkdown} from '../src/report.ts';import type {InspectionReport} from '../src/checks.ts';
test('exportsLimitations and escapes client-authored markup',()=>{
 const report:InspectionReport={checks:[{id:'email',sourceQuote:'<script>alert(1)</script>\n# injected',kind:'unverified',params:{reason:'Needs delivery proof'}}],results:[{checkId:'email',status:'Unverified',measuredFacts:['Not submitted'],limitations:['Form structure does not prove delivery.'],evidenceIds:[]}],captures:[],targetUrl:'http://127.0.0.1:4319/',timestamp:'2026-10-14',versions:{browser:'fixture'},fingerprint:'abc',notices:[]};
 const text=renderMarkdown(report);assert.match(text,/Unverified/);assert.match(text,/Form structure does not prove delivery/);assert.doesNotMatch(text,/<script>/);assert.match(text,/>.*injected/);
});
