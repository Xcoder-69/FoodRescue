/**
 * FoodRescue Navigation Router
 * Wires all screens together for a realistic app experience.
 * Include this script at the bottom of every screen HTML file.
 */

(function () {
  // ── Navigation Map ──────────────────────────────────────────────────────────
  // Maps text/icon patterns → destination file
  const NAV = {
    // Splash → Auth
    'login':                    '4_login_and_verification.html',
    'register':                 '2_role_selection.html',

    // Role selection → Registration
    'restaurant / hotel':       '1_Restaurant_Registration_Step_1.html',
    'ngo':                      '1_NGO_Registration_Step_1.html',
    'volunteer':                '6_volunteer_registration.html',

    // Registration → Login
    'sign up':                  '4_login_and_verification.html',
    'create account':           '4_login_and_verification.html',
    'already have an account':  '4_login_and_verification.html',
    'log in':                   '4_login_and_verification.html',

    // Login → Dashboards (role-aware via localStorage)
    // Login → Dashboards (role-aware via localStorage)

    // Restaurant Dashboard actions
    'donate food':              '8_create_food_donation.html',
    'post donation':            '8_create_food_donation.html',

    // Donations form submit → back to restaurant dashboard
    'post donation listing':    '7_restaurant_dashboard.html',

    // Bottom nav & sidebar – shared across dashboards
    'home':                     '_home_redirect',
    'dashboard':                '_home_redirect',
    'history':                  '_home_redirect',
    'donate':                   '8_create_food_donation.html',
    'alerts':                   '11_notifications.html',
    'notifications':            '11_notifications.html',
    'profile':                  '12_profile.html',
    'impact analytics':         '13_impact_analytics.html',
    'chat':                     '14_chat_and_coordination.html',
    'help':                     '20_help_and_support.html',
    'contact':                  '20_help_and_support.html',
    'contact us':               '20_help_and_support.html',
    'support':                  '20_help_and_support.html',
    'settings':                 '12_profile.html',

    // Admin links
    'verification management':  '15_verification_management.html',
    'donation monitoring':      '16_donation_monitoring.html',
    'user management':          '17_user_management_admin.html',
    'csr':                      '18_csr_and_reporting.html',
    'fraud':                    '19_fraud_and_reports_admin.html',
    'complaints':               '21_complaints_management.html',
    'food safety':              '22_food_safety_and_compliance.html',
    'dispute':                  '23_dispute_and_policy_center.html',
    'terms':                    '24_terms_and_conditions.html',
    'privacy':                  '25_privacy_and_guidelines.html',
    'declarations':             '26_declarations_and_consent.html',

    // Logout → splash
    'logout':                   '1_splash_screen.html',

    // Back buttons
    'back':                     '_back',
    'arrow_back':               '_back',
  };

  // ── Role → Dashboard map ────────────────────────────────────────────────────
  const ROLE_DASHBOARD = {
    restaurant: '7_restaurant_dashboard.html',
    ngo:        '10_ngo_dashboard.html',
    volunteer:  '9_volunteer_dashboard.html',
    admin:      '17_user_management_admin.html',
  };

  // Detect current role from localStorage or current filename
  function getRole() {
    const r = localStorage.getItem('fr_role');
    if (r) return r;
    const f = location.pathname.split('/').pop();
    if (f.includes('restaurant')) return 'restaurant';
    if (f.includes('ngo'))        return 'ngo';
    if (f.includes('volunteer'))  return 'volunteer';
    if (f.includes('admin'))      return 'admin';
    return 'restaurant'; // default
  }

  // Save role when user picks one on role selection screen
  function saveRoleFromCard() {
    const selected = document.querySelector('.card-selected h3');
    if (!selected) return;
    const txt = selected.textContent.toLowerCase();
    if (txt.includes('restaurant')) localStorage.setItem('fr_role', 'restaurant');
    else if (txt.includes('ngo'))   localStorage.setItem('fr_role', 'ngo');
    else if (txt.includes('volunteer')) localStorage.setItem('fr_role', 'volunteer');
  }

  // ── Resolve destination ─────────────────────────────────────────────────────
  function resolve(text) {
    const t = text.toLowerCase().trim();
    for (const [key, dest] of Object.entries(NAV)) {
      if (t.includes(key)) {
        if (dest === '_back')              return '_back';
        if (dest === '_home_redirect')     return ROLE_DASHBOARD[getRole()];
        if (dest === '_dashboard_redirect') return ROLE_DASHBOARD[getRole()];
        if (dest === '_otp_flow')          return null; // handled by existing script
        return dest;
      }
    }
    return null;
  }

  // ── Navigate with transition ────────────────────────────────────────────────
  function navigateTo(dest) {
    if (!dest) return;
    // Fade out
    document.body.style.transition = 'opacity 0.25s ease';
    document.body.style.opacity = '0';
    setTimeout(() => { window.location.href = dest; }, 250);
  }


  // ── Wire all clickable elements ────────────────────────────────────────────
  function wireClicks() {
    const currentFile = location.pathname.split('/').pop();

    document.addEventListener('click', function (e) {
      const el = e.target.closest('button, a, [onclick], header span, .cursor-pointer');
      if (!el) return;

      const text = (el.textContent || el.innerText || el.getAttribute('data-icon') || '').trim();
      const href = el.getAttribute('href');

      // Skip elements that opt-out of auto navigation
      if (el.hasAttribute('data-no-nav')) return;

      // Skip elements that already have real navigation or internal logic
      if (href && href !== '#' && !href.startsWith('javascript')) return;
      if (el.hasAttribute('onclick')) return;

      // Special: role selection → save role then navigate
      if (currentFile === '2_role_selection.html') {
        if (text.toLowerCase().includes('continue')) {
          e.preventDefault();
          e.stopPropagation();
          saveRoleFromCard();
          const sel = document.querySelector('.card-selected h3');
          if (!sel) { alert('Please select a role first!'); return; }
          const roleText = sel.textContent.toLowerCase();
          if (roleText.includes('restaurant')) navigateTo('1_Restaurant_Registration_Step_1.html');
          else if (roleText.includes('ngo'))   navigateTo('1_NGO_Registration_Step_1.html');
          else                                  navigateTo('6_volunteer_registration.html');
          return;
        }
      }



      // Special: registration forms — any submit/create → login
      if (['5_Restaurant_Registration_Step_5.html', '5_NGO_Registration_Step_5.html', '6_volunteer_registration.html'].includes(currentFile)) {
        if (text.toLowerCase().includes('register') || text.toLowerCase().includes('create') || text.toLowerCase().includes('submit') || el.type === 'submit') {
          e.preventDefault();
          navigateTo('4_login_and_verification.html');
          return;
        }
      }

      // General resolution
      const dest = resolve(text);
      if (dest === '_back') {
        e.preventDefault();
        e.stopPropagation();
        window.history.back();
      } else if (dest) {
        e.preventDefault();
        e.stopPropagation();
        navigateTo(dest);
      }
    }, true);
  }

  // ── Fade in on load ────────────────────────────────────────────────────────
  function fadeIn() {
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.3s ease';
    window.addEventListener('load', () => {
      setTimeout(() => { document.body.style.opacity = '1'; }, 50);
    });
  }

  // ── Form Data Persistence ──────────────────────────────────────────────────
  function initFormPersistence() {
    const currentFile = location.pathname.split('/').pop() || 'index.html';
    const lowerFile = currentFile.toLowerCase();
    // Only apply to registration and login pages to avoid side effects on dashboard
    if (!lowerFile.includes('registration') && !lowerFile.includes('login')) return;

    const storageKey = 'fr_form_data_' + currentFile;
    // Exclude passwords, OTPs, and hidden fields
    const inputs = document.querySelectorAll('input[type="text"]:not(.otp-input):not(.otp-box), input[type="email"], input[type="tel"], textarea, select');
    
    // Restore values
    const savedData = JSON.parse(sessionStorage.getItem(storageKey) || '{}');
    inputs.forEach(input => {
        if (input.id && savedData[input.id] !== undefined) {
            input.value = savedData[input.id];
            // Trigger input event to update any dynamic UI (like strength meters or validation)
            input.dispatchEvent(new Event('input', { bubbles: true }));
            if (input.tagName === 'SELECT') {
                input.dispatchEvent(new Event('change', { bubbles: true }));
            }
        }
        
        // Save on input/change
        const saveEvent = input.tagName === 'SELECT' ? 'change' : 'input';
        input.addEventListener(saveEvent, () => {
            const currentData = JSON.parse(sessionStorage.getItem(storageKey) || '{}');
            if (input.id) {
                currentData[input.id] = input.value;
                sessionStorage.setItem(storageKey, JSON.stringify(currentData));
            }
        });
    });
  }

  // ── Init ───────────────────────────────────────────────────────────────────
  fadeIn();
  document.addEventListener('DOMContentLoaded', () => {
    wireClicks();
    initFormPersistence();
  });

})();
