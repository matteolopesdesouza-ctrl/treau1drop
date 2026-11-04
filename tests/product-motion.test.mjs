import { test } from 'node:test';
import assert from 'node:assert/strict';
import { craftFrame, dampStoryProgress, storyProgress, storyFrame, smoothRange, pageProgress } from '../lib/product-motion.ts';

test('une scène fixe progresse exactement entre son arrivée et sa libération', () => {
  assert.equal(storyProgress(99,100,1800,800,true),0);
  assert.equal(storyProgress(600,100,1800,800,true),.5);
  assert.equal(storyProgress(1100,100,1800,800,true),1);
  assert.equal(storyProgress(5000,100,1800,800,true),1);
  assert.ok(Number.isFinite(storyProgress(100,100,0,0,true)));
});
test('les sections normales utilisent leur passage dans la fenêtre sans bloquer le scroll', () => {
  assert.equal(storyProgress(0,800,800,800),0);
  assert.equal(storyProgress(800,800,800,800),.5);
  assert.equal(storyProgress(1600,800,800,800),1);
});
test('les caméras restent continues et finies sur téléphone et ordinateur', () => {
  for (const mobile of [true,false]) for (const kind of ['hero','detail','statement','editorial','color','breath','lookbook','mobile-preview']) {
    let previous;
    for(let i=0;i<=1000;i++) {
      const frame=storyFrame(kind,i/1000,mobile);
      for(const [key,value] of Object.entries(frame)) {
        assert.ok(Number.isFinite(value),`${kind} ${key}`);
        if(key.includes('opacity')||key.includes('first')||key.includes('second')||key.includes('third')||key.includes('word')) assert.ok(value>=0&&value<=1,`${key}: ${value}`);
        if(previous)assert.ok(Math.abs(value-previous[key])<.8,`${kind} ${key} saute`);
      }
      previous=frame;
    }
  }
});
test('la progression de page reste correcte avec une page courte et le rebond mobile', () => {
  assert.equal(pageProgress(100,500,800),0);
  assert.equal(pageProgress(-100,2000,800),0);
  assert.equal(pageProgress(600,2000,800),.5);
  assert.equal(pageProgress(1600,2000,800),1);
});
test('le zoom détail revient à la pièce entière et les interpolations restent bornées', () => {
  assert.equal(storyFrame('detail',0,false)['--detail-scale'],1);
  assert.equal(storyFrame('detail',1,false)['--detail-scale'],1);
  assert.ok(storyFrame('detail',.6,false)['--detail-scale']>2);
  assert.ok(storyFrame('detail',.6,true)['--detail-scale']>2);
  assert.equal(smoothRange(.2,.8,-5),0);
  assert.equal(smoothRange(.2,.8,5),1);
});
test('la caméra amortie garde la même vitesse à 60 et 120 Hz sans dépasser sa cible', () => {
  const run = (frames) => { let p=0; for(let i=0;i<frames;i++)p=dampStoryProgress(p,.7,500/frames); return p; };
  assert.ok(Math.abs(run(30)-run(60))<1e-10);
  assert.ok(run(30)>.69 && run(30)<.7);
  let p=1;
  for(let i=0;i<60;i++) { const next=dampStoryProgress(p,.3,16.67); assert.ok(next>=.3 && next<=p); p=next; }
  assert.equal(p,.3);
  assert.equal(dampStoryProgress(.5,.8,0),.5);
});
test('les trois pièces se déploient complètement dans le showroom', () => {
  assert.equal(storyFrame('color',0,false)['--fan-spread'],.12);
  assert.equal(storyFrame('color',1,false)['--fan-spread'],1);
  assert.equal(storyFrame('color',1,true)['--fan-rise'],0);
});

test('le lookbook passe du premier look au second sur mobile et garde les deux sur ordinateur',()=>{
 assert.equal(storyFrame('lookbook',0,true)['--look-crossfade'],0);
 assert.equal(storyFrame('lookbook',1,true)['--look-crossfade'],1);
 assert.equal(storyFrame('lookbook',0,false)['--look-crossfade'],1);
 assert.equal(storyFrame('lookbook',1,false)['--look-spread'],0);
 assert.equal(storyFrame('lookbook',1,true)['--look-title-opacity'],0);
 assert.equal(storyFrame('lookbook',1,true)['--look-next-opacity'],1);
});

