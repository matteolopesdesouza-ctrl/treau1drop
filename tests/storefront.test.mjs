import { test } from 'node:test';
import assert from 'node:assert/strict';
import { addCartLine, restoreCart, restoreWishlist, availableToAdd, matchesFilters, matchesSearch, catalogFilterOptions } from '../lib/storefront-state.ts';
import { money } from '../lib/catalog.ts';
const product = {id:'p',name:'Hoodie Édition',price:8915,status:'Published',category:'HOODIES',collection:'BLEU',colors:['Cobalt','Noir'],sizes:['M','L'],variants:[{color:'Cobalt',size:'M',stock:30},{color:'Cobalt',size:'L',stock:0},{color:'Noir',size:'M',stock:0},{color:'Noir',size:'L',stock:2}]};
const item={id:'p',color:'Cobalt',size:'M',quantity:1};
test('les prix affichent les centimes sans arrondir une réduction',()=>{assert.match(money(8915),/89,15/);assert.match(money(1335),/13,35/);assert.doesNotMatch(money(8900),/,00/);});
test('le panier fusionne les ajouts et ne dépasse ni le stock ni 20 par variante',()=>{let cart=addCartLine([],product,'Cobalt','M',19);cart=addCartLine(cart,product,'Cobalt','M',1);assert.equal(cart[0].quantity,20);assert.equal(availableToAdd(product,cart,'Cobalt','M'),0);assert.deepEqual(addCartLine(cart,product,'Cobalt','M',1),cart);assert.equal(addCartLine([],product,'Noir','L',3).length,0);assert.equal(addCartLine([],product,'Noir','L',2)[0].quantity,2);for(const q of [-1,0,1.5,NaN])assert.deepEqual(addCartLine(cart,product,'Noir','L',q),cart);});
test('un ancien panier ou un stockage corrompu ne peut pas casser la page',()=>{assert.deepEqual(restoreCart(null,[product]),[]);assert.deepEqual(restoreCart([null,{}, {...item,quantity:'2'},{...item,size:'XXL'},{...item,quantity:-1}],[product]),[]);const restored=restoreCart([{...item,quantity:19},{...item,quantity:19},{...item,color:'Noir',size:'L',quantity:100}],[product]);assert.deepEqual(restored.map(i=>i.quantity),[20,2]);assert.deepEqual(restoreCart([item],[{...product,status:'Sold Out'}]),[]);assert.deepEqual(restoreWishlist([null,'p','p',42]),['p']);});
test('le filtre en stock vérifie la combinaison taille et couleur demandée',()=>{const f={category:'ALL',collection:'',size:'M',color:'Noir',max:160,inStock:true};assert.equal(matchesFilters(product,f),false);assert.equal(matchesFilters(product,{...f,size:'L'}),true);assert.equal(matchesFilters(product,{...f,inStock:false}),true);assert.equal(matchesFilters({...product,status:'Sold Out'},{...f,size:'L'}),false);});
test('la recherche tolère les accents, espaces et plusieurs mots',()=>{assert.equal(matchesSearch(product,'  edition   cobalt '),true);assert.equal(matchesSearch(product,'hoodie inconnu'),false);assert.equal(matchesSearch(product,'   '),true);});
test('la recherche comprend les noms de vêtements français et les mots avec ou sans tiret',()=>{
  assert.equal(matchesSearch(product,'sweat noir'),true);
  assert.equal(matchesSearch(product,'pull bleu'),true);
  assert.equal(matchesSearch(product,'pantalon'),false);
  const tee={...product,name:'Essential Tee',category:'T-SHIRTS',colors:['Blanc']};
  for(const query of ['tshirt blanc','t-shirt blanc','t shirt white'])assert.equal(matchesSearch(tee,query),true,query);
  const pants={...product,category:'PANTS',colors:['Noir']};
  assert.equal(matchesSearch(pants,'pantalon black'),true);
  assert.equal(matchesSearch(tee,'sweat blanc'),false);
});
test('une référence produit et une taille se retrouvent aussi dans la recherche',()=>{
  assert.equal(matchesSearch({...product,sku:'TR-001-03'},'tr 001 03'),true);
  assert.equal(matchesSearch({...product,sizes:['XXL']},'sweat XXL'),true);
  assert.equal(matchesSearch({...product,sku:'TR-001-03'},'tr 999 03'),false);
});
test('sans filtre de prix, les vêtements au-dessus de 160 euros restent visibles',()=>{
  const expensive={...product,price:21945};
  const filters={category:'ALL',collection:'',size:'',color:'',max:null,inStock:false};
  assert.equal(matchesFilters(expensive,filters),true);
  assert.equal(matchesFilters(expensive,{...filters,max:219}),false);
  assert.equal(matchesFilters(expensive,{...filters,max:220}),true);
  assert.equal(matchesFilters({...expensive,status:'Draft'},filters),false);
  assert.equal(catalogFilterOptions([expensive]).priceCeiling,220);
});
test('les filtres proposent les tailles et couleurs réellement ajoutées dans le studio',()=>{
  const custom={...product,colors:['Rouge'],sizes:['XXL','Taille unique','XS'],price:21945,variants:[{color:'Rouge',size:'XXL',stock:2}]};
  const hidden={...product,status:'Draft',colors:['Secret'],sizes:['99'],price:99900};
  const options=catalogFilterOptions([product,custom,hidden]);
  assert.deepEqual(options.sizes,['XS','M','L','XXL','Taille unique']);
  assert.deepEqual(options.colors,['Cobalt','Noir','Rouge']);
  assert.equal(options.priceCeiling,220);
  assert.equal(matchesFilters(custom,{category:'ALL',collection:'',size:'XXL',color:'Rouge',max:null,inStock:true}),true);
  assert.deepEqual(catalogFilterOptions([]),{sizes:[],colors:[],priceCeiling:160});
});
