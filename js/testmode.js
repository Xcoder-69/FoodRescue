/**
 * ╔══════════════════════════════════════════╗
 * ║        FOODRESCUE — TEST MODE            ║
 * ║  Bypass login & jump to any dashboard   ║
 * ╚══════════════════════════════════════════╝
 *
 * Include this script in any HTML page to enable test mode.
 * It injects a fake token + user so requireAuth() passes.
 * Bottom-right 🧪 icon opens a panel with Test Mode / Real Mode tabs.
 * Top banner removed.
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

  // ── Exit test mode → go to real login ─────────────────────────────────────────
  function exitTestMode() {
    localStorage.removeItem('foodRescueToken');
    localStorage.removeItem('foodRescueRefreshToken');
    localStorage.removeItem('foodRescueUser');
    localStorage.removeItem('fr_role');
    localStorage.removeItem('fr_test_mode');
    console.log('[TEST MODE] Exited — switching to Real Mode');
    window.location.href = '4_login_and_verification.html';
  }

  // ── Switch to a different role without leaving test mode ──────────────────────
  function switchRole(role) {
    activateTestMode(role);
  }

  // ── Check if test mode is currently on ───────────────────────────────────────
  function isTestMode() {
    return localStorage.getItem('fr_test_mode') === 'true';
  }

  // ── Build the floating Test Mode Panel (NO top banner) ─────────────────────
  function buildPanel() {
    const style = document.createElement('style');
    style.textContent = `
      #fr-testmode-panel {
        position: fixed;
        bottom: 20px;
        right: 20px;
        z-index: 99999;
        font-family: 'Inter', 'Segoe UI', sans-serif;
      }

      /* Toggle FAB */
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

      /* Pop-up card */
      #fr-testmode-card {
        background: #1a1a2e;
        border: 1px solid rgba(255,107,53,0.3);
        border-radius: 16px;
        padding: 18px;
        width: 270px;
        box-shadow: 0 12px 40px rgba(0,0,0,0.5);
        margin-bottom: 10px;
        display: none;
        animation: fr-slide-up 0.25s ease;
        overflow: hidden;
      }
      #fr-testmode-card.open { display: block; }

      @keyframes fr-slide-up {
        from { opacity: 0; transform: translateY(12px); }
        to   { opacity: 1; transform: translateY(0); }
      }

      /* Mode tabs */
      #fr-mode-tabs {
        display: flex;
        gap: 6px;
        margin-bottom: 14px;
      }
      .fr-mode-tab {
        flex: 1;
        padding: 8px 6px;
        border-radius: 9px;
        border: 1px solid rgba(255,255,255,0.12);
        background: rgba(255,255,255,0.05);
        color: rgba(255,255,255,0.55);
        font-size: 12px;
        font-weight: 600;
        cursor: pointer;
        text-align: center;
        letter-spacing: 0.04em;
        transition: background 0.18s, border-color 0.18s, color 0.18s;
      }
      .fr-mode-tab.active-test {
        background: rgba(255,107,53,0.25);
        border-color: rgba(255,107,53,0.7);
        color: #ff9d6b;
      }
      .fr-mode-tab.active-real {
        background: rgba(76,175,80,0.22);
        border-color: rgba(76,175,80,0.6);
        color: #81c784;
      }
      .fr-mode-tab:not(.active-test):not(.active-real):hover {
        background: rgba(255,255,255,0.1);
        color: #fff;
      }

      /* Section title / sub */
      .fr-card-title {
        color: #ff6b35;
        margin: 0 0 2px 0;
        font-size: 13px;
        font-weight: 700;
        letter-spacing: 0.06em;
        text-transform: uppercase;
      }
      .fr-card-sub {
        color: rgba(255,255,255,0.45);
        font-size: 11px;
        margin: 0 0 12px 0;
      }

      /* Test section */
      #fr-test-section { display: none; }
      #fr-test-section.visible { display: block; }

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

      /* Real mode section */
      #fr-real-section { display: none; }
      #fr-real-section.visible { display: block; }
      #fr-real-section p {
        color: rgba(255,255,255,0.55);
        font-size: 12px;
        margin: 0 0 12px 0;
        line-height: 1.5;
      }
      #fr-real-login-btn {
        width: 100%;
        padding: 10px;
        border-radius: 10px;
        background: rgba(76,175,80,0.2);
        border: 1px solid rgba(76,175,80,0.5);
        color: #81c784;
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
        transition: background 0.18s;
        letter-spacing: 0.03em;
      }
      #fr-real-login-btn:hover { background: rgba(76,175,80,0.35); }
    `;
    document.head.appendChild(style);

    const startInTestMode = isTestMode();
    const currentRole     = localStorage.getItem('fr_role') || '';

    // Floating panel wrapper
    const panel = document.createElement('div');
    panel.id = 'fr-testmode-panel';

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

        <!-- Mode switcher tabs -->
        <div id="fr-mode-tabs">
          <button class="fr-mode-tab ${startInTestMode ? 'active-test' : ''}"
                  id="fr-tab-test"
                  onclick="window.FRTestMode.showSection('test')">🧪 Test Mode</button>
          <button class="fr-mode-tab ${!startInTestMode ? 'active-real' : ''}"
                  id="fr-tab-real"
                  onclick="window.FRTestMode.showSection('real')">🌐 Real Mode</button>
        </div>

        <!-- Test Mode section -->
        <div id="fr-test-section" class="${startInTestMode ? 'visible' : ''}">
          <p class="fr-card-title">Test Mode</p>
          <p class="fr-card-sub">Jump to any dashboard · Data is simulated</p>
          ${roleButtons}
        </div>

        <!-- Real Mode section -->
        <div id="fr-real-section" class="${!startInTestMode ? 'visible' : ''}">
          <p class="fr-card-title" style="color:#81c784;">Real Mode</p>
          <p>Connect to the live backend.<br>You will be redirected to the login page.</p>
          <button id="fr-real-login-btn" onclick="window.FRTestMode.exit()">→ Go to Login</button>
        </div>

      </div>
      <button id="fr-testmode-toggle" title="Test / Real Mode" onclick="window.FRTestMode.toggle()">🧪</button>
    `;

    document.body.appendChild(panel);
  }

  // ── Show a section (test | real) and sync tab styles ─────────────────────────
  function showSection(mode) {
    const testSection = document.getElementById('fr-test-section');
    const realSection = document.getElementById('fr-real-section');
    const tabTest     = document.getElementById('fr-tab-test');
    const tabReal     = document.getElementById('fr-tab-real');
    if (!testSection || !realSection) return;

    if (mode === 'test') {
      testSection.classList.add('visible');
      realSection.classList.remove('visible');
      tabTest.classList.add('active-test');
      tabTest.classList.remove('active-real');
      tabReal.classList.remove('active-real', 'active-test');
    } else {
      realSection.classList.add('visible');
      testSection.classList.remove('visible');
      tabReal.classList.add('active-real');
      tabReal.classList.remove('active-test');
      tabTest.classList.remove('active-test', 'active-real');
    }
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
    showSection: showSection,
  };

  // ── Auto-init: build panel when DOM is ready ──────────────────────────────────
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', buildPanel);
  } else {
    buildPanel();
  }

})();
