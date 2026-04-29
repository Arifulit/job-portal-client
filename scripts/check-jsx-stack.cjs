const fs = require('fs');
const path = require('path');
const file = path.join(__dirname,'..','src','pages','Recruiter','JobPost.tsx');
const sAll = fs.readFileSync(file,'utf8');
const returnPositions = [];
let idx = 0;
while((idx = sAll.indexOf('return (', idx)) !== -1){
  returnPositions.push(idx);
  idx += 8;
}
let jsxStart = -1;
for(const pos of returnPositions){
  const snippet = sAll.slice(pos+8, pos+300).trimStart();
  if(snippet.startsWith('<')){ jsxStart = pos+8; break; }
}
if(jsxStart === -1){
  console.log('Could not locate JSX return block reliably; aborting tag scan.');
  process.exit(0);
}
const s = sAll.slice(jsxStart);
const selfClosing = new Set(['input','img','br','hr','meta','link','area','base','col','embed','param','source','track','wbr']);
const tagRegex = /<\/?([A-Za-z0-9_\-]+)([^>]*)>/g;
let match;
const stack = [];
let lastIndex = 0;
while((match = tagRegex.exec(s)) !== null){
  const full = match[0];
  const name = match[1];
  const isClosing = full.startsWith('</');
  const rest = match[2] || '';
  const isSelf = /\/$/.test(rest) || selfClosing.has(name.toLowerCase());
  lastIndex = match.index;
  const upto = s.slice(0, lastIndex);
  const lineNo = upto.split(/\r?\n/).length;
  if(isClosing){
    if(stack.length === 0){
      console.log(`Unmatched closing </${name}> at line ${lineNo}`);
    } else {
      const top = stack[stack.length-1];
      if(top.name === name){
        stack.pop();
      } else {
        console.log(`Mismatched closing </${name}> at line ${lineNo}, expected </${top.name}>`);
        // attempt to recover
        let found = false;
        for(let i=stack.length-2;i>=0;i--){
          if(stack[i].name === name){
            stack.splice(i);
            found = true; break;
          }
        }
      }
    }
  } else if(!isSelf){
    stack.push({name, line: lineNo});
  }
}

if(stack.length){
  console.log('Remaining unclosed tags (bottom->top):');
  for(const t of stack){
    console.log(t.name, 'opened at line', t.line);
  }
} else {
  console.log('All tags matched in JSX block.');
}

// print tail of the JSX for context
const sLines = s.split(/\r?\n/);
console.log('\n--- JSX tail 120 lines ---\n');
console.log(sLines.slice(-120).join('\n'));
