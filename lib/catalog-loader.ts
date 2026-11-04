/** A single D1 batch for the live catalogue; stock is never cached between requests. */
export async function readCatalogRows(db:Pick<D1Database,'prepare'|'batch'>,seed:()=>Promise<void>){
  const read=()=>db.batch([
    db.prepare('SELECT id,data FROM products'),
    db.prepare('SELECT product_id,color,size,stock FROM inventory'),
    db.prepare("SELECT value FROM settings WHERE key='site'"),
  ]);
  let rows=await read();
  if(!rows[2].results.length){await seed();rows=await read();}
  const setting=rows[2].results[0] as {value:string}|undefined;
  if(!setting)throw new Error('Le catalogue ne peut pas être initialisé.');
  return {
    products:rows[0].results as {id:string;data:string}[],
    variants:rows[1].results as {product_id:string;color:string;size:string;stock:number}[],
    settings:setting.value,
  };
}
