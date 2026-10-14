import type {ModelDraft} from '../src/model.ts';
import type {InspectionReport} from '../src/checks.ts';
import {mkdir,writeFile,rename} from 'node:fs/promises';import path from 'node:path';
process.env.PLAYWRIGHT_BROWSERS_PATH=path.join(process.env.SDC_RESOURCES||'D:\\Programming\\Open_Source\\hacktoberfest-week2-resources','browsers');
const {launchBrowser}=await import('./browser.mjs');
const browser=await launchBrowser();await mkdir('.runtime/demo-raw',{recursive:true});
const context=await browser.newContext({viewport:{width:1366,height:900},recordVideo:{dir:'.runtime/demo-raw',size:{width:1366,height:900}}});
const page=await context.newPage(),video=page.video()!,start=Date.now();
try{
 await page.goto('http://127.0.0.1:4318');await page.getByLabel('Client brief').waitFor();await page.waitForTimeout(1500);
 await page.getByRole('button',{name:'Use café example'}).click();
 await page.getByLabel('Your local page',{exact:true}).fill('http://127.0.0.1:4319/defective');
 const modelResponse=page.waitForResponse(r=>r.url().endsWith('/api/draft'),{timeout:55000});
 await page.getByRole('button',{name:'Draft checks',exact:true}).click();
 const response=await modelResponse,draft=await response.json() as ModelDraft & {error?:string};if(!response.ok())throw Error(draft.error);
 console.log('Real model draft:',draft.elapsedMs+'ms',draft.checks.map(c=>c.kind).join(','));
 if(draft.checks.length!==4||!draft.checks.some(c=>c.kind==='visible_text'&&c.params.text==='Open daily, 8am–6pm')||!draft.checks.some(c=>c.kind==='link_destination'&&c.params.label==='Email'&&c.params.hrefPrefix==='mailto:hello@junipercafe.test')||!draft.checks.some(c=>c.kind==='horizontal_overflow')||!draft.checks.some(c=>c.kind==='unverified'))throw Error('Synthetic expected review differs from draft; inspect raw output before continuing');
 await page.locator('.workspace').scrollIntoViewIfNeeded();await page.screenshot({path:'docs/screenshots/app-review.png',fullPage:true});await page.waitForTimeout(1500);
 await page.getByLabel('I reviewed every check against the brief').check();await page.getByLabel('I control this local page').check();
 const badResponse=page.waitForResponse(r=>r.url().endsWith('/api/inspect'));await page.getByRole('button',{name:'Inspect reviewed page'}).click();
 const bad=await (await badResponse).json() as InspectionReport & {error?:string};if(bad.error)throw Error(bad.error);
 await page.getByRole('heading',{name:'Delivery evidence',exact:true}).waitFor();await page.locator('.report').evaluate(el=>el.scrollIntoView({block:'start'}));
 await page.screenshot({path:'docs/screenshots/app-report-desktop.png'});await page.locator('.report').screenshot({path:'docs/screenshots/app-report-full.png'});
 const markdownDownload=page.waitForEvent('download');await page.getByRole('button',{name:'Export Markdown'}).click();await (await markdownDownload).saveAs('docs/screenshots/site-delivery-report.md');
 for(const capture of bad.captures){const download=page.waitForEvent('download');await page.locator('.captures figure').filter({has:page.getByAltText('Inspected local page at '+capture.width+' by '+capture.height+' pixels')}).getByRole('button',{name:'Download PNG'}).click();await (await download).saveAs('docs/screenshots/evidence-'+capture.width+'.png')}
 await page.setViewportSize({width:390,height:844});await page.locator('.report').evaluate(el=>el.scrollIntoView({block:'start'}));await page.screenshot({path:'docs/screenshots/app-report-mobile.png'});await page.setViewportSize({width:1366,height:900});
 await page.getByLabel('Your local page',{exact:true}).fill('http://127.0.0.1:4319/');
 const invalidatedAfterTargetEdit=await page.getByRole('heading',{name:'Delivery evidence',exact:true}).count()===0;
 await page.getByLabel('I reviewed every check against the brief').check();await page.getByLabel('I control this local page').check();
 const goodResponse=page.waitForResponse(r=>r.url().endsWith('/api/inspect'));await page.getByRole('button',{name:'Inspect reviewed page'}).click();const good=await (await goodResponse).json() as InspectionReport & {error?:string};if(good.error)throw Error(good.error);
 await page.getByRole('heading',{name:'Delivery evidence',exact:true}).waitFor();await page.locator('.report').evaluate(el=>el.scrollIntoView({block:'start'}));await page.screenshot({path:'docs/screenshots/app-report-good.png'});await page.waitForTimeout(2000);
 const withoutImages=(report:InspectionReport)=>({...report,captures:report.captures.map(({dataUrl,...c})=>c)});
 await writeFile('docs/evidence/demo-run.json',JSON.stringify({date:new Date().toISOString(),synthetic:true,walkthrough:'Automated operation of actual UI, local model and inspector; synthetic expected checks reviewed by script. Not customer feedback or a human testing session.',draft,bad:withoutImages(bad),good:withoutImages(good),invalidatedAfterTargetEdit,elapsedMs:Date.now()-start,editing:'No video time cuts; silent recording. Viewport changes are visible.'},null,2));
 console.log('Bad:',bad.results.map(r=>r.status).join(','),'Good:',good.results.map(r=>r.status).join(','));
}finally{await context.close();await browser.close();const raw=await video.path();await rename(raw,'docs/demo.webm');console.log('Saved docs/demo.webm')}
