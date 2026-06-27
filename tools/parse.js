const fs=require('fs');
const META={algeria:['Algeria','dz'],argentina:['Argentina','ar'],australia:['Australia','au'],austria:['Austria','at'],belgium:['Belgium','be'],'bosnia-herzegovina':['Bosnia & Herzegovina','ba'],brazil:['Brazil','br'],'cabo-verde':['Cabo Verde','cv'],canada:['Canada','ca'],colombia:['Colombia','co'],'congo-dr':['DR Congo','cd'],'cote-d-ivoire':["Cote d'Ivoire",'ci'],croatia:['Croatia','hr'],curacao:['Curacao','cw'],czechia:['Czechia','cz'],ecuador:['Ecuador','ec'],egypt:['Egypt','eg'],england:['England','gb-eng'],france:['France','fr'],germany:['Germany','de'],ghana:['Ghana','gh'],haiti:['Haiti','ht'],'ir-iran':['Iran','ir'],iraq:['Iraq','iq'],japan:['Japan','jp'],jordan:['Jordan','jo'],'korea-republic':['Korea Republic','kr'],mexico:['Mexico','mx'],morocco:['Morocco','ma'],netherlands:['Netherlands','nl'],'new-zealand':['New Zealand','nz'],norway:['Norway','no'],panama:['Panama','pa'],paraguay:['Paraguay','py'],portugal:['Portugal','pt'],qatar:['Qatar','qa'],'saudi-arabia':['Saudi Arabia','sa'],scotland:['Scotland','gb-sct'],senegal:['Senegal','sn'],'south-africa':['South Africa','za'],spain:['Spain','es'],sweden:['Sweden','se'],switzerland:['Switzerland','ch'],tunisia:['Tunisia','tn'],turkiye:['Turkiye','tr'],uruguay:['Uruguay','uy'],usa:['USA','us'],uzbekistan:['Uzbekistan','uz']};
const ent=s=>s.replace(/&amp;/g,'&').replace(/&#x27;|&#039;|&apos;/g,"'").replace(/&[a-z]+;/g,' ').replace(/\s+/g,' ').trim();
const out={};
let total=0;
for(const slug of Object.keys(META)){
  const f='dom/'+slug+'.html';
  if(!fs.existsSync(f)){console.error('MISSING',slug);continue;}
  const h=fs.readFileSync(f,'utf8');
  const segs=h.split('player-badge-card_badgeCard__Xapqw');
  const players=[];
  for(let i=1;i<segs.length;i++){
    const s=segs[i];
    const img=(s.match(/https:\/\/digitalhub\.fifa\.com\/transform\/[a-f0-9-]+\/[^"?\s]+_\d+/)||[])[0];
    const ni=s.indexOf('playerName__');
    if(ni<0||!img) continue;
    const nameM=s.slice(ni).match(/>([^<>]{2,40})<\/span>/);
    const pi=s.indexOf('playerPosition__');
    const posM=pi<0?null:s.slice(pi).match(/>([A-Za-z ]{3,20})<\/span>/);
    const name=nameM?ent(nameM[1]):'';
    const pos=posM?ent(posM[1]):'';
    if(!name) continue;
    players.push({n:name,p:pos,img});
  }
  const seen=new Set(); const uniq=[];
  for(const p of players){if(seen.has(p.n))continue;seen.add(p.n);uniq.push(p);}
  out[slug]={name:META[slug][0],flag:META[slug][1],players:uniq};
  total+=uniq.length;
  console.log(slug.padEnd(20), String(uniq.length).padStart(2), '|', uniq.slice(0,2).map(p=>p.n+' ('+p.p+')').join(', '));
}
fs.writeFileSync('players.json',JSON.stringify(out));
console.log('--- TOTAL players:',total,'teams:',Object.keys(out).length,'bytes:',fs.statSync('players.json').size);
