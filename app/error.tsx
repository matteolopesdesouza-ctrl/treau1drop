'use client';
export default function SiteError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <main className="empty-state missing"><p className="eyebrow">TREAU STUDIO</p><h1>UNE PAUSE IMPRÉVUE.</h1><p>La page n’a pas pu se charger. Votre panier reste enregistré dans ce navigateur.</p><button className="button dark" onClick={reset}>RÉESSAYER</button><a className="text-link" href="/">RETOUR À L’ACCUEIL</a></main>;
}
