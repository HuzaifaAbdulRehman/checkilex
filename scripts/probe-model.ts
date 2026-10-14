import { draftChecks } from '../src/model.ts';
import { writeFile } from 'node:fs/promises';
const brief='Show "Open daily, 8am–6pm". Add a link labelled "Email" to hello@junipercafe.test. Contact form must deliver email.';
const draft=await draftChecks(brief,new AbortController().signal);
await writeFile('docs/evidence/first-model-run.json',JSON.stringify({date:new Date().toISOString(),synthetic:true,brief,...draft,weightDigest:'sha256:3d0b790534fe4b79525fc3692950408dca41171676ed7e21db57af5c65ef6ab6',weightBytes:1359279776},null,2));
console.log(JSON.stringify({elapsedMs:draft.elapsedMs,checks:draft.checks},null,2));
