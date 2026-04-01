/**
 * sunny-biz Cookie Banner
 * DSGVO-konform · Einwilligung erforderlich für optionale Cookies
 * Einbinden: <script src="/cookie-banner.js"></script> am Ende jeder Seite
 */

(function () {
  'use strict';

  const CONSENT_KEY   = 'sb_cookie_consent';
  const CONSENT_DAYS  = 365;

  // ── Hilfsfunktionen ────────────────────────────────────────
  function getCookie(name) {
    const match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
    return match ? decodeURIComponent(match[1]) : null;
  }

  function setCookie(name, value, days) {
    const d = new Date();
    d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = name + '=' + encodeURIComponent(value) +
      '; expires=' + d.toUTCString() +
      '; path=/; SameSite=Lax; Secure';
  }

  function deleteCookie(name) {
    document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax';
  }

  function getConsent() {
    try {
      const raw = getCookie(CONSENT_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function saveConsent(analytics) {
    const consent = {
      necessary: true,
      analytics: analytics,
      timestamp: new Date().toISOString()
    };
    setCookie(CONSENT_KEY, JSON.stringify(consent), CONSENT_DAYS);
    return consent;
  }

  // ── Optionale Dienste aktivieren ──────────────────────────
  function applyConsent(consent) {
    if (consent && consent.analytics) {
      loadGoogleFonts();
    }
  }

  function loadGoogleFonts() {
    // Nur laden wenn noch nicht vorhanden
    if (document.querySelector('link[data-sb-font]')) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.setAttribute('data-sb-font', '1');
    // Beide Font-Stacks für DE und EN Seiten
    link.href = 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=DM+Sans:wght@300;400;500&family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Outfit:wght@300;400;500;600&display=swap';
    document.head.appendChild(link);
  }

  // ── Banner HTML & CSS ──────────────────────────────────────
  function injectStyles() {
    if (document.getElementById('sb-cookie-styles')) return;
    const style = document.createElement('style');
    style.id = 'sb-cookie-styles';
    style.textContent = `
      #sb-cookie-banner {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        z-index: 99999;
        background: #1a1008;
        border-top: 2px solid #d4a843;
        padding: 1.25rem 2rem;
        display: flex;
        align-items: center;
        gap: 1.5rem;
        flex-wrap: wrap;
        justify-content: space-between;
        box-shadow: 0 -8px 40px rgba(0,0,0,0.4);
        font-family: 'DM Sans', 'Outfit', sans-serif;
        transform: translateY(100%);
        transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
      }
      #sb-cookie-banner.sb-visible {
        transform: translateY(0);
      }
      #sb-cookie-banner .sb-text {
        flex: 1;
        min-width: 260px;
      }
      #sb-cookie-banner .sb-text strong {
        display: block;
        color: #d4a843;
        font-size: 0.9rem;
        font-weight: 600;
        letter-spacing: 0.04em;
        margin-bottom: 0.3rem;
      }
      #sb-cookie-banner .sb-text p {
        color: rgba(250,246,240,0.65);
        font-size: 0.82rem;
        line-height: 1.5;
        margin: 0;
        font-weight: 300;
      }
      #sb-cookie-banner .sb-text a {
        color: rgba(250,246,240,0.5);
        font-size: 0.78rem;
        text-decoration: underline;
      }
      #sb-cookie-banner .sb-text a:hover {
        color: #d4a843;
      }
      #sb-cookie-banner .sb-actions {
        display: flex;
        gap: 0.75rem;
        align-items: center;
        flex-shrink: 0;
        flex-wrap: wrap;
      }
      .sb-btn {
        padding: 0.6rem 1.25rem;
        border-radius: 3px;
        font-family: inherit;
        font-size: 0.85rem;
        font-weight: 600;
        cursor: pointer;
        border: none;
        transition: background 0.2s, transform 0.15s;
        white-space: nowrap;
        letter-spacing: 0.02em;
      }
      .sb-btn:hover { transform: translateY(-1px); }
      .sb-btn-accept {
        background: #c4622d;
        color: #fff;
      }
      .sb-btn-accept:hover { background: #a84e22; }
      .sb-btn-necessary {
        background: transparent;
        color: rgba(250,246,240,0.6);
        border: 1px solid rgba(250,246,240,0.2);
      }
      .sb-btn-necessary:hover {
        background: rgba(250,246,240,0.06);
        color: rgba(250,246,240,0.85);
      }
      .sb-btn-settings {
        background: transparent;
        color: rgba(250,246,240,0.4);
        font-size: 0.78rem;
        font-weight: 400;
        padding: 0.4rem 0.6rem;
        text-decoration: underline;
      }
      .sb-btn-settings:hover { color: rgba(250,246,240,0.7); }

      /* Detail Modal */
      #sb-cookie-modal {
        display: none;
        position: fixed;
        inset: 0;
        z-index: 100000;
        background: rgba(0,0,0,0.7);
        align-items: center;
        justify-content: center;
        padding: 1rem;
        backdrop-filter: blur(4px);
      }
      #sb-cookie-modal.sb-open {
        display: flex;
      }
      #sb-cookie-modal .sb-modal-inner {
        background: #1a1008;
        border: 1px solid rgba(212,168,67,0.3);
        border-radius: 8px;
        max-width: 520px;
        width: 100%;
        padding: 2rem;
        max-height: 90vh;
        overflow-y: auto;
      }
      #sb-cookie-modal h2 {
        font-family: 'Playfair Display', 'Cormorant Garamond', serif;
        color: #d4a843;
        font-size: 1.4rem;
        margin-bottom: 0.75rem;
      }
      #sb-cookie-modal p {
        color: rgba(250,246,240,0.6);
        font-size: 0.85rem;
        line-height: 1.6;
        margin-bottom: 1.5rem;
      }
      .sb-cookie-group {
        background: rgba(255,255,255,0.04);
        border: 1px solid rgba(255,255,255,0.08);
        border-radius: 6px;
        padding: 1rem 1.25rem;
        margin-bottom: 0.75rem;
      }
      .sb-cookie-group-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.4rem;
      }
      .sb-cookie-group-header strong {
        color: rgba(250,246,240,0.9);
        font-size: 0.9rem;
      }
      .sb-cookie-group p {
        color: rgba(250,246,240,0.5);
        font-size: 0.8rem;
        margin: 0;
      }
      /* Toggle Switch */
      .sb-toggle {
        position: relative;
        width: 40px;
        height: 22px;
        flex-shrink: 0;
      }
      .sb-toggle input {
        opacity: 0;
        width: 0;
        height: 0;
        position: absolute;
      }
      .sb-toggle-track {
        position: absolute;
        inset: 0;
        background: rgba(255,255,255,0.15);
        border-radius: 100px;
        cursor: pointer;
        transition: background 0.2s;
      }
      .sb-toggle input:checked + .sb-toggle-track {
        background: #c4622d;
      }
      .sb-toggle input:disabled + .sb-toggle-track {
        background: rgba(212,168,67,0.4);
        cursor: not-allowed;
      }
      .sb-toggle-track::before {
        content: '';
        position: absolute;
        width: 16px;
        height: 16px;
        left: 3px;
        top: 3px;
        background: #fff;
        border-radius: 50%;
        transition: transform 0.2s;
      }
      .sb-toggle input:checked + .sb-toggle-track::before {
        transform: translateX(18px);
      }
      .sb-modal-actions {
        display: flex;
        gap: 0.75rem;
        margin-top: 1.5rem;
        flex-wrap: wrap;
      }
      .sb-modal-actions .sb-btn {
        flex: 1;
        text-align: center;
        min-width: 120px;
      }

      @media (max-width: 600px) {
        #sb-cookie-banner {
          flex-direction: column;
          align-items: flex-start;
          gap: 1rem;
          padding: 1.25rem 1.25rem 1.5rem;
        }
        #sb-cookie-banner .sb-actions {
          width: 100%;
          flex-direction: column;
        }
        .sb-btn { width: 100%; text-align: center; }
      }
    `;
    document.head.appendChild(style);
  }

  function createBanner() {
    const banner = document.createElement('div');
    banner.id = 'sb-cookie-banner';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-label', 'Cookie-Einstellungen');
    banner.innerHTML = `
      <div class="sb-text">
        <strong>🍪 Cookie-Einstellungen</strong>
        <p>
          Diese Website verwendet Cookies. Notwendige Cookies sind immer aktiv.
          Optionale Cookies (Google Fonts, Affiliate-Tracking) nur mit deiner Einwilligung.
        </p>
        <a href="/datenschutz.html">Mehr erfahren</a>
      </div>
      <div class="sb-actions">
        <button class="sb-btn sb-btn-accept" id="sb-accept-all">Alle akzeptieren</button>
        <button class="sb-btn sb-btn-necessary" id="sb-accept-necessary">Nur notwendige</button>
        <button class="sb-btn sb-btn-settings" id="sb-open-settings">Einstellungen</button>
      </div>
    `;
    document.body.appendChild(banner);
    setTimeout(() => banner.classList.add('sb-visible'), 100);
    return banner;
  }

  function createModal() {
    const modal = document.createElement('div');
    modal.id = 'sb-cookie-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-label', 'Detaillierte Cookie-Einstellungen');
    modal.innerHTML = `
      <div class="sb-modal-inner">
        <h2>Cookie-Einstellungen</h2>
        <p>
          Wähle, welche Cookies du zulassen möchtest. Deine Auswahl wird für
          365 Tage gespeichert und kann jederzeit geändert werden.
        </p>

        <div class="sb-cookie-group">
          <div class="sb-cookie-group-header">
            <strong>Notwendige Cookies</strong>
            <label class="sb-toggle">
              <input type="checkbox" checked disabled />
              <span class="sb-toggle-track"></span>
            </label>
          </div>
          <p>Speichert deine Cookie-Einwilligung. Immer aktiv, keine Einwilligung erforderlich.</p>
        </div>

        <div class="sb-cookie-group">
          <div class="sb-cookie-group-header">
            <strong>Google Fonts</strong>
            <label class="sb-toggle">
              <input type="checkbox" id="sb-toggle-fonts" />
              <span class="sb-toggle-track"></span>
            </label>
          </div>
          <p>
            Schriftarten von Google LLC. Beim Laden wird deine IP-Adresse an Google-Server
            in den USA übertragen. Ohne Einwilligung werden System-Fallback-Schriften verwendet.
          </p>
        </div>

        <div class="sb-cookie-group">
          <div class="sb-cookie-group-header">
            <strong>Affiliate-Tracking</strong>
            <label class="sb-toggle">
              <input type="checkbox" id="sb-toggle-affiliate" />
              <span class="sb-toggle-track"></span>
            </label>
          </div>
          <p>
            Tracking-Cookies von Digistore24 und ClickBank, die beim Klick auf Affiliate-Links
            gesetzt werden. Dienen der Provisionszuordnung. Laufzeit: 180 Tage.
          </p>
        </div>

        <div class="sb-modal-actions">
          <button class="sb-btn sb-btn-accept" id="sb-modal-save">Auswahl speichern</button>
          <button class="sb-btn sb-btn-necessary" id="sb-modal-cancel">Abbrechen</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    return modal;
  }

  // ── Banner-Logik ───────────────────────────────────────────
  function hideBanner(banner) {
    banner.classList.remove('sb-visible');
    setTimeout(() => {
      if (banner.parentNode) banner.parentNode.removeChild(banner);
    }, 400);
  }

  function init() {
    injectStyles();

    const existing = getConsent();
    if (existing) {
      applyConsent(existing);
      return; // Banner nicht erneut zeigen
    }

    const banner = createBanner();
    const modal  = createModal();

    // Alle akzeptieren
    document.getElementById('sb-accept-all').addEventListener('click', function () {
      const consent = saveConsent(true);
      applyConsent(consent);
      hideBanner(banner);
    });

    // Nur notwendige
    document.getElementById('sb-accept-necessary').addEventListener('click', function () {
      const consent = saveConsent(false);
      applyConsent(consent);
      hideBanner(banner);
    });

    // Einstellungen öffnen
    document.getElementById('sb-open-settings').addEventListener('click', function () {
      modal.classList.add('sb-open');
    });

    // Modal: Auswahl speichern
    document.getElementById('sb-modal-save').addEventListener('click', function () {
      const analyticsChecked = document.getElementById('sb-toggle-fonts').checked ||
                               document.getElementById('sb-toggle-affiliate').checked;
      const consent = saveConsent(analyticsChecked);
      applyConsent(consent);
      modal.classList.remove('sb-open');
      hideBanner(banner);
    });

    // Modal: Abbrechen
    document.getElementById('sb-modal-cancel').addEventListener('click', function () {
      modal.classList.remove('sb-open');
    });

    // Modal: Klick auf Backdrop schließt
    modal.addEventListener('click', function (e) {
      if (e.target === modal) modal.classList.remove('sb-open');
    });

    // ESC-Taste schließt Modal
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') modal.classList.remove('sb-open');
    });
  }

  // ── Globale Funktion zum Einstellungen-Reset ───────────────
  // Aufruf: window.sbResetCookies() um Banner erneut anzuzeigen
  window.sbResetCookies = function () {
    deleteCookie(CONSENT_KEY);
    location.reload();
  };

  // ── Start ──────────────────────────────────────────────────
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
