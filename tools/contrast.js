// WCAG AA contrast audit for the card colour pairs. Run: node tools/contrast.js
function lin(c){c/=255;return c<=0.03928?c/12.92:Math.pow((c+0.055)/1.055,2.4);}
function lum(hex){const n=parseInt(hex.slice(1),16);return 0.2126*lin((n>>16)&255)+0.7152*lin((n>>8)&255)+0.0722*lin(n&255);}
function ratio(a,b){const l1=lum(a),l2=lum(b);return ((Math.max(l1,l2)+0.05)/(Math.min(l1,l2)+0.05));}
// host-city palettes: town=Boston green, mafia=Kansas City red, third=Houston blue
const AL={mafia:{main:'#e01b3c',light:'#f24668',deep:'#a3122b'},town:{main:'#16a34a',light:'#37c46f',deep:'#0c5d30'},third:{main:'#1f93dd',light:'#52b3ef',deep:'#13568c'}};
const pairs=[];
for(const[k,c]of Object.entries(AL)){
  pairs.push(['#ffffff',c.deep,`${k}: white on deep (chip/partner)`,false]);
  pairs.push([c.deep,'#ffffff',`${k}: deep on white (played-by)`,false]);
  pairs.push(['#0b1430',c.light,`${k}: navy on light (dark-theme chip)`,false]);
}
const fixed=[
  ['#ffffff','#0b1430','white on navy band',false],
  ['#ffffff','#070a0e','white on dark band',false],
  ['#3a4356','#ffffff','body grey on white',false],
  ['#c2c9d4','#161b22','dark sub on dark panel',false],
  ['#ffffff','#161b22','white on dark panel',false],
  ['#5a6478','#ffffff','ppos grey on white',false],
  ['#0b1430','#f2f3f5','light: navy ink on light field',false],
  ['#41495a','#f2f3f5','light: sub grey on light field',false],
];
let fails=0;
for(const[fg,bg,label,large]of[...pairs,...fixed]){
  const r=ratio(fg,bg),need=large?3.0:4.5,ok=r>=need;
  if(!ok)fails++;
  console.log((ok?'PASS':'FAIL').padEnd(5),r.toFixed(2).padStart(5),' need',need,' ',label);
}
console.log('\n'+(fails?fails+' FAILURES':'ALL PASS'));
