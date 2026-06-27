// Assembles card-maker.html from src/card-maker.src.html + assets/. Run: node build.js
const fs=require('fs');
const path=require('path');
const SRC=fs.existsSync('src/card-maker.src.html')?'src/card-maker.src.html':'card-maker.src.html';
const A=fs.existsSync('assets')?'assets':'.';
const F=fs.existsSync('assets/fonts')?'assets/fonts':'.';
const L=fs.existsSync('assets/logos')?'assets/logos':'logos';
const pick=(...names)=>{for(const n of names){const p1=path.join(F,n),p2=n;if(fs.existsSync(p1))return p1;if(fs.existsSync(p2))return p2;}throw new Error('missing font '+names[0]);};
const b64=f=>fs.readFileSync(f).toString('base64');
const png=f=>'data:image/png;base64,'+b64(f);

// fonts: FWC2026 Normal (400/900) + FIFA Sans (400/500), plus fallback face library
const faces=[
  ["FWC2026",400,pick('FWC2026-NormalRegular.77c3c249.ttf','FWC2026-NormalRegular.ttf')],
  ["FWC2026",900,pick('FWC2026-NormalBlack.2bd896c8.ttf','FWC2026-NormalBlack.ttf')],
  ["FWC2026 Cond",500,pick('FWC2026-UltraCondensedMedium.4da29b9d.ttf','FWC2026-UltraCondensedMedium.ttf')],
  ["FWC2026 Cond",700,pick('FWC2026-UltraCondensedBold.0e7149b5.ttf','FWC2026-UltraCondensedBold.ttf')],
  ["FIFA Sans",400,pick('FIFA Sans-normal-400-100.ttf')],
  ["FIFA Sans",500,pick('FIFA Sans Medium-normal-500-100.ttf')]
];
let realfonts="";
for(const [fam,wt,file] of faces)
  realfonts+=`@font-face{font-family:'${fam}';font-style:normal;font-weight:${wt};font-display:swap;src:url(data:font/ttf;base64,${b64(file)}) format("truetype");}\n`;
const fallback=fs.existsSync(path.join(A,'fontface.css'))?fs.readFileSync(path.join(A,'fontface.css'),'utf8'):(fs.existsSync('fontface.css')?fs.readFileSync('fontface.css','utf8'):'');
const FONTS=fallback+"\n"+realfonts;

// tight content bounding boxes (computed in-browser via getBBox) so wide wordmarks
// like Visa do not shrink inside simple-icons' square 24x24 canvas.
const VB={adidas:[0,4.47,24,15.07],cocacola:[0,8.24,24,7.53],hyundai:[0,5.84,24,12.32],
  kia:[0,9.18,24,5.65],lenovo:[0,8,24,8.01],qatarairways:[0,1.63,24,20.75],visa:[0,8.12,24,7.75]};
const logoNames=Object.keys(VB);
const LOGOS={};
for(const n of logoNames){const p=path.join(L,n+'.svg');if(!fs.existsSync(p))continue;
  const [x,y,w,hh]=VB[n];
  LOGOS[n]=fs.readFileSync(p,'utf8').replace(/<title>.*?<\/title>/,'').replace(/\n/g,'')
    .replace(/viewBox="0 0 24 24"/, `viewBox="${x} ${y-0.4} ${w} ${hh+0.8}"`);}

const findAsset=(...names)=>{for(const n of names){const p=path.join(A,n);if(fs.existsSync(p))return p;if(fs.existsSync(n))return n;}throw new Error('missing asset '+names[0]);};

// real Font Awesome solid icons (ball + timing), kept as clean <svg> strings
const ICONS={};
for(const n of ['futbol','moon','sun','bolt']){
  const s=fs.readFileSync(path.join(A,'icons',n+'.svg'),'utf8');
  const vb=(s.match(/viewBox="([^"]+)"/)||[])[1];
  const d=(s.match(/ d="([^"]+)"/)||[])[1];
  ICONS[n]=`<svg viewBox="${vb}" fill="currentColor"><path d="${d}"/></svg>`;
}

let h=fs.readFileSync(SRC,'utf8');
h=h.replace('/*__FONTS__*/',FONTS);
h=h.replace('__EMBLEM__',png(findAsset('emblem_wc26.png')));
h=h.replace('__FIFAWORD__',png(findAsset('fifa_white.png')));
h=h.replace('__LOGOS__',JSON.stringify(LOGOS));
h=h.replace('__ICONS__',JSON.stringify(ICONS));
h=h.split('__BG_TOWN__').join(png(findAsset('bg_town.png')));
h=h.split('__BG_MAFIA__').join(png(findAsset('bg_mafia.png')));
h=h.split('__BG_THIRD__').join(png(findAsset('bg_third.png')));
h=h.replace('__PLAYERS_JSON__',fs.readFileSync(findAsset('players.json'),'utf8'));

const left=['/*__FONTS__*/','__EMBLEM__','__FIFAWORD__','__LOGOS__','__ICONS__','__BG_TOWN__','__BG_MAFIA__','__BG_THIRD__','__PLAYERS_JSON__'].filter(t=>h.includes(t));
fs.writeFileSync('index.html',h);
console.log('built index.html', Math.round(h.length/1024)+'kb', 'tokens left:', left.length?left.join(','):'none');
