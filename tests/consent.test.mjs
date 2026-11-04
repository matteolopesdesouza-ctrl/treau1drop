import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CONSENT_MAX_AGE, createConsent, parseConsent, consentFromCookie } from '../lib/consent.ts';
const now=Date.UTC(2026,9,28,12);
test('acceptation et refus ont la même durée et restent explicites',()=>{
  for(const allow of [true,false]){const c=createConsent(allow,now);assert.equal(c.analytics,allow);assert.equal(c.expiresAt-now,CONSENT_MAX_AGE*1000);assert.deepEqual(parseConsent(JSON.stringify(c),now),c);}
});
test('aucune mesure sans choix valide, notamment après expiration',()=>{
  const c=createConsent(true,now);
  for(const raw of [null,'','oops','null','[]','true',JSON.stringify({...c,analytics:'true'}),JSON.stringify({...c,version:2}),JSON.stringify({...c,expiresAt:now}),JSON.stringify({...c,savedAt:now+120000}),JSON.stringify({...c,expiresAt:now+CONSENT_MAX_AGE*1000+1})])assert.equal(parseConsent(raw,now),null);
  assert.equal(parseConsent(JSON.stringify(c),c.expiresAt),null);
});
test('le serveur lit seulement le cookie de consentement exact et respecte le refus',()=>{
  const encode=c=>encodeURIComponent(JSON.stringify(c));
  assert.equal(consentFromCookie('treau_consent_extra='+encode(createConsent(true,now)),now),null);
  assert.equal(consentFromCookie('treau_consent=%invalid',now),null);
  assert.equal(consentFromCookie('other=value; treau_consent='+encode(createConsent(false,now))+'; last=value',now)?.analytics,false);
  assert.equal(consentFromCookie('treau_consent='+encode(createConsent(true,now)),now)?.analytics,true);
});
