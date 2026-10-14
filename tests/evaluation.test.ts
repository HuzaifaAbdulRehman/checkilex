import test from 'node:test';import assert from 'node:assert/strict';import {evaluateCases,evaluateDefects} from '../scripts/evaluate.ts';
const cases=[{id:'a',language:'en',brief:'Show "Hours".',expectedKinds:['visible_text'],expectedText:'Hours'},{id:'b',language:'ur-Latn',brief:'Page par "Hours" dikhao.',expectedKinds:['visible_text'],expectedText:'Hours'}];
test('countsFailedExtractionInDenominator',async()=>{
 const result=await evaluateCases(cases as any,async()=>{throw Error('unavailable')});assert.equal(result.totalCases,2);assert.equal(result.mappingCorrect,0);assert.equal(result.extractionErrors,2);
});
test('detectsFalseVerified',async()=>{
 const result=await evaluateDefects([{id:'broken',targetUrl:'http://127.0.0.1:4319/',checks:[],expectedStatuses:{email:'Failed'}}],async()=>({results:[{checkId:'email',status:'Verified'}]} as any));assert.equal(result.falseVerified,1);assert.equal(result.totalAssertions,1);
});
test('correct kind with wrong literal parameter is a mapping miss',async()=>{
 const result=await evaluateCases([cases[0]] as any,async()=>({checks:[{id:'c',kind:'visible_text',params:{text:'Invented'},sourceQuote:'Show "Hours".',reviewNotes:''}],elapsedMs:1}));assert.equal(result.mappingCorrect,0);
});
