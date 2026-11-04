import {test} from 'node:test';
import assert from 'node:assert/strict';
import {productPhotos} from '../lib/product-gallery.ts';

test('la couverture répétée dans les photos ne crée pas deux vues identiques',()=>{
  assert.deepEqual(productPhotos({image:'/images/hoodie.webp',images:['/images/hoodie.webp','/images/campaign.webp','/images/campaign.webp']}),['/images/hoodie.webp','/images/campaign.webp']);
});
test('les vues importées gardent leur ordre après la couverture et une photo unique reste utilisable',()=>{
  assert.deepEqual(productPhotos({image:'/media/front',images:['/media/back','/media/detail']}),['/media/front','/media/back','/media/detail']);
  assert.deepEqual(productPhotos({image:'/media/front',images:[]}),['/media/front']);
});
