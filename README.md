# TREAU — Move Different.

Boutique de concept streetwear : direction éditoriale noir, blanc et bleu cobalt, campagne photographique dès l’arrivée, scènes pilotées par le scroll, boutique filtrable, choix rapide des tailles, favoris, panier persistant et studio d’administration.

## État de cette version

Le site est en **préouverture**. Les commandes de démonstration sont enregistrées et décrémentent le stock de façon transactionnelle. Elles ne déclenchent ni paiement réel ni expédition. Aucun chiffre de vente ou témoignage fictif n’est présenté comme réel.

Les photos et caractéristiques du catalogue constituent une direction de marque de concept. Les mentions légales, la fabrication, les mesures et les délais doivent être validés avant la commercialisation. Un prestataire de paiement et ses webhooks doivent être ajoutés pour accepter des ventes réelles.

## Démarrage local

Node.js 24+, pnpm et Python 3 (pour un test SQL) sont recommandés.

```bash
corepack pnpm install
pnpm build
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_overjoyed_molecule_man.sql
pnpm dev
```

La commande de développement affiche son URL. Les clones propres utilisent le profil portable et la connexion ChatGPT de développement fournie par le starter. La base locale est distincte de la base du site publié.

Créez un fichier `.dev.vars` local, non versionné, avec `ADMIN_EMAILS` : liste d’e-mails administrateurs, séparés par des virgules. En mode portable, l’identité de développement est `seedy@sites.test`. N’utilisez cette valeur que pour le développement. Sur le site publié, configurez l’adresse de votre véritable compte ChatGPT dans les variables d’environnement du site.

## Pages

- `/` : campagne, sélection de trois pièces, manifeste, détails du hoodie, collections, rotation de produits et lookbook. Les galeries sont tactiles sur mobile ; les séquences épinglées sont réservées aux écrans adaptés.
- `/shop` et `/shop?collection=…` : catégories, tailles, couleurs, prix et disponibilité.
- `/product/:slug` : couleurs, tailles, quantité, guide et produits associés.
- `/wishlist`, `/account`, `/checkout`, `/new-drop`, `/collections`, `/about`.
- `/admin` : dashboard, commandes, produits, collections, inventaire, clients, promotions, homepage, média, statistiques et réglages.

Le compte client et l’administration utilisent l’identité ChatGPT du site. La récupération du mot de passe appartient au fournisseur de connexion. Le panier et les favoris sont locaux au navigateur. Le bouton « Choisir ma taille » ouvre une sélection de couleur, taille et quantité sans quitter la collection ; les quantités déjà au panier sont déduites du stock disponible. Les profils, commandes, médias et réglages sont persistants côté serveur.

## Administration

Les routes admin contrôlent l’identité et `ADMIN_EMAILS` côté serveur à chaque opération. La liste n’est jamais envoyée dans le JavaScript client. Aucun mot de passe par défaut n’est inclus. Les statistiques proviennent des visites et des commandes enregistrées ; les commandes démo sont identifiées et exclues du revenu réel.

Les codes promo ont des dates UTC, un plafond d’utilisation et une réduction calculée sur les prix du serveur. L’enregistrement d’une commande vérifie le stock et l’utilisation du code dans une transaction D1. Une clé d’idempotence évite les doubles commandes ; l’annulation remet le stock une seule fois. Les images importées sont limitées aux formats raster acceptés et à 8 Mo.

Les tables sont déclarées dans `db/schema.ts` et les migrations dans `drizzle/`. Aucun changement de schéma n’est fait à la volée dans les requêtes. La première utilisation initialise seulement le catalogue de concept.

## Vérification

```bash
pnpm typecheck
pnpm test
pnpm build
```

Les tests couvrent les montants calculés sur le serveur, la fusion des lignes, les variantes invalides, les quantités, les codes expirés ou épuisés, les transactions SQL de stock, l’idempotence et la restitution unique du stock. Le SQL de production est testé contre SQLite. La navigation, la sélection d’une taille et le panier ont aussi été vérifiés dans l’aperçu navigateur.

## Architecture

React 19 + TypeScript, Vinext/Vite, Worker Cloudflare, D1 pour les données, R2 pour les images importées. L’authentification hébergée est fournie par Sites ; un hébergement différent nécessite un adaptateur d’identité sécurisé. N’acceptez jamais les en-têtes d’identité fournis directement par des visiteurs sur un autre hébergement.

`.openai/hosting.json` contient les liaisons de déploiement. `.env*`, `.dev.vars*`, les dépendances, les builds et l’état local sont ignorés par Git. Vous pouvez créer votre dépôt GitHub puis pousser ce dossier sans ajouter de secret.

Les visuels originaux et leurs prompts sont décrits dans `ASSETS.md`. Le site respecte `prefers-reduced-motion` et adapte ses scènes au mobile.

## Scrollcraft et performances

L’ouverture utilise une seule image de produit sur une composition bleu et noir. Sur téléphone, les scènes ne retiennent pas le défilement et un pilote léger anime seulement les scènes visibles, avec des dimensions mises en cache. Les galeries se parcourent nativement au doigt. Sur ordinateur, les apparitions se jouent une seule fois, sans flou ; les scènes actives utilisent des positions mises en cache pour éviter les mesures de toutes les sections à chaque image. Les préférences de réduction des mouvements sont respectées.

## Vérifications des interactions

Le panier restaure uniquement des variantes valides et limite les quantités au stock et à 20 pièces par variante. Les tailles et couleurs sont filtrées ensemble. Les prix et réductions conservent leurs centimes. Seuls les codes appliqués au panier courant sont envoyés à la commande ; les demandes et enregistrements ont un délai limite et un état de chargement. Les fenêtres gèrent le focus, Échap, le blocage de l’arrière-plan et le retour à la position de lecture.

Les tests navigateur ont couvert recherche, filtres, tri, favoris, guide des tailles, ajout rapide, panier, commande de démonstration, profil, newsletter, produits, stocks, commandes, codes promo, collections, import de média et réglages du studio. Les essais avec identité administrative et leurs données ont été confinés à l’aperçu local ; aucune identité de test n’est livrée. Sur mobile, le menu permet l’accès au studio pour un compte autorisé.

Le scrollcraft supplémentaire utilise des apparitions courtes et des timelines CSS natives lorsque disponibles. Les zones cliquables restent fixes et les préférences de réduction des mouvements sont respectées. Le visuel ESSENTIALS utilise le tee-shirt, y compris lorsque les collections sont réordonnées.

Le téléphone possède sa propre chorégraphie : mouvement et rotation du hoodie, révélation du manifeste, typographie dans deux directions et parallaxe du lookbook. Un seul frame est planifié par défilement ; les boutons restent fixes et aucun effet ne bloque le geste.