test('le film passe des looks portés aux pièces et termine sur le zip sur téléphone',()=>{
 for(const mobile of [true,false]){
  const opening=storyFrame('lookbook',0,mobile),studio=storyFrame('lookbook',.7,mobile),ending=storyFrame('lookbook',1,mobile);
  assert.equal(opening['--studio-neutral'],0);assert.equal(opening['--studio-open'],0);
  assert.equal(studio['--studio-neutral'],1);assert.equal(studio['--studio-open'],1);assert.equal(studio['--studio-switch'],0);
  assert.equal(ending['--studio-open'],1);assert.equal(ending['--studio-rise'],0);assert.equal(ending['--studio-turn'],0);assert.equal(ending['--studio-scale'],1);
  assert.equal(ending['--studio-switch'],mobile?1:0);
  let previous=ending;
  for(let i=999;i>=0;i--){const current=storyFrame('lookbook',i/1000,mobile);assert.ok(current['--studio-neutral']<=previous['--studio-neutral']);assert.ok(current['--studio-open']<=previous['--studio-open']);previous=current;}
  assert.deepEqual(previous,opening);
 }
});

test('le cadrage mobile présente le hoodie avant de donner la place au t-shirt',()=>{
 const start=storyFrame('hero',0,true), black=storyFrame('hero',.35,true), white=storyFrame('hero',1,true);
 assert.equal(start['--mobile-black-focus'],0);
 assert.equal(start['--mobile-white-focus'],0);
 assert.equal(black['--mobile-black-focus'],1);
 assert.equal(black['--mobile-white-focus'],0);
 assert.equal(black['--mobile-black-caption'],1);
 assert.equal(white['--mobile-white-focus'],1);
 assert.equal(white['--mobile-black-caption'],0);
 assert.equal(white['--mobile-white-caption'],1);
});

test('les nouvelles entrées restent continues et terminent avec une photo entière et un vêtement lisible',()=>{
 for(const mobile of [true,false])for(const kind of ['product','photo'])for(const order of [0,1,2,NaN,Infinity,-3]){
  let previous;
  for(let i=0;i<=1000;i++){
   const values=craftFrame(kind,i/1000,mobile,order);
   for(const [key,value] of Object.entries(values)){
    assert.ok(Number.isFinite(value),key);
    if(previous)assert.ok(Math.abs(value-previous[key])<.8,key);
   }
   if(kind==='product')assert.ok(values['--craft-opacity']>=.3&&values['--craft-opacity']<=1);
   else assert.ok(values['--craft-reveal']>=0&&values['--craft-reveal']<=1);
   previous=values;
  }
  const end=craftFrame(kind,1,mobile,order);
  if(kind==='product'){
   assert.equal(end['--craft-rise'],0);assert.equal(end['--craft-scale'],1);assert.equal(end['--craft-tilt'],0);assert.equal(end['--craft-opacity'],1);
  }else assert.equal(end['--craft-reveal'],1);
  assert.deepEqual(craftFrame(kind,-2,mobile,order),craftFrame(kind,0,mobile,order));
  assert.deepEqual(craftFrame(kind,2,mobile,order),end);
 }
});

test('la typographie révèle la deuxième phrase avant la troisième et reste réversible',()=>{
 for(const mobile of [true,false]){
  const start=storyFrame('statement',0,mobile),middle=storyFrame('statement',.42,mobile),end=storyFrame('statement',1,mobile);
  assert.equal(start['--word-one'],1);
  assert.equal(start['--statement-second'],0);assert.equal(start['--statement-third'],0);
  assert.equal(middle['--statement-second'],1);assert.ok(middle['--statement-third']<.05);
  assert.equal(end['--statement-third'],1);assert.equal(end['--statement-scale'],1);
  let later=end;
  for(let i=999;i>=0;i--){const frame=storyFrame('statement',i/1000,mobile);assert.ok(frame['--statement-second']<=later['--statement-second']);assert.ok(frame['--statement-third']<=later['--statement-third']);later=frame;}
  assert.deepEqual(later,start);
 }
});
