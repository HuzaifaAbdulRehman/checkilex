import test from 'node:test';import assert from 'node:assert/strict';import {spawn} from 'node:child_process';import {launchBrowser} from '../scripts/browser.mjs';
test('invalidatesReportAfterEdit, preserves inputs on timeout, and supports keyboard/mobile review',async()=>{
 const child=spawn(process.execPath,['src/server.ts'],{stdio:'ignore',windowsHide:true});const browser=await launchBrowser();
 try{
  const page=await browser.newPage({viewport:{width:1366,height:900}});
  for(let i=0;i<100;i++){try{await page.goto('http://127.0.0.1:4318');break}catch{await new Promise(r=>setTimeout(r,100))}}
  const brief='Show "Hours".';let request=0;
  await page.route('**/api/draft',async route=>{request++;await route.fulfill({status:request===1?200:502,contentType:'application/json',body:JSON.stringify(request===1?{checks:[{id:'hours',sourceQuote:brief,kind:'visible_text',params:{text:'Hours'},reviewNotes:'Exact text only'}],model:'test fixture',elapsedMs:1}:{error:'Model request timed out'})})});
  await page.getByLabel('Client brief').fill(brief);await page.getByRole('button',{name:'Draft checks',exact:true}).click();await page.getByLabel('I reviewed every check against the brief').check();
  await page.getByLabel('I control this local page').check();
  await page.route('**/api/inspect',async route=>{
   const input=JSON.parse(route.request().postData()!);const {createHash}=await import('node:crypto');const reviewed=input.checks.map(({reviewNotes,...c}:any)=>c);
   await route.fulfill({contentType:'application/json',body:JSON.stringify({checks:reviewed,results:[{checkId:'hours',status:'Verified',measuredFacts:['1366px: one match'],limitations:['Visible text only'],evidenceIds:[]}],captures:[],targetUrl:input.targetUrl,timestamp:new Date().toISOString(),versions:{browser:'fixture'},notices:[],fingerprint:createHash('sha256').update(JSON.stringify([input.brief,input.targetUrl,reviewed])).digest('hex')})});
  });
  await page.getByRole('button',{name:'Inspect reviewed page'}).click();await page.getByRole('heading',{name:'Delivery evidence',exact:true}).waitFor();
  await page.getByLabel('Exact visible text',{exact:true}).fill('New Hours');
  assert.equal(await page.getByRole('heading',{name:'Delivery evidence',exact:true}).count(),0);
  assert.equal(await page.getByLabel('I reviewed every check against the brief').isChecked(),false);
  await page.getByLabel('I reviewed every check against the brief').check();
  await page.getByRole('button',{name:'Inspect reviewed page'}).click();await page.getByRole('heading',{name:'Delivery evidence',exact:true}).waitFor();
  await page.getByLabel('Your local page',{exact:true}).fill('http://127.0.0.1:4320/');
  assert.equal(await page.getByRole('heading',{name:'Delivery evidence',exact:true}).count(),0);
  assert.equal(await page.getByLabel('I control this local page').isChecked(),false);
  await page.getByLabel('I reviewed every check against the brief').check();await page.getByLabel('I control this local page').check();
  await page.getByRole('button',{name:'Inspect reviewed page'}).click();await page.getByRole('heading',{name:'Delivery evidence',exact:true}).waitFor();
  await page.getByLabel('Client brief').fill(brief+' Changed.');assert.equal(await page.getByRole('heading',{name:'Delivery evidence',exact:true}).count(),0);
  await page.getByRole('button',{name:'Draft checks',exact:true}).click();await page.getByRole('alert').waitFor();assert.equal(await page.getByLabel('Client brief').inputValue(),brief+' Changed.');
  await page.setViewportSize({width:390,height:844});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
  await page.getByLabel('Client brief').focus();await page.keyboard.press('Tab');assert.equal(await page.getByRole('button',{name:'Draft checks',exact:true}).evaluate(el=>el===document.activeElement),true);
 }finally{await browser.close();child.kill()}
});

test('form list editing preserves spaces and separators during typing',async()=>{
 const child=spawn(process.execPath,['src/server.ts'],{stdio:'ignore',windowsHide:true}),browser=await launchBrowser();
 try{
  const page=await browser.newPage();
  for(let i=0;i<100;i++){try{await page.goto('http://127.0.0.1:4318');break}catch{await new Promise(r=>setTimeout(r,100))}}
  await page.getByLabel('Client brief').fill('A form needs fields labelled "First name" and "Email address", both required.');
  await page.getByRole('button',{name:'Add a manual check'}).click();await page.getByLabel('Check 1 type').selectOption('form_structure');
  const labels=page.getByLabel('Field labels (comma separated)',{exact:true}),required=page.getByLabel('Required labels',{exact:true});
  await labels.pressSequentially('First name, Email address');assert.equal(await labels.inputValue(),'First name, Email address');
  await required.pressSequentially('First name, Email address');assert.equal(await required.inputValue(),'First name, Email address');
  await page.getByLabel('I reviewed every check against the brief').check();assert.equal(await labels.inputValue(),'First name, Email address');
 }finally{await browser.close();child.kill()}
});
