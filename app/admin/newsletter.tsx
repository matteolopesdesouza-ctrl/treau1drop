'use client';
import { FormEvent, useEffect, useState } from 'react';
import { requestJSON } from '../../lib/request';

type Result={subscribers:{email:string;createdAt:number}[];total:number;page:number;pageSize:number};
export default function NewsletterSubscribers({revision}:{revision:unknown}){
  const [query,setQuery]=useState(''),[search,setSearch]=useState(''),[page,setPage]=useState(1),[reload,setReload]=useState(0);
  const [result,setResult]=useState<Result|null>(null),[loading,setLoading]=useState(true),[error,setError]=useState('');
  useEffect(()=>{
    let active=true;setLoading(true);setError('');
    requestJSON<Result>(`/api/admin/subscribers?page=${page}&q=${encodeURIComponent(search)}`,{cache:'no-store'})
      .then(data=>{if(active)setResult(data);})
      .catch(e=>{if(active)setError(e instanceof Error?e.message:'Impossible de charger les inscriptions.');})
      .finally(()=>{if(active)setLoading(false);});
    return()=>{active=false;};
  },[page,search,reload,revision]);
  const exportPage=()=>{if(!result?.subscribers.length)return;const cell=(value:string)=>'"'+(/^[=+@-]/.test(value)?"'"+value:value).replaceAll('"','""')+'"';const csv='\ufeffemail;date_inscription_utc\r\n'+result.subscribers.map(row=>[cell(row.email),cell(new Date(row.createdAt).toISOString())].join(';')).join('\r\n');const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));const link=document.createElement('a');link.href=url;link.download='treau-abonnes-page-'+result.page+'.csv';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
  const submit=(e:FormEvent)=>{e.preventDefault();setPage(1);setSearch(query.trim());setReload(n=>n+1);};
  return <section className="admin-card newsletter-admin" aria-busy={loading}>
    <div className="admin-card-heading"><div><h2>LES INSCRITS AUX NOUVEAUTÉS</h2><p>Adresses enregistrées depuis le formulaire des prochains drops.</p></div><button className="admin-button" disabled={loading||!!error||!result?.subscribers.length} onClick={exportPage}>Exporter cette page en CSV</button></div>
    <form className="newsletter-admin-search" onSubmit={submit}><label htmlFor="subscriber-search">Rechercher une adresse e-mail</label><div><input id="subscriber-search" type="search" maxLength={200} value={query} onChange={e=>setQuery(e.target.value)} placeholder="Rechercher un e-mail…"/><button className="admin-button" type="submit" disabled={loading}>RECHERCHER</button></div>{search&&<button type="button" className="text-link" onClick={()=>{setQuery('');setSearch('');setPage(1);}}>EFFACER LA RECHERCHE</button>}</form>
    {error?<div className="admin-error"><p role="alert">{error}</p><button className="admin-button" onClick={()=>setReload(n=>n+1)}>RÉESSAYER</button></div>:loading?<p className="newsletter-admin-status" role="status">Chargement des inscrits…</p>:<>
      <p className="newsletter-admin-status" role="status">{result?.total||0} {search?'résultat(s) pour cette recherche':'personne(s) inscrite(s)'}</p>
      <div className="table-scroll"><table className="admin-table"><thead><tr><th>ADRESSE E-MAIL</th><th>DATE D’INSCRIPTION</th></tr></thead><tbody>{result?.subscribers.map(s=><tr key={s.email}><td className="strong subscriber-email">{s.email}</td><td>{new Intl.DateTimeFormat('fr-FR',{dateStyle:'medium',timeStyle:'short',timeZone:'Europe/Lisbon'}).format(new Date(s.createdAt))}</td></tr>)}</tbody></table></div>
      {!result?.subscribers.length&&<div className="admin-empty"><p>{search?'Aucune adresse ne correspond à cette recherche.':'Aucune inscription pour le moment.'}</p></div>}
      {!!result?.total&&<nav className="newsletter-pagination" aria-label="Pages des inscrits"><button className="admin-button" disabled={page<=1} onClick={()=>setPage(n=>n-1)}>PRÉCÉDENT</button><span>Page {result.page} / {Math.ceil(result.total/result.pageSize)}</span><button className="admin-button" disabled={page*result.pageSize>=result.total} onClick={()=>setPage(n=>n+1)}>SUIVANT</button></nav>}
    </>}
    <p className="newsletter-admin-status">Les inscriptions enregistrent uniquement l’adresse e-mail, pas le nom. Cette liste est réservée aux administrateurs.</p>
  </section>;
}
