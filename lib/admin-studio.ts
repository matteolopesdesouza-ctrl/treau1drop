import type { Product } from './catalog';
export const adminLabels:Record<string,string>={Dashboard:'Vue d’ensemble',Orders:'Commandes',Products:'Vêtements',Collections:'Collections',Inventory:'Stocks',Customers:'Clients',Newsletter:'Abonnés e-mail',Discounts:'Réductions',Homepage:'Page d’accueil',Media:'Photos & médias',Analytics:'Statistiques',Settings:'Réglages'};
export const statusLabel=(status:string)=>({Published:'Publié',Draft:'Brouillon','Sold Out':'Épuisé',Pending:'À traiter',Paid:'Payée',Preparing:'En préparation',Shipped:'Expédiée',Delivered:'Livrée',Cancelled:'Annulée',paid:'Payé',pending:'En attente','Low stock':'Stock faible'} as Record<string,string>)[status]||status;
export const normalizeSearch=(value:string)=>value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
export const includesSearch=(query:string,...values:string[])=>normalizeSearch(values.join(' ')).includes(normalizeSearch(query));
export function filterAdminProducts(products:Product[],query:string,status:string){return products.filter(p=>(status==='all'||p.status===status)&&includesSearch(query,p.name,p.sku,p.collection,...p.colors));}
export function filterAdminOrders<T extends {number:string;shipping:{name:string;email:string};status:string}>(orders:T[],query:string,status:string){return orders.filter(o=>(status==='all'||(status==='action'?['Pending','Paid','Preparing'].includes(o.status):o.status===status))&&includesSearch(query,o.number,o.shipping.name,o.shipping.email,statusLabel(o.status),o.status));}
export const adminDate=(timestamp:number,withTime=false)=>new Intl.DateTimeFormat('fr-FR',{dateStyle:'medium',...(withTime?{timeStyle:'short' as const}:{}),timeZone:'Europe/Lisbon'}).format(new Date(timestamp));
export const studioMedia=[
 {id:'drop-pullover',name:'Drop 002 · Hoodie à liserés (face)',url:'/images/drop-002/pullover-face.webp'},
 {id:'drop-back',name:'Drop 002 · Hoodie à liserés (dos)',url:'/images/drop-002/pullover-dos.webp'},
 {id:'drop-zip',name:'Drop 002 · Hoodie zippé',url:'/images/drop-002/zip-face.webp'},
 {id:'drop-look',name:'Drop 002 · Ensemble porté',url:'/images/drop-002/look-ensemble.webp'},
 {id:'drop-zip-look',name:'Drop 002 · Zip porté',url:'/images/drop-002/look-zip.webp'},
 {id:'builtin-night',name:'Midnight · After Hours',url:'/images/campaign-night.webp'},
 {id:'builtin-campaign',name:'Campagne TREAU 001',url:'/images/campaign.webp'},
 {id:'builtin-blue',name:'Cobalt · Concrete Study',url:'/images/campaign-blue.webp'},
 {id:'builtin-hoodie',name:'Hoodie signature',url:'/images/hoodie.webp'},
 {id:'builtin-tee',name:'Essential tee',url:'/images/tee.webp'}
];
