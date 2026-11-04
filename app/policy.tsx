'use client';
import Link from './navigation-link';
import { ArrowUpRight } from 'lucide-react';
import { CookieSettingsButton } from './cookie-consent';

const content: Record<string, { title: string; body: string[] }> = {
  delivery: { title: 'LIVRAISON & RETOURS', body: ['TREAU est actuellement en préouverture. Les commandes passées en mode démonstration ne génèrent ni paiement ni expédition.', 'Le seuil de livraison offerte et les frais affichés servent à tester le parcours. Les destinations desservies, délais et modalités de retour seront précisés avant le lancement commercial.'] },
  size: { title: 'FIND YOUR FIT.', body: ['Nos silhouettes de concept adoptent une coupe ample et des épaules tombantes. Le guide présenté sur chaque fiche produit est indicatif.', 'Les mensurations définitives, propres à chaque pièce, seront confirmées lors de la fabrication.'] },
  privacy: { title: 'VOTRE CONFIDENTIALITÉ', body: [
    'Cette boutique de préouverture enregistre les commandes de démonstration, les coordonnées que vous saisissez et votre profil de compte pour faire fonctionner les services demandés. Aucun paiement réel n’est effectué.',
    'Votre panier et vos favoris sont enregistrés dans le stockage local de votre navigateur. La connexion sécurisée utilise votre identité ChatGPT. TREAU ne collecte aucun numéro de carte bancaire.',
    'La mesure d’audience est désactivée tant que vous ne l’avez pas acceptée. Avec votre accord, un identifiant de session permet de compter les visites et les pages consultées. Aucun traceur publicitaire ni outil de suivi entre sites n’est installé dans cette version.',
    'Vous pouvez tout accepter, tout refuser ou choisir la mesure d’audience séparément. Votre décision est conservée pendant 180 jours, qu’il s’agisse d’une acceptation ou d’un refus. Le bouton « Gérer mes cookies » permet de retirer ou modifier votre accord à tout moment. Le retrait arrête les mesures futures et supprime l’identifiant de visite de votre navigateur.',
    'La liste des prochains drops conserve votre e-mail uniquement après votre inscription volontaire. Aucun e-mail n’est envoyé automatiquement dans cette version. Le responsable de traitement, son contact et la procédure de suppression des données doivent être renseignés avant le lancement commercial.'
  ] },
  terms: { title: 'CONDITIONS DE PRÉOUVERTURE', body: ['Ce site est une boutique de concept TREAU. Les vêtements illustrés et leurs caractéristiques constituent une direction créative de démonstration.', 'Aucune vente réelle n’est conclue. Les prix, stocks et commandes permettent de tester le fonctionnement du site.', 'Les mentions légales du vendeur, les conditions de vente définitives et les informations réglementaires doivent être complétées avant commercialisation.'] }
};

export default function Policy({ page }: { page: string }) {
  const c = content[page];
  if (!c) return <section className="policy-page section-pad"><h1>INFORMATION INTROUVABLE.</h1><Link href="/policies/privacy" className="text-link">CONFIDENTIALITÉ <ArrowUpRight size={18} /></Link></section>;
  return <section className="policy-page section-pad"><p className="eyebrow">TREAU STUDIO / INFORMATIONS</p><h1>{c.title}</h1>{c.body.map((text,i)=><p key={i}>{text}</p>)}
    {page === 'privacy' && <><div className="privacy-storage-table"><table><caption>Stockage utilisé par la boutique</caption><thead><tr><th>Élément</th><th>Usage</th><th>Durée dans le navigateur</th></tr></thead><tbody><tr><td>treau_consent / treau.consent</td><td>Votre choix de confidentialité</td><td>180 jours</td></tr><tr><td>treau.cart / treau.wishlist</td><td>Panier et favoris demandés</td><td>Jusqu’à suppression du stockage du site</td></tr><tr><td>treau.visit</td><td>Mesure des visites, avec accord</td><td>Session ou retrait du consentement</td></tr></tbody></table></div><CookieSettingsButton className="text-link" /></>}
    <Link href="/shop" className="text-link">RETOUR AU SHOP <ArrowUpRight size={18} /></Link>
  </section>;
}
