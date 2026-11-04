import {test} from 'node:test';
import assert from 'node:assert/strict';
import {filterAdminProducts,filterAdminOrders,includesSearch,statusLabel} from '../lib/admin-studio.ts';
import {seedProducts} from '../lib/catalog.ts';
test('la recherche admin combine le statut et les détails du vêtement sans modifier le catalogue',()=>{
 const pieces=seedProducts.map((p,i)=>({...p,name:i===0?'Édition limitée':p.name,status:i===0?'Draft':p.status}));
 assert.equal(filterAdminProducts(pieces,'edition','Draft').length,1);
 assert.equal(filterAdminProducts(pieces,'edition','Published').length,0);
 assert.equal(filterAdminProducts(pieces,'TR-001-03','all')[0].slug,'midnight-hoodie');
 assert.equal(filterAdminProducts(pieces,'noir','Published').length,2);
 assert.equal(pieces[0].status,'Draft');
});
test('le filtre à traiter exclut les commandes livrées et annulées et recherche les statuts français',()=>{
 const orders=['Pending','Paid','Preparing','Shipped','Delivered','Cancelled'].map((status,i)=>({number:'T-'+i,status,shipping:{name:'Élodie',email:'elodie@example.test'}}));
 assert.deepEqual(filterAdminOrders(orders,'','action').map(o=>o.status),['Pending','Paid','Preparing']);
 assert.equal(filterAdminOrders(orders,'expediee','all')[0].status,'Shipped');
 assert.equal(filterAdminOrders(orders,'elodie','Cancelled').length,1);
 assert.equal(filterAdminOrders(orders,'inconnu','all').length,0);
 assert.equal(statusLabel('Published'),'Publié');
 assert.ok(includesSearch('  CREME ','Crème'));
});
