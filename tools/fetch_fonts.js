const fs=require('fs');
const https=require('https');
const css=fs.readFileSync('gf.css','utf8');
const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36';
function get(url){return new Promise((res,rej)=>{https.get(url,{headers:{'User-Agent':UA}},r=>{const c=[];r.on('data',d=>c.push(d));r.on('end',()=>res(Buffer.concat(c)));}).on('error',rej);});}
const re=/\/\* ([a-z-]+) \*\/\s*(@font-face\s*\{[^}]*\})/g;
const keep=['latin','latin-ext'];
let m, blocks=[];
while((m=re.exec(css))){ if(keep.includes(m[1])) blocks.push(m[2]); }
console.error('blocks to embed:',blocks.length);
(async()=>{
  let out='';
  for(const b of blocks){
    const url=(b.match(/url\((https:[^)]+woff2)\)/)||[])[1];
    if(!url){out+=b+'\n';continue;}
    const buf=await get(url);
    const dataUrl='data:font/woff2;base64,'+buf.toString('base64');
    out+=b.replace(url,dataUrl)+'\n';
    const fam=(b.match(/font-family:\s*'([^']+)'/)||[])[1];
    const wt=(b.match(/font-weight:\s*(\d+)/)||[])[1];
    console.error('embedded',fam,wt,Math.round(buf.length/1024)+'kb');
  }
  fs.writeFileSync('fontface.css',out);
  console.error('wrote fontface.css',Math.round(fs.statSync('fontface.css').size/1024)+'kb');
})();
