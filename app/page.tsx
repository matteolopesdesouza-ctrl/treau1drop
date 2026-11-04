import Storefront from './storefront';
import { getCatalog,isAdmin } from '../lib/server';
import { getChatGPTUser } from './chatgpt-auth';
import LaunchCountdown from './launch-countdown';
import ShopShell from './shop-shell';
import { isPrelaunch } from '../lib/launch';
export const dynamic='force-dynamic';

export function generateMetadata() {
  return isPrelaunch() ? {
    title: 'TREAU — Drop le 1er décembre 2026',
    description: 'Le prochain drop TREAU arrive le 1er décembre 2026 à 00:00, heure de Lisbonne. Le compte à rebours est lancé.',
  } : {};
}

export default async function Page() {
  const now = Date.now();
  if (isPrelaunch(now)) return <LaunchCountdown serverNow={now} />;

  const [{ products, settings }, user] = await Promise.all([getCatalog(), getChatGPTUser()]);
  return <ShopShell><Storefront products={products} settings={settings} user={user ? { ...user, admin: isAdmin(user) } : null} /></ShopShell>;
}
