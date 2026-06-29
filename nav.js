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
        goBack();
      } else if (dest) {
        e.preventDefault();
        e.stopPropagation();
        navigateTo(dest);
      }
    }, true);
  }

  // ── Deterministic Back Navigation ──────────────────────────────────────────
  // Maps each page to its logical previous page so back always works,
  // even when opened directly (no browser history).
  const BACK_MAP = {
    // Splash / Role
    '2_role_selection.html':                    '1_splash_screen.html',

    // Restaurant registration flow
    '1_Restaurant_Registration_Step_1.html':    '2_role_selection.html',
    '2_Restaurant_Registration_Step_2.html':    '1_Restaurant_Registration_Step_1.html',
    '3_Restaurant_Registration_Step_3.html':    '2_Restaurant_Registration_Step_2.html',
    '4_Restaurant_Registration_Step_4.html':    '3_Restaurant_Registration_Step_3.html',
    '5_Restaurant_Registration_Step_5.html':    '4_Restaurant_Registration_Step_4.html',
    '6_Registration_Success_Status.html':       '1_splash_screen.html',

    // NGO registration flow
    '1_NGO_Registration_Step_1.html':           '2_role_selection.html',
    '2_NGO_Registration_Step_2.html':           '1_NGO_Registration_Step_1.html',
    '3_NGO_Registration_Step_3.html':           '2_NGO_Registration_Step_2.html',
    '4_NGO_Registration_Step_4.html':           '3_NGO_Registration_Step_3.html',
    '5_NGO_Registration_Step_5.html':           '4_NGO_Registration_Step_4.html',
    '6_NGO_Registration_Success.html':          '1_splash_screen.html',

    // Volunteer registration
    '6_volunteer_registration.html':            '2_role_selection.html',

    // Auth
    '4_login_and_verification.html':            '1_splash_screen.html',
    '28_2fa_verification.html':                 '4_login_and_verification.html',
    '29_secret_security_key.html':              '28_2fa_verification.html',

    // Restaurant dashboard pages
    '7_restaurant_dashboard.html':              '4_login_and_verification.html',
    '8_create_food_donation.html':              '7_restaurant_dashboard.html',
    '11_notifications.html':                   '7_restaurant_dashboard.html',
    '12_profile.html':                          '7_restaurant_dashboard.html',
    '14_chat_and_coordination.html':            '7_restaurant_dashboard.html',

    // NGO dashboard pages
    '10_ngo_dashboard.html':                   '4_login_and_verification.html',

    // Volunteer dashboard
    '9_volunteer_dashboard.html':              '4_login_and_verification.html',

    // Admin pages
    '27_admin_login_command_center.html':       '4_login_and_verification.html',
    '30_command_center_gateway.html':           '27_admin_login_command_center.html',
    '31_mission_control_dashboard.html':        '30_command_center_gateway.html',
    '32_security_operations_center.html':       '31_mission_control_dashboard.html',
    '33_fraud_intelligence_center.html':        '31_mission_control_dashboard.html',
    '34_immutable_audit_ledger.html':           '31_mission_control_dashboard.html',
    '35_session_device_management.html':        '32_security_operations_center.html',
    '36_account_recovery_system.html':          '31_mission_control_dashboard.html',
    '37_security_vector_scan.html':             '32_security_operations_center.html',
    '38_security_alert_access_blocked.html':    '31_mission_control_dashboard.html',
    '15_verification_management.html':          '31_mission_control_dashboard.html',
    '16_donation_monitoring.html':              '31_mission_control_dashboard.html',
    '17_user_management_admin.html':            '31_mission_control_dashboard.html',
    '18_csr_and_reporting.html':               '31_mission_control_dashboard.html',
    '19_fraud_and_reports_admin.html':          '31_mission_control_dashboard.html',
    '21_complaints_management.html':            '31_mission_control_dashboard.html',
    '22_food_safety_and_compliance.html':       '31_mission_control_dashboard.html',

    // Shared pages
    '13_impact_analytics.html':                '7_restaurant_dashboard.html',
    '20_help_and_support.html':                '7_restaurant_dashboard.html',
    '23_dispute_and_policy_center.html':       '7_restaurant_dashboard.html',
    '24_terms_and_conditions.html':            '7_restaurant_dashboard.html',
    '25_privacy_and_guidelines.html':          '7_restaurant_dashboard.html',
    '26_declarations_and_consent.html':        '7_restaurant_dashboard.html',
  };

  function goBack() {
    const currentFile = location.pathname.split('/').pop() || 'index.html';
    const prev = BACK_MAP[currentFile];
    if (prev) {
      navigateTo(prev);
    } else if (window.history.length > 1) {
      window.history.back();
    } else {
      navigateTo('1_splash_screen.html'); // ultimate fallback
    }
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

  // ── OTP Auto-advance & Auto-verify ────────────────────────────────────────
  function initOTPInputs() {
    const otpInputs = Array.from(document.querySelectorAll('.otp-input'));
    if (!otpInputs.length) return;

    otpInputs.forEach((input, idx) => {
      // Allow only digits
      input.setAttribute('inputmode', 'numeric');
      input.setAttribute('pattern', '[0-9]*');

      input.addEventListener('input', (e) => {
        // Strip non-digits and keep only first char
        input.value = input.value.replace(/\D/g, '').slice(0, 1);

        if (input.value) {
          // Move to next box
          if (idx < otpInputs.length - 1) {
            otpInputs[idx + 1].focus();
          } else {
            // Last box filled — auto-trigger verify
            input.blur();
            // Give the DOM a tick to update before calling verify
            setTimeout(() => {
              if (typeof verifyOTP === 'function') {
                verifyOTP();
              } else {
                // Fallback: click the verify button if it exists
                const verifyBtn = document.getElementById('verifyOtpBtn')
                  || document.querySelector('button[onclick*="verifyOTP"]');
                if (verifyBtn) verifyBtn.click();
              }
            }, 80);
          }
        }
      });

      // Backspace: clear & go to previous box
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Backspace' && !input.value && idx > 0) {
          otpInputs[idx - 1].focus();
          otpInputs[idx - 1].value = '';
        }
      });

      // Handle paste: spread digits across boxes
      input.addEventListener('paste', (e) => {
        e.preventDefault();
        const pasted = (e.clipboardData || window.clipboardData)
          .getData('text').replace(/\D/g, '').slice(0, otpInputs.length);
        pasted.split('').forEach((ch, i) => {
          if (otpInputs[idx + i]) otpInputs[idx + i].value = ch;
        });
        const nextEmpty = otpInputs.find(inp => !inp.value);
        if (nextEmpty) {
          nextEmpty.focus();
        } else {
          // All filled — auto verify
          setTimeout(() => {
            if (typeof verifyOTP === 'function') {
              verifyOTP();
            } else {
              const verifyBtn = document.getElementById('verifyOtpBtn')
                || document.querySelector('button[onclick*="verifyOTP"]');
              if (verifyBtn) verifyBtn.click();
            }
          }, 80);
        }
      });
    });
  }

  // ── Init ───────────────────────────────────────────────────────────────────
  fadeIn();
  document.addEventListener('DOMContentLoaded', () => {
    wireClicks();
    initFormPersistence();
    initOTPInputs();
  });

  // Also run after dynamic sections (e.g. OTP section shown via JS)
  // by exposing it globally so pages can call it after revealing the OTP UI
  window.initOTPInputs = initOTPInputs;

})();

