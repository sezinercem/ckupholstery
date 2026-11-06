(() => {
  'use strict';
  const config = window.CK_TRACKING || {};
  const adsId = /^AW-\d+$/.test(config.googleAdsId || '') ? config.googleAdsId : '';
  const ga4Id = /^G-[A-Z0-9]+$/.test(config.ga4Id || '') ? config.ga4Id : '';
  const hasMeasurement = Boolean(adsId || ga4Id);
  let consent = 'denied';
  let loaded = false;
  window.dataLayer = window.dataLayer || [];
  const gtag = (...args) => window.dataLayer.push(args);
  // Basic consent mode: do not request Google scripts until optional measurement is accepted.
  gtag('consent', 'default', {
    ad_storage: 'denied', analytics_storage: 'denied',
    ad_user_data: 'denied', ad_personalization: 'denied'
  });
  const readChoice = () => {
    try { return localStorage.getItem('ck-measurement-consent-v1'); } catch { return null; }
  };
  function choose(value) {
    consent = value === 'granted' ? 'granted' : 'denied';
    try { localStorage.setItem('ck-measurement-consent-v1', consent); } catch { /* Still honour this visit's choice. */ }
    gtag('consent', 'update', {
      ad_storage: consent, analytics_storage: consent,
      ad_user_data: consent, ad_personalization: 'denied'
    });
    if (consent === 'granted' && hasMeasurement && !loaded) {
      loaded = true;
      gtag('js', new Date());
      if (adsId) gtag('config', adsId, { allow_ad_personalization_signals: false });
      if (ga4Id) gtag('config', ga4Id, {
        // Prevent email addresses or other arbitrary URL parameters entering analytics.
        page_location: location.origin + location.pathname,
        page_referrer: document.referrer ? new URL(document.referrer).origin : ''
      });
      const script = document.createElement('script');
      script.async = true;
      script.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(adsId || ga4Id);
      document.head.appendChild(script);
    }
  }
  function showChoices() {
    if (document.querySelector('.cookie-banner')) return;
    const box = document.createElement('section');
    box.className = 'cookie-banner';
    box.setAttribute('aria-label', 'Optional measurement cookies');
    box.innerHTML = '<p>Allow optional analytics and advertising measurement to help us understand visits and enquiries? <a href="/privacy">Privacy and cookies</a></p><button type="button" data-choice="granted">Accept optional measurement</button><button type="button" data-choice="denied">Reject optional measurement</button>';
    box.querySelectorAll('button').forEach(button => button.addEventListener('click', () => {
      choose(button.dataset.choice);
      box.remove();
    }));
    document.body.appendChild(box);
  }
  // These are action events, not proof that a telephone call or email was completed.
  function track(name) {
    if (consent !== 'granted' || !hasMeasurement) return;
    const event = name === 'lead' ? 'generate_lead' : name;
    if (ga4Id) gtag('event', event, { send_to: ga4Id, transport_type: 'beacon' });
    const label = (config.conversionLabels || {})[name];
    if (adsId && /^[A-Za-z0-9_-]+$/.test(label || '')) {
      gtag('event', 'conversion', { send_to: adsId + '/' + label, transport_type: 'beacon' });
    }
  }
  if (hasMeasurement) {
    const choice = readChoice();
    if (choice === 'granted' || choice === 'denied') choose(choice);
    else showChoices();
    const settings = document.createElement('button');
    settings.type = 'button';
    settings.className = 'cookie-settings';
    settings.textContent = 'Cookie settings';
    settings.addEventListener('click', showChoices);
    (document.querySelector('footer') || document.body).appendChild(settings);
  }
  document.addEventListener('click', event => {
    const link = event.target.closest('a[href]');
    if (!link) return;
    const href = link.getAttribute('href');
    if (href.startsWith('tel:')) track('phone_click');
    else if (href.startsWith('mailto:')) track('email_click');
    else if (link.hostname === 'wa.me') track('whatsapp_click');
  });
  document.querySelectorAll('form.contact-form').forEach(form => {
    let busy = false;
    form.addEventListener('submit', async event => {
      // Preserve the standard Formspree POST for browsers without fetch/FormData.
      if (!window.fetch || !window.FormData) return;
      event.preventDefault();
      if (busy || !form.reportValidity()) return;
      busy = true;
      const button = form.querySelector('[type="submit"]');
      const status = form.querySelector('.form-status');
      button.disabled = true;
      status.dataset.state = 'pending';
      status.textContent = 'Sending your enquiry…';
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 20000);
      try {
        const response = await fetch(form.action, {
          method: 'POST', body: new FormData(form),
          headers: { Accept: 'application/json' }, signal: controller.signal
        });
        const result = await response.json();
        if (!response.ok || result.ok !== true) throw new Error('Enquiry not confirmed');
        status.dataset.state = 'success';
        status.textContent = 'Thank you — your enquiry has been sent. We will be in touch.';
        form.reset();
        track('lead'); // Only after Formspree confirms acceptance; never on button click.
      } catch {
        status.dataset.state = 'error';
        status.textContent = 'We could not confirm your enquiry was sent. Your details are still here. Please try again, call 07944 715635 or email sales@ckupholstery.co.uk.';
      } finally {
        clearTimeout(timer);
        busy = false;
        button.disabled = false;
      }
    });
  });
})();
