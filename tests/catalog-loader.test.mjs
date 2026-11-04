import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readCatalogRows} from '../lib/catalog-loader.ts';
const snapshot=(stock=7)=>[{results:[{id:'01',data:'{"name":"TREAU"}'}]},{results:[{product_id:'01',color:'Noir',size:'M',stock}]},{results:[{value:'{"demo":true}'}]}];
test('le catalogue utilise un seul aller-retour et relit le stock à chaque requête',async()=>{
 let calls=0,stock=7,seeds=0;
 const db={prepare:sql=>sql,batch:async queries=>{assert.equal(queries.length,3);calls++;return snapshot(stock);}};
 const first=await readCatalogRows(db,async()=>{seeds++;});
 stock=2;const second=await readCatalogRows(db,async()=>{seeds++;});
 assert.equal(calls,2);assert.equal(seeds,0);assert.equal(first.variants[0].stock,7);assert.equal(second.variants[0].stock,2);
});
test('une base vide est initialisée une fois puis relue, sans masquer les erreurs',async()=>{
 let calls=0,seeds=0;
 const db={prepare:sql=>sql,batch:async()=>++calls===1?[{results:[]},{results:[]},{results:[]}]:snapshot()};
 await readCatalogRows(db,async()=>{seeds++;});assert.equal(calls,2);assert.equal(seeds,1);
 await assert.rejects(readCatalogRows({prepare:sql=>sql,batch:async()=>{throw new Error('DB unavailable');}},async()=>{throw new Error('must not seed');}),/DB unavailable/);
});
