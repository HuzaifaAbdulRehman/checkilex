import type {InspectionReport} from './checks.ts';
const escape=(s:string)=>s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/[\\`*_{}\[\]()#+.!|~-]/g,'\\$&');
export function renderMarkdown(report:InspectionReport):string{
 const lines=['# Checkilex','','Target: '+escape(report.targetUrl),'','Checked: '+escape(report.timestamp),'','Input fingerprint: '+escape(report.fingerprint),'','These results cover reviewed checks at 1366 × 900 and 390 × 844. They are not a complete acceptance certificate.',''];
 for(const result of report.results){
  const check=report.checks.find(c=>c.id===result.checkId)!;
  lines.push('## '+result.status+' — '+escape(check.id),'',...check.sourceQuote.split('\n').map(s=>'> '+escape(s)),'','Measured facts:','',...result.measuredFacts.map(s=>'- '+escape(s)),'','Limits:','',...result.limitations.map(s=>'- '+escape(s)),'');
 }
 if(report.notices.length)lines.push('## Resource notices','',...report.notices.map(s=>'- '+escape(s)),'');
 lines.push('## Captures','','Download the accompanying PNG files from the application.','',...report.captures.map(c=>'!['+c.width+' × '+c.height+'](evidence-'+c.width+'.png)'),'','Versions: '+Object.entries(report.versions).map(([k,v])=>escape(k+' '+v)).join('; '),'');
 return lines.join('\n');
}
