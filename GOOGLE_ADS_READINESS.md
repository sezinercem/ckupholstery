# CK Upholstery — Google Ads readiness

Audited 6 November 2026. GitHub: sezinercem/ckupholstery. Vercel project: ckupholstery (prj_Qv28awfCaL3U7z0VW599D8IzBSw6).

## Findings and changes

- Live homepage, services, contact, about, blog and three article URLs returned 200 with an AdsBot user agent. An unknown URL correctly returned 404. These checks do not reproduce every Google location or crawler.
- HTTPs apex redirects to www. The /contact-us redirect preserved a test gclid parameter. Use https://www.ckupholstery.co.uk/ and its actual page paths in Ads, sitelinks and tracking templates.
- Existing telephone links consistently use +447944715635; visible number is 07944 715635. Email is sales@ckupholstery.co.uk. The number and mailbox were not called or delivery-tested.
- Mobile CSS hid the footer, including contact details. Restored the contact block on small screens.
- No Google tag, GA4, GTM container or Ads conversion IDs were present. Added a shared, disabled-until-configured measurement integration. No account IDs were invented.
- Both forms use Formspree endpoint movkqzzb. Added accessible field labels, consistent phone field names, autocomplete, clear pending/success/failure messages and duplicate-submit protection. Failed submissions retain entered details. A lead conversion is eligible only after a successful JSON response with ok=true. Without JavaScript, native form POST remains available.
- Added consent-gated Google tags, optional measurement accept/reject controls and a settings button (shown when IDs are configured). No Google script loads before acceptance. Custom events contain no form values. GA4 page locations exclude query strings and fragments.
- Added a privacy notice linked from footers and forms. Business owner should confirm it accurately describes actual provider arrangements and retention practices.
- Root-relative internal links and assets avoid path-resolution errors; canonicals and business URLs now match the live www host.
- Added robots.txt, sitemap.xml and a helpful 404 page. A sitemap is useful for discovery; its prior absence alone did not prevent Ads from running.

## Required Google account configuration

1. In public/js/tracking-config.js, enter the verified AW- ID and/or G- ID. Add exact conversion labels from the owning Ads account. Public IDs are not secrets. Never enter private credentials.
2. Set a successfully submitted enquiry as a primary lead conversion, generally counting One per ad interaction. Do not also import the same GA4 lead as a second primary conversion. Use either the direct Ads conversion or the GA4 import for bidding.
3. Keep phone_click, email_click and whatsapp_click secondary unless there is a deliberate reason to optimise for these weaker signals. They indicate a click, not an answered call, delivered email or qualified lead. Configure actual call reporting/duration thresholds separately for call conversions.
4. Enable auto-tagging. Verify gclid, gbraid, wbraid and UTMs survive the exact ad/tracking-template URL and any redirects. Do not put personal information in URLs. This implementation does not copy click IDs into the enquiry message or persist them separately.
5. Link GA4 and Ads if importing GA4 key events. Validate tags using Tag Assistant under accept, reject and changed-consent scenarios. Check conversion diagnostics after a real eligible ad visit. Tests without an ad interaction cannot prove attribution.
6. Check the exact disapproval text, policy status, billing, advertiser verification, phone verification, campaign status, schedule, budget, bids, locations, exclusions, keywords, negative keywords and ad assets. Website changes cannot establish these account settings.
7. Use custom-domain URLs for ads. Current Vercel SSO protects deployment domains but excludes custom domains. Do not use a protected vercel.app preview as the final ad URL.
8. In Formspree, verify ownership, recipient mailbox, allowed origins, spam filtering and submission quota; complete an authorised test enquiry and confirm inbox delivery. An accepted API response does not prove mailbox delivery. No test enquiry was sent during this audit.
9. Confirm business phone service and voicemail, mailbox delivery, address and all ad claims. Inspect mobile tap targets, menus, keyboard operation and page speed with real devices. External image providers remain dependencies.
10. Match landing-page service and location copy to each ad. Use services/contact pages for relevant traffic. Measure lead quality and cost per qualified enquiry, not just click-through rate.

## Verification

Run `node tests/site-check.mjs`, `node --check public/js/main.js` and `git diff --check`.
The regression check validates local asset/link targets, form success/failure, no false conversions, duplicate prevention, consent gating and forms without configured tracking. It mocks the provider and does not send data to Formspree.
