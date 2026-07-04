/**
 * FoodRescue — Global Navigation & Page Wiring
 * Connects all 40 screens with proper flow
 */

// ─── Navigation Map ────────────────────────────────────────────────────────────
const PAGES = {
  splash:              '1_splash_screen.html',
  roleSelection:       '2_role_selection.html',
  restaurantReg:       '3_restaurant_registration.html',
  login:               '4_login_and_verification.html',
  ngoReg:              '5_ngo_registration.html',
  volunteerReg:        '6_volunteer_registration.html',
  restaurantDashboard: '7_restaurant_dashboard.html',
  createDonation:      '8_create_food_donation.html',
  volunteerDashboard:  '9_volunteer_dashboard.html',
  ngoDashboard:        '10_ngo_dashboard.html',
  notifications:       '11_notifications.html',
  'verification management':  '15_verification_management.html',
  profile:             '12_profile.html',
  analytics:           '13_impact_analytics.html',
  chat:                '14_chat_and_coordination.html',
  help:                '20_help_and_support.html',
  complaints:          '21_complaints_management.html',
  adminLogin:          '27_admin_login_command_center.html',
  adminDashboard:      '31_mission_control_dashboard.html',
};

// ─── Get current user role from localStorage ──────────────────────────────────
function getUserRole() {
  return localStorage.getItem('fr_role') || null;
}

// ─── Smooth page navigate ─────────────────────────────────────────────────────
function navigateTo(page) {
  document.body.style.transition = 'opacity 0.25s ease';
  document.body.style.opacity = '0';
  setTimeout(() => { window.location.href = page; }, 250);
}

// ─── Redirect to role dashboard ───────────────────────────────────────────────
function goToDashboard() {
  const role = getUserRole();
  const map = {
    restaurant: PAGES.restaurantDashboard,
    ngo:        PAGES.ngoDashboard,
    volunteer:  PAGES.volunteerDashboard,
    admin:      PAGES.adminDashboard,
  };
  navigateTo(map[role] || PAGES.login);
}

// ─── Check if logged in (test mode bypasses real auth) ───────────────────────
function isLoggedIn() {
  // Test mode: fake token counts as logged in
  if (localStorage.getItem('fr_test_mode') === 'true') return true;
  return !!localStorage.getItem('foodRescueToken');
}

// ─── Require auth guard ───────────────────────────────────────────────────────
function requireAuth() {
  if (!isLoggedIn()) {
    navigateTo(PAGES.login);
    return false;
  }
  return true;
}

// ─── Wire splash screen ───────────────────────────────────────────────────────
function wireSplash() {
  // Removed auto-redirect to allow users to click manually.
  const autoTimer = null;

  // Login button
  const allBtns  = document.querySelectorAll('button');

  allBtns.forEach(btn => {
    const text = btn.textContent.trim().toLowerCase();
    if (text.includes('sign in') || text.includes('log in') || text.includes('login')) {
      btn.addEventListener('click', () => { clearTimeout(autoTimer); navigateTo(PAGES.login); });
    }
    if (text.includes('register') || text.includes('get started') || text.includes('join') || text.includes('begin')) {
      btn.addEventListener('click', () => { clearTimeout(autoTimer); navigateTo(PAGES.roleSelection); });
    }
    // Test Mode quick-access button on splash
    if (text.includes('test mode') || text.includes('demo')) {
      btn.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); if (window.FRTestMode) window.FRTestMode.activate('restaurant'); });
    }
  });

  // Clicking anywhere on splash body proceeds
  document.body.addEventListener('click', (e) => {
    if (e.target.tagName !== 'BUTTON') {
      clearTimeout(autoTimer);
      if (isLoggedIn()) goToDashboard();
      else navigateTo(PAGES.roleSelection);
    }
  }, { once: true });
}

