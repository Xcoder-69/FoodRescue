/**
 * ╔══════════════════════════════════════════╗
 * ║        FOODRESCUE — TEST MODE            ║
 * ║  Bypass login & jump to any dashboard   ║
 * ╚══════════════════════════════════════════╝
 *
 * Include this script in any HTML page to enable test mode.
 * It injects a fake token + user so requireAuth() passes.
 */

(function () {
  'use strict';

  // ── Fake JWT (non-expiring, just needs to exist in localStorage) ──────────────
  const FAKE_TOKEN = 'testmode.eyJhbGciOiJub25lIiwidHlwZjoiSldUIn0.eyJ1aWQiOiJ0ZXN0LXVzZXItMDAxIiwicm9sZSI6InRlc3QiLCJ0ZXN0TW9kZSI6dHJ1ZX0.testmode_signature';

  const TEST_USERS = {
    restaurant: {
      uid: 'test-restaurant-001',
      email: 'testrestaurant@foodrescue.dev',
      role: 'restaurant',
      name: 'Test Restaurant',
      restaurantName: 'Demo Kitchen',
      status: 'APPROVED',
      isEmailVerified: true,
    },
    ngo: {
      uid: 'test-ngo-001',
      email: 'testngo@foodrescue.dev',
      role: 'ngo',
      name: 'Test NGO',
      organizationName: 'Demo NGO',
      status: 'APPROVED',
      isEmailVerified: true,
    },
    volunteer: {
      uid: 'test-volunteer-001',
      email: 'testvolunteer@foodrescue.dev',
      role: 'volunteer',
      name: 'Test Volunteer',
      status: 'APPROVED',
      isEmailVerified: true,
    },
    admin: {
      uid: 'test-admin-001',
      email: 'testadmin@foodrescue.dev',
      role: 'admin',
      name: 'Test Admin',
      status: 'APPROVED',
      isEmailVerified: true,
    },
  };

  const DASHBOARD_URLS = {
    restaurant: '7_restaurant_dashboard.html',
    ngo:        '10_ngo_dashboard.html',
    volunteer:  '9_volunteer_dashboard.html',
    admin:      '31_mission_control_dashboard.html',
  };

  // ── Activate test mode for a role ─────────────────────────────────────────────
  function activateTestMode(role) {
    const user = TEST_USERS[role];
    if (!user) return;

    localStorage.setItem('foodRescueToken', FAKE_TOKEN);
    localStorage.setItem('foodRescueRefreshToken', FAKE_TOKEN);
    localStorage.setItem('foodRescueUser', JSON.stringify(user));
    localStorage.setItem('fr_role', role);
    localStorage.setItem('fr_test_mode', 'true');

    console.log(`[TEST MODE] Activated as ${role.toUpperCase()}`);
    window.location.href = DASHBOARD_URLS[role];
  }

  // ── Exit test mode ─────────────────────────────────────────────────────────────
  function exitTestMode() {
    localStorage.removeItem('foodRescueToken');
    localStorage.removeItem('foodRescueRefreshToken');
    localStorage.removeItem('foodRescueUser');
    localStorage.removeItem('fr_role');
    localStorage.removeItem('fr_test_mode');
    console.log('[TEST MODE] Exited');
    window.location.href = '1_splash_screen.html';
  }

  // ── Switch to a different role without leaving test mode ──────────────────────
  function switchRole(role) {
    activateTestMode(role);
  }

  // ── Check if test mode is currently on ───────────────────────────────────────
  function isTestMode() {
    return localStorage.getItem('fr_test_mode') === 'true';
  }

  // ── Build the floating Test Mode Panel ───────────────────────────────────────
  function buildPanel() {
    // Inject styles
    const style = document.createElement('style');
    style.textContent = `
      #fr-testmode-panel {
        position: fixed;
        bottom: 20px;
        right: 20px;
        z-index: 99999;
        font-family: 'Inter', 'Segoe UI', sans-serif;
      }

      #fr-testmode-toggle {
        width: 54px;
        height: 54px;
        border-radius: 50%;
        background: linear-gradient(135deg, #ff6b35, #f7c59f);
        border: none;
        cursor: pointer;
        box-shadow: 0 4px 20px rgba(255,107,53,0.45);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 22px;
        transition: transform 0.2s, box-shadow 0.2s;
        color: white;
        margin-left: auto;
      }
      #fr-testmode-toggle:hover {
        transform: scale(1.12);
        box-shadow: 0 6px 28px rgba(255,107,53,0.6);
      }

      #fr-testmode-card {
        background: #1a1a2e;
        border: 1px solid rgba(255,107,53,0.3);
        border-radius: 16px;
        padding: 18px;
        width: 260px;
        box-shadow: 0 12px 40px rgba(0,0,0,0.5);
        margin-bottom: 10px;
        display: none;
        animation: fr-slide-up 0.25s ease;
      }
      #fr-testmode-card.open { display: block; }

      @keyframes fr-slide-up {
        from { opacity: 0; transform: translateY(12px); }
        to   { opacity: 1; transform: translateY(0); }
      }

      #fr-testmode-card h4 {
        color: #ff6b35;
        margin: 0 0 4px 0;
        font-size: 13px;
        font-weight: 700;
        letter-spacing: 0.06em;
        text-transform: uppercase;
      }

      #fr-testmode-card p {
        color: rgba(255,255,255,0.5);
        font-size: 11px;
        margin: 0 0 14px 0;
      }

      .fr-role-btn {
        display: flex;
        align-items: center;
        gap: 10px;
        width: 100%;
        padding: 10px 14px;
        margin-bottom: 7px;
        border-radius: 10px;
        border: 1px solid rgba(255,255,255,0.08);
        background: rgba(255,255,255,0.05);
        color: #fff;
        font-size: 13px;
        font-weight: 500;
        cursor: pointer;
        transition: background 0.18s, border-color 0.18s, transform 0.15s;
        text-align: left;
      }
      .fr-role-btn:hover {
        background: rgba(255,107,53,0.18);
        border-color: rgba(255,107,53,0.4);
        transform: translateX(3px);
      }
      .fr-role-btn.active {
        background: rgba(255,107,53,0.25);
        border-color: rgba(255,107,53,0.7);
      }
      .fr-role-btn .fr-role-icon { font-size: 18px; }
      .fr-role-btn .fr-role-label { flex: 1; }
      .fr-role-btn .fr-active-dot {
        width: 7px; height: 7px;
        border-radius: 50%;
        background: #4caf50;
        display: none;
      }
      .fr-role-btn.active .fr-active-dot { display: block; }

      #fr-exit-btn {
        width: 100%;
        padding: 9px;
        margin-top: 8px;
        border-radius: 10px;
        background: rgba(255,50,50,0.15);
        border: 1px solid rgba(255,80,80,0.3);
        color: #ff6b6b;
        font-size: 12px;
        font-weight: 600;
        cursor: pointer;
        transition: background 0.18s;
        letter-spacing: 0.04em;
      }
      #fr-exit-btn:hover { background: rgba(255,50,50,0.3); }

      #fr-testmode-badge {
        position: fixed;
        top: 0; left: 0; right: 0;
        background: linear-gradient(90deg, #ff6b35, #f7a35c);
        color: #fff;
        text-align: center;
        font-size: 11.5px;
        font-weight: 600;
        padding: 5px;
        z-index: 99998;
        letter-spacing: 0.05em;
        box-shadow: 0 2px 8px rgba(255,107,53,0.35);
      }
    `;
    document.head.appendChild(style);

    // Top banner
    const badge = document.createElement('div');
    badge.id = 'fr-testmode-badge';
    badge.innerHTML = '🧪 TEST MODE — No login required · Data is simulated';
    document.body.prepend(badge);

    // Floating panel wrapper
    const panel = document.createElement('div');
    panel.id = 'fr-testmode-panel';

    const currentRole = localStorage.getItem('fr_role') || '';

    const roles = [
      { key: 'restaurant', icon: '🍽️',  label: 'Restaurant Dashboard' },
      { key: 'ngo',        icon: '🏢',  label: 'NGO Dashboard' },
      { key: 'volunteer',  icon: '🙋',  label: 'Volunteer Dashboard' },
      { key: 'admin',      icon: '🛡️', label: 'Admin Dashboard' },
    ];

    const roleButtons = roles.map(r => `
      <button class="fr-role-btn ${r.key === currentRole ? 'active' : ''}"
              data-role="${r.key}"
              onclick="window.FRTestMode.switchRole('${r.key}')">
        <span class="fr-role-icon">${r.icon}</span>
        <span class="fr-role-label">${r.label}</span>
        <span class="fr-active-dot"></span>
      </button>
    `).join('');

    panel.innerHTML = `
      <div id="fr-testmode-card">
        <h4>🧪 Test Mode</h4>
        <p>Jump to any dashboard instantly</p>
        ${roleButtons}
        <button id="fr-exit-btn" onclick="window.FRTestMode.exit()">✕ Exit Test Mode</button>
      </div>
      <button id="fr-testmode-toggle" title="Test Mode" onclick="window.FRTestMode.toggle()">🧪</button>
    `;

    document.body.appendChild(panel);
  }

  // ── Toggle panel open/close ───────────────────────────────────────────────────
  let panelOpen = false;
  function togglePanel() {
    const card = document.getElementById('fr-testmode-card');
    if (!card) return;
    panelOpen = !panelOpen;
    card.classList.toggle('open', panelOpen);
  }

  // ── Expose public API ─────────────────────────────────────────────────────────
  window.FRTestMode = {
    activate:    activateTestMode,
    exit:        exitTestMode,
    switchRole:  switchRole,
    isTestMode:  isTestMode,
    toggle:      togglePanel,
  };

  // ── Auto-init: build panel when DOM is ready ──────────────────────────────────
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', buildPanel);
  } else {
    buildPanel();
  }

})();
