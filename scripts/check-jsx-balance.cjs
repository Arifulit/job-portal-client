const fs = require('fs');
const path = require('path');
const file = path.join(__dirname,'..','src','pages','Recruiter','JobPost.tsx');
const s = fs.readFileSync(file,'utf8');
const tags = ['div','form','h1','p','img','input','button','label','textarea','select','option'];
const counts = {};
for(const t of tags){
  const open = (s.match(new RegExp('<'+t+'(?:\\s|>|>)','g'))||[]).length;
  const close = (s.match(new RegExp('</'+t+'>','g'))||[]).length;
  counts[t]={open,close};
}
console.log('Tag balance for JobPost.tsx:');
for(const k of Object.keys(counts)){
  console.log(k, counts[k]);
}
// print last 120 lines for manual inspection
const lines = s.split(/\r?\n/);
console.log('\n--- tail 120 lines ---\n');
console.log(lines.slice(-120).join('\n'));