// ─── Wire role selection ──────────────────────────────────────────────────────
function wireRoleSelection() {
  const roleMap = {
    'restaurant': PAGES.restaurantReg,
    'hotel':      PAGES.restaurantReg,
    'ngo':        PAGES.ngoReg,
    'volunteer':  PAGES.volunteerReg,
  };

  // Find the continue/next button and role cards
  document.querySelectorAll('.role-card, [onclick*="selectRole"]').forEach(card => {
    card.addEventListener('click', () => {
      // Role is stored via existing selectRole() function
      setTimeout(() => {
        const selected = document.querySelector('.role-card.selected, .role-card[data-selected], .border-primary');
        if (selected) {
          const roleText = (selected.querySelector('h3')?.textContent || '').toLowerCase();
          for (const [key, page] of Object.entries(roleMap)) {
            if (roleText.includes(key)) {
              localStorage.setItem('fr_selected_role', key.replace('hotel','restaurant'));
              break;
            }
          }
        }
      }, 100);
    });
  });

  // Wire "Continue" / "Next" button
  document.querySelectorAll('button').forEach(btn => {
    const text = btn.textContent.trim().toLowerCase();
    if (text.includes('continue') || text.includes('next') || text.includes('join as')) {
      btn.addEventListener('click', () => {
        const selectedCard = document.querySelector('.role-card.border-primary, .role-card[style*="border"]');
        const roleText = (selectedCard?.querySelector('h3')?.textContent || '').toLowerCase();
        if (roleText.includes('restaurant') || roleText.includes('hotel')) navigateTo(PAGES.restaurantReg);
        else if (roleText.includes('ngo')) navigateTo(PAGES.ngoReg);
        else if (roleText.includes('volunteer')) navigateTo(PAGES.volunteerReg);
        else {
          // fallback: use stored role
          const r = localStorage.getItem('fr_selected_role') || 'restaurant';
          navigateTo(roleMap[r] || PAGES.restaurantReg);
        }
      });
    }
    if (text.includes('sign in') || text.includes('already have')) {
      btn.addEventListener('click', () => navigateTo(PAGES.login));
    }
  });

  // Wire back button
  document.querySelectorAll('button, a').forEach(el => {
    const text = (el.textContent + el.getAttribute('aria-label') + '').toLowerCase();
    if (text.includes('back') || el.querySelector('.material-symbols-outlined')?.textContent === 'arrow_back') {
      el.addEventListener('click', (e) => { e.preventDefault(); navigateTo(PAGES.splash); });
    }
  });
}

// ─── Wire registration pages ──────────────────────────────────────────────────
function wireRegistration() {
  // "Already have account" / "Sign in" links
  document.querySelectorAll('a, button').forEach(el => {
    const text = (el.textContent + '').trim().toLowerCase();
    if (text.includes('sign in') || text.includes('already have') || text.includes('log in')) {
      el.addEventListener('click', (e) => { e.preventDefault(); navigateTo(PAGES.login); });
    }
    if (text.includes('back') || el.querySelector('.material-symbols-outlined')?.textContent === 'arrow_back') {
      el.addEventListener('click', (e) => { e.preventDefault(); navigateTo(PAGES.roleSelection); });
    }
  });
}

