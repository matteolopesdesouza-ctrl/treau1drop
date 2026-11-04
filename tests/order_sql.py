"""Exercise the exact production SQL against SQLite's transaction semantics."""
import json,sqlite3,sys,pathlib
q=json.load(sys.stdin)
db=sqlite3.connect(':memory:')
db.executescript(next(pathlib.Path('drizzle').glob('0000_*.sql')).read_text())
variant=json.dumps(['p','Cobalt','M'],separators=(',',':'))
lines=json.dumps([dict(id='p',color='Cobalt',size='M',quantity=1,variantId=variant)])
db.execute('INSERT INTO products VALUES(?,?,?)',('p','test',json.dumps(dict(status='Published'))))
db.execute('INSERT INTO inventory VALUES(?,?,?,?,?)',(variant,'p','Cobalt','M',1));db.commit()
def place(id,key,coupon=None,now=150):
    params=[id,'TR-'+id,'u',key,lines,'{}',8900,890 if coupon else 0,600,8610 if coupon else 9500,coupon,now,lines]
    if coupon:params.extend([coupon,now,now])
    with db:
        changes=db.execute(q['couponInsert'] if coupon else q['insert'],params).rowcount
        db.execute(q['decrement'],(1,variant,id))
        if coupon:db.execute('UPDATE discounts SET used=used+1 WHERE code=? AND EXISTS(SELECT 1 FROM orders WHERE id=?)',(coupon,id))
    return changes
assert place('one','key-one')==1
assert place('two','key-two')==0, 'Last remaining unit was sold twice'
assert db.execute('SELECT stock FROM inventory').fetchone()[0]==0
assert place('three','key-one')==0, 'Idempotency key was accepted twice'
assert db.execute('SELECT COUNT(*) FROM orders').fetchone()[0]==1
for _ in range(2):
    with db:
        db.execute(q['restock'],(1,variant,'one'))
        db.execute(q['cancel'],('one',))
assert db.execute('SELECT stock FROM inventory').fetchone()[0]==1, 'Cancellation restored stock twice'
db.execute('UPDATE inventory SET stock=5')
db.execute('INSERT INTO discounts VALUES(?,?,?,?,?,?,?,?)',('TEST','percent',10,100,200,1,0,1));db.commit()
assert place('future','key-future','TEST',99)==0
assert place('valid','key-valid','TEST')==1
assert place('exhausted','key-exhausted','TEST')==0
assert db.execute('SELECT used FROM discounts').fetchone()[0]==1
assert db.execute('SELECT stock FROM inventory').fetchone()[0]==4
print('Stock guards, idempotency, coupon limits and cancellation passed.')
