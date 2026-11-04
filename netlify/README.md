# TREAU sur Netlify

Netlify publie l’écran du compte à rebours en HTML, CSS et JavaScript statiques.
Le design, les polices et les images correspondent à la dernière version de TREAU.
Le build lit la date dans `lib/launch.ts` et réutilise `app/launch-countdown.css`.

Le `netlify.toml` à la racine configure :
- base : `netlify`
- commande : `node build.mjs`
- publication : `dist` (donc `netlify/dist` depuis la racine)
- `NETLIFY_NEXT_PLUGIN_SKIP=true` pour éviter le plugin Next.js

Le sous-projet ne dépend d’aucun paquet npm. Node.js 24 suffit.
Vérification locale : `cd netlify && node --test countdown.test.mjs && node build.mjs`.

À l’échéance du 1er décembre 2026 à minuit à Lisbonne, le visiteur est redirigé vers
https://treau-studio.matteolopesdesouza.chatgpt.site/ où la boutique complète ouvre
automatiquement. Les visiteurs qui rouvrent un onglet après le drop sont aussi redirigés.

La boutique complète, son administration, D1 et R2 continuent d’utiliser leur hébergement
Cloudflare/Sites. Ce build Netlify est la page d’attente, pas un adaptateur SSR pour Vinext.