// ─── Wire dashboard nav bars ──────────────────────────────────────────────────
function wireDashboardNav(role) {
  const navLinks = {
    restaurant: {
      home:         PAGES.restaurantDashboard,
      donate:       PAGES.createDonation,
      notifications: PAGES.notifications,
      profile:      PAGES.profile,
      history:      PAGES.analytics,
    },
    ngo: {
      home:         PAGES.ngoDashboard,
      notifications: PAGES.notifications,
      profile:      PAGES.profile,
      history:      PAGES.analytics,
    },
    volunteer: {
      home:         PAGES.volunteerDashboard,
      notifications: PAGES.notifications,
      profile:      PAGES.profile,
      history:      PAGES.analytics,
    },
  };

  const links = navLinks[role] || navLinks.restaurant;

  document.querySelectorAll('nav a, nav button').forEach(el => {
    const icon = el.querySelector('.material-symbols-outlined')?.textContent?.trim() || '';
    const text = el.textContent.trim().toLowerCase();

    if (icon === 'dashboard' || text.includes('home')) {
      el.href = '#'; el.addEventListener('click', (e) => { e.preventDefault(); navigateTo(links.home); });
    } else if (icon === 'add_circle' || icon === 'restaurant_menu' || text.includes('donate') || text.includes('create')) {
      el.href = '#'; el.addEventListener('click', (e) => { e.preventDefault(); navigateTo(links.donate || PAGES.createDonation); });
    } else if (icon === 'notifications' || text.includes('alert') || text.includes('notif')) {
      el.href = '#'; el.addEventListener('click', (e) => { e.preventDefault(); navigateTo(links.notifications); });
    } else if (icon === 'person' || text.includes('profile')) {
      el.href = '#'; el.addEventListener('click', (e) => { e.preventDefault(); navigateTo(links.profile); });
    } else if (icon === 'history' || text.includes('history')) {
      el.href = '#'; el.addEventListener('click', (e) => { e.preventDefault(); navigateTo(links.history); });
    } else if (icon === 'chat' || text.includes('chat') || text.includes('message')) {
      el.href = '#'; el.addEventListener('click', (e) => { e.preventDefault(); navigateTo(PAGES.chat); });
    } else if (icon === 'logout' || text.includes('logout') || text.includes('sign out')) {
      el.addEventListener('click', () => {
        localStorage.clear();
        navigateTo(PAGES.splash);
      });
    }
  });

  // Wire notification bell in header
  document.querySelectorAll('header button').forEach(btn => {
    const icon = btn.querySelector('.material-symbols-outlined')?.textContent?.trim();
    if (icon === 'notifications') {
      btn.addEventListener('click', () => navigateTo(PAGES.notifications));
    }
  });
}

// ─── Wire create donation page ────────────────────────────────────────────────
function wireCreateDonation() {
  document.querySelectorAll('button').forEach(btn => {
    const text = btn.textContent.trim().toLowerCase();
    if (text.includes('back') || btn.querySelector('.material-symbols-outlined')?.textContent === 'arrow_back') {
      btn.addEventListener('click', () => navigateTo(PAGES.restaurantDashboard));
    }
  });
}

// ─── Wire notifications page ──────────────────────────────────────────────────
function wireNotifications() {
  document.querySelectorAll('button, a').forEach(el => {
    const icon = el.querySelector('.material-symbols-outlined')?.textContent?.trim();
    if (icon === 'arrow_back' || el.textContent.trim().toLowerCase().includes('back')) {
      el.addEventListener('click', (e) => { e.preventDefault(); history.back(); });
    }
  });
}

// ─── Wire profile page ────────────────────────────────────────────────────────
function wireProfile() {
  document.querySelectorAll('button').forEach(btn => {
    const text = btn.textContent.trim().toLowerCase();
    const icon = btn.querySelector('.material-symbols-outlined')?.textContent?.trim();
    if (text.includes('logout') || text.includes('sign out') || icon === 'logout') {
      btn.addEventListener('click', () => { localStorage.clear(); navigateTo(PAGES.splash); });
    }
    if (icon === 'arrow_back' || text.includes('back')) {
      btn.addEventListener('click', () => history.back());
    }
  });
}

// ─── Auto-wire based on current page ─────────────────────────────────────────
(function autoWire() {
  const page = window.location.pathname.split('/').pop() || '';

  // Fade in
  document.body.style.opacity = '0';
  document.body.style.transition = 'opacity 0.3s ease';
  window.addEventListener('load', () => { document.body.style.opacity = '1'; });

  if (page.includes('1_splash'))              wireSplash();
  else if (page.includes('2_role'))           wireRoleSelection();
  else if (page.includes('3_restaurant_reg') || page.includes('5_ngo') || page.includes('6_volunteer'))  wireRegistration();
  else if (page.includes('7_restaurant_dashboard'))  { requireAuth() && wireDashboardNav('restaurant'); }
  else if (page.includes('10_ngo'))           { requireAuth() && wireDashboardNav('ngo'); }
  else if (page.includes('9_volunteer'))      { requireAuth() && wireDashboardNav('volunteer'); }
  else if (page.includes('8_create'))         { requireAuth() && wireCreateDonation(); }
  else if (page.includes('11_notif'))         { requireAuth() && wireNotifications(); }
  else if (page.includes('12_profile'))       { requireAuth() && wireProfile(); }
  else if (page.includes('31_mission'))       { requireAuth() && wireDashboardNav('admin'); }
})();
