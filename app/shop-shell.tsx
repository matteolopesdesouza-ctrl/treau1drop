import type { ReactNode } from 'react';
import CookieConsentProvider from './cookie-consent';
import SiteLoader from './site-loader';

export default function ShopShell({ children }: { children: ReactNode }) {
  return <>
    <noscript><style>{'.site-loader{display:none!important}'}</style></noscript>
    <SiteLoader><CookieConsentProvider>{children}</CookieConsentProvider></SiteLoader>
  </>;
}
