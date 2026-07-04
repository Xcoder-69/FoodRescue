/**
 * FoodRescue - Global UI Enhancements (js/ui.js)
 * 1. Smooth fade+slide page transitions
 * 2. Back button injection on every page missing one
 * 3. Hamburger sidebar toggle fix
 * 4. Count-up animations for numeric stats
 */
(function () {
  var NO_BACK = [
    '1_splash_screen.html','7_restaurant_dashboard.html','10_ngo_dashboard.html',
    '9_volunteer_dashboard.html','31_mission_control_dashboard.html',
    '4_login_and_verification.html','2_role_selection.html','index.html',''
  ];
  var BACK_MAP = {
    '1_Restaurant_Registration_Step_1.html':'2_role_selection.html',
    '2_Restaurant_Registration_Step_2.html':'1_Restaurant_Registration_Step_1.html',
    '3_Restaurant_Registration_Step_3.html':'2_Restaurant_Registration_Step_2.html',
    '4_Restaurant_Registration_Step_4.html':'3_Restaurant_Registration_Step_3.html',
    '5_Restaurant_Registration_Step_5.html':'4_Restaurant_Registration_Step_4.html',
    '6_Registration_Success_Status.html':'1_splash_screen.html',
    '1_NGO_Registration_Step_1.html':'2_role_selection.html',
    '2_NGO_Registration_Step_2.html':'1_NGO_Registration_Step_1.html',
    '3_NGO_Registration_Step_3.html':'2_NGO_Registration_Step_2.html',
    '4_NGO_Registration_Step_4.html':'3_NGO_Registration_Step_3.html',
    '5_NGO_Registration_Step_5.html':'4_NGO_Registration_Step_4.html',
    '6_NGO_Registration_Success.html':'1_splash_screen.html',
    '6_volunteer_registration.html':'2_role_selection.html',
    '28_2fa_verification.html':'4_login_and_verification.html',
    '29_secret_security_key.html':'28_2fa_verification.html',
    '8_create_food_donation.html':'7_restaurant_dashboard.html',
    '11_notifications.html':'7_restaurant_dashboard.html',
    '12_profile.html':'7_restaurant_dashboard.html',
    '13_impact_analytics.html':'7_restaurant_dashboard.html',
    '14_chat_and_coordination.html':'7_restaurant_dashboard.html',
    '20_help_and_support.html':'7_restaurant_dashboard.html',
    '23_dispute_and_policy_center.html':'7_restaurant_dashboard.html',
    '24_terms_and_conditions.html':'7_restaurant_dashboard.html',
    '25_privacy_and_guidelines.html':'7_restaurant_dashboard.html',
    '26_declarations_and_consent.html':'7_restaurant_dashboard.html',
    '15_verification_management.html':'31_mission_control_dashboard.html',
    '16_donation_monitoring.html':'31_mission_control_dashboard.html',
    '17_user_management_admin.html':'31_mission_control_dashboard.html',
    '18_csr_and_reporting.html':'31_mission_control_dashboard.html',
    '19_fraud_and_reports_admin.html':'31_mission_control_dashboard.html',
    '21_complaints_management.html':'31_mission_control_dashboard.html',
    '22_food_safety_and_compliance.html':'31_mission_control_dashboard.html',
    '27_admin_login_command_center.html':'1_splash_screen.html',
    '30_command_center_gateway.html':'27_admin_login_command_center.html',
    '32_security_operations_center.html':'31_mission_control_dashboard.html',
    '33_fraud_intelligence_center.html':'31_mission_control_dashboard.html',
    '34_immutable_audit_ledger.html':'31_mission_control_dashboard.html',
    '35_session_device_management.html':'31_mission_control_dashboard.html',
    '36_account_recovery_system.html':'31_mission_control_dashboard.html',
    '37_security_vector_scan.html':'31_mission_control_dashboard.html',
    '38_security_alert_access_blocked.html':'31_mission_control_dashboard.html',
    'ngo_browse_donations.html':'10_ngo_dashboard.html',
    'ngo_claim_donation.html':'ngo_browse_donations.html',
    'delivery_confirmation.html':'9_volunteer_dashboard.html',
    'restaurant_track_pickup.html':'7_restaurant_dashboard.html',
    'restaurant_settings.html':'7_restaurant_dashboard.html',
    'restaurant_volunteers.html':'7_restaurant_dashboard.html',
    'volunteer_navigation.html':'9_volunteer_dashboard.html'
  };
  var currentPage = window.location.pathname.split('/').pop() || 'index.html';

  /* ---- 1. TRANSITIONS ---- */
  function initTransitions() {
    var s = document.createElement('style');
    s.id = 'fr-ui-transitions';
    s.textContent =
      'body{animation:fr-in .32s cubic-bezier(.22,1,.36,1) both}' +
      '@keyframes fr-in{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}';
    document.head.appendChild(s);
  }

  window.frNavigate = function(dest) {
    if (!dest || dest === '#') return;
    document.body.style.transition = 'opacity .22s ease,transform .22s ease';
    document.body.style.opacity    = '0';
    document.body.style.transform  = 'translateY(-6px)';
    setTimeout(function(){ window.location.href = dest; }, 240);
  };

  /* ---- 2. BACK BUTTON ---- */
  function injectBack() {
    var dest = BACK_MAP[currentPage];
    if (NO_BACK.indexOf(currentPage) !== -1 || !dest) return;

    /* Wire any existing arrow_back icon elements first */
    var found = false;
    document.querySelectorAll('button,a,span').forEach(function(el) {
      if (el.textContent.trim() === 'arrow_back' && el.children.length === 0) {
        found = true;
        /* Walk up to the real clickable ancestor */
        var clickable = el;
        if (el.parentElement && (el.parentElement.tagName === 'BUTTON' || el.parentElement.tagName === 'A')) {
          clickable = el.parentElement;
        }
        if (!clickable._frWired) {
          clickable._frWired = true;
          clickable.style.cursor = 'pointer';
          clickable.addEventListener('click', function(e) {
            e.preventDefault(); e.stopPropagation();
            window.frNavigate(dest);
          });
        }
      }
    });
    if (found) return;

    /* No existing back icon — inject a floating FAB.
       Position: bottom-left on mobile (avoids top hamburger overlap).
       On desktop (lg:) where sidebar is visible, hide it. */
    var s = document.createElement('style');
    s.textContent =
      '#fr-back{' +
        'position:fixed;bottom:88px;left:16px;z-index:9998;' +
        'width:44px;height:44px;border-radius:50%;' +
        'background:rgba(255,255,255,.96);' +
        'border:1.5px solid rgba(0,108,73,.22);' +
        'box-shadow:0 4px 18px rgba(0,108,73,.20);' +
        'display:flex;align-items:center;justify-content:center;' +
        'cursor:pointer;color:#006c49;' +
        'transition:transform .18s ease,box-shadow .18s ease,background .18s ease;' +
        'backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);' +
      '}' +
      '#fr-back:hover{transform:scale(1.1);box-shadow:0 6px 28px rgba(0,108,73,.30);background:#e8f5ef;}' +
      '#fr-back:active{transform:scale(.9);}' +
      '#fr-back .material-symbols-outlined{font-size:22px;pointer-events:none;}' +
      /* Hide on desktop where sidebar already provides navigation */
      '@media(min-width:1024px){#fr-back{display:none;}}';
    document.head.appendChild(s);

    var btn = document.createElement('button');
    btn.id = 'fr-back';
    btn.title = 'Go Back';
    btn.setAttribute('aria-label', 'Go Back');
    btn.innerHTML = '<span class="material-symbols-outlined">arrow_back</span>';
    btn.addEventListener('click', function() { window.frNavigate(dest); });
    document.body.appendChild(btn);
  }


  /* ---- 3. SIDEBAR / HAMBURGER ---- */
  function initSidebar() {
    /* ── Find the sidebar panel (aside or drawer divs) ── */
    var sidebar =
      document.querySelector('aside') ||
      document.getElementById('nav-drawer') ||
      document.getElementById('sidebar') ||
      document.querySelector('[id*="sidebar"]') ||
      document.querySelector('[id*="drawer"]') ||
      document.querySelector('[class*="sidebar"]');
    if (!sidebar) return;

    /* ── Find all hamburger trigger buttons ──
       Strategy 1: button containing a material icon with text 'menu'
       Strategy 2: any element whose DIRECT text child is 'menu' / 'menu_open'
    */
    var triggerBtns = [];

    // S1: button > span.material-symbols-outlined with text 'menu'
    document.querySelectorAll('button').forEach(function(btn) {
      if (btn.closest('aside') || btn.closest('[id*="sidebar"]')) return;
      var icon = btn.querySelector('.material-symbols-outlined, .material-icons');
      if (icon && (icon.textContent.trim() === 'menu' || icon.textContent.trim() === 'menu_open')) {
        triggerBtns.push(btn);
      }
    });

    // S2: any leaf element whose text is exactly 'menu' (old pages)
    if (!triggerBtns.length) {
      Array.from(document.querySelectorAll('*')).forEach(function(el) {
        var t = el.textContent.trim();
        if ((t === 'menu' || t === 'menu_open') && el.children.length === 0 && !el.closest('aside')) {
          var clickable = (el.parentElement &&
            (el.parentElement.tagName === 'BUTTON' || el.parentElement.tagName === 'A'))
            ? el.parentElement : el;
          if (triggerBtns.indexOf(clickable) === -1) triggerBtns.push(clickable);
        }
      });
    }

    if (!triggerBtns.length) return;

    /* ── Dark overlay ── */
    var overlay = document.createElement('div');
    overlay.id = 'fr-ov';
    document.body.appendChild(overlay);

    /* ── Styles ──
       Key fix for Stitch pages: aside has class 'hidden lg:flex'.
       We override display via fr-open so it becomes flex on mobile too.
    */
    var s = document.createElement('style');
    s.textContent =
      /* Overlay */
      '#fr-ov{display:none;position:fixed;inset:0;background:rgba(0,0,0,.40);z-index:49;' +
        'backdrop-filter:blur(2px);-webkit-backdrop-filter:blur(2px);}' +
      '#fr-ov.on{display:block;animation:fr-ol .22s ease forwards;}' +
      '@keyframes fr-ol{from{opacity:0}to{opacity:1}}' +
      /* Mobile sidebar — applies to both aside and div sidebars */
      '@media(max-width:1023px){' +
        'aside,#sidebar,[id*="sidebar"]{' +
          'position:fixed!important;top:0!important;left:0!important;' +
          'height:100dvh!important;height:100vh!important;' +
          'z-index:50!important;' +
          'display:none!important;' +  /* hidden by default */
          'flex-direction:column!important;' +
          'transform:translateX(-100%)!important;' +
          'transition:transform .28s cubic-bezier(.22,1,.36,1)!important;' +
          'will-change:transform;overflow-y:auto;' +
        '}' +
        /* When open: show + slide in */
        'aside.fr-open,[id*="sidebar"].fr-open{' +
          'display:flex!important;' +
          'transform:translateX(0)!important;' +
        '}' +
      '}';
    document.head.appendChild(s);

    var isOpen = false;

    function openSidebar() {
      isOpen = true;
      sidebar.classList.add('fr-open');
      overlay.classList.add('on');
      document.body.style.overflow = 'hidden';
    }

    function closeSidebar() {
      isOpen = false;
      sidebar.classList.remove('fr-open');
      overlay.classList.remove('on');
      document.body.style.overflow = '';
    }

    /* Wire each hamburger button — clone to strip stale handlers */
    triggerBtns.forEach(function(btn) {
      var fresh = btn.cloneNode(true);
      btn.parentNode.replaceChild(fresh, btn);
      fresh.style.cursor = 'pointer';
      fresh.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        isOpen ? closeSidebar() : openSidebar();
      });
    });

    /* Close on overlay click */
    overlay.addEventListener('click', closeSidebar);

    /* Close when a sidebar link is tapped on mobile */
    sidebar.querySelectorAll('a, button').forEach(function(el) {
      el.addEventListener('click', function() {
        if (window.innerWidth < 1024) setTimeout(closeSidebar, 160);
      });
    });

    /* Close on Escape key */
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && isOpen) closeSidebar();
    });
  }


  /* ---- 4. COUNT-UP (scroll-triggered, 60fps, a11y-safe) ---- */

  /**
   * Parse a text node into { prefix, integer, decimal, suffix }
   * Supports: 125,430 | 98% | $4.5M | 48 Tons | 320+ | 1,250 kg
   */
  function parseNumber(raw) {
    // Trim and collapse whitespace
    var text = raw.trim().replace(/\s+/g, ' ');

    // Extract leading prefix ($, £, €, ₹)
    var prefix = '';
    var prefixMatch = text.match(/^([\$\£\€\₹])/);
    if (prefixMatch) { prefix = prefixMatch[1]; text = text.slice(prefix.length); }

    // Extract the numeric part: digits, commas, dots
    var numMatch = text.match(/^([\d,\.]+)/);
    if (!numMatch) return null;
    var numStr  = numMatch[1];
    var numVal  = parseFloat(numStr.replace(/,/g, ''));
    if (isNaN(numVal) || numVal <= 0) return null;

    // Decimal places
    var decPart = numStr.split('.')[1] || '';
    var decimals = decPart.length;

    // Suffix: everything after the number (%, +, K, M, Tons, kg, etc.)
    var suffix = text.slice(numStr.length);
    // Keep suffix as-is (includes space + unit words if present)

    return { prefix: prefix, value: numVal, decimals: decimals, suffix: suffix };
  }

  /**
   * Format a number back to string matching original formatting:
   * comma-separated integers, fixed decimals
   */
  function formatNum(val, decimals) {
    if (decimals > 0) return val.toFixed(decimals);
    // Comma-separate integers
    return Math.round(val).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  /** Cubic ease-out: fast start, smooth deceleration */
  function easeOut(t) { return 1 - Math.pow(1 - t, 3); }

  /**
   * Animate a single element's text from 0 to its parsed target.
   * Duration scales with magnitude: 1500ms base + up to 500ms extra.
   */
  function countUp(el, parsed, dur) {
    // Respect prefers-reduced-motion
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.textContent = parsed.prefix + formatNum(parsed.value, parsed.decimals) + parsed.suffix;
      return;
    }
    var t0 = null;
    var raf;
    function tick(ts) {
      if (!t0) t0 = ts;
      var elapsed = ts - t0;
      var progress = Math.min(elapsed / dur, 1);
      var current  = parsed.value * easeOut(progress);
      el.textContent = parsed.prefix + formatNum(current, parsed.decimals) + parsed.suffix;
      if (progress < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        // Ensure final value is exact
        el.textContent = parsed.prefix + formatNum(parsed.value, parsed.decimals) + parsed.suffix;
        cancelAnimationFrame(raf);
      }
    }
    raf = requestAnimationFrame(tick);
  }

  /**
   * Discover all stat elements and attach IntersectionObserver.
   * Detection strategy (in order):
   *   1. data-stat-value attribute (explicit)
   *   2. [id^=stat-] elements
   *   3. [class*=stat] or [class*=counter] leaf elements
   *   4. h1-h5, span, p, strong, b leaf elements whose text looks numeric
   */
  function initCounters() {
    // Numeric pattern: optional prefix, digits/commas/dots, optional suffix
    // Matches: 125,430 | 98% | $4.5M | 48 Tons | 320+ | 1,250 kg | 12,480
    var NUM_RE = /^[\$\£\€\₹]?[\d][\d,\.]*[\s]?[\w\%\+\-\.]*$/;
    var SKIP_TAGS = { SCRIPT:1, STYLE:1, NOSCRIPT:1, INPUT:1, TEXTAREA:1, SELECT:1, BUTTON:1 };

    var pool = [];
    var seen = new WeakSet();

    function add(el) {
      if (!el || seen.has(el) || SKIP_TAGS[el.tagName]) return;
      seen.add(el);
      pool.push(el);
    }

    // Strategy 1: explicit data-stat-value
    document.querySelectorAll('[data-stat-value]').forEach(function(el) { add(el); });

    // Strategy 2: id starts with stat-
    document.querySelectorAll('[id^="stat-"]').forEach(function(el) { add(el); });

    // Strategy 3: class contains stat or counter
    document.querySelectorAll('[class*="stat"],[class*="counter"],[class*="count"]').forEach(function(el) {
      if (el.children.length === 0) add(el);
    });

    // Strategy 4: leaf text nodes in common stat containers
    document.querySelectorAll('h1,h2,h3,h4,h5,strong,b,span,p,[class*="text-"]').forEach(function(el) {
      if (SKIP_TAGS[el.tagName]) return;
      // Must be a leaf (no child elements) or only have icon children
      var hasElementChildren = Array.from(el.children).some(function(c) {
        return !c.classList.contains('material-symbols-outlined') &&
               !c.classList.contains('material-icons') &&
               c.tagName !== 'SPAN' || c.children.length > 0;
      });
      if (hasElementChildren) return;
      var text = el.textContent.trim();
      if (text.length < 1 || text.length > 30) return;
      if (NUM_RE.test(text) && parseNumber(text)) add(el);
    });

    if (!pool.length) return;

    // Duration: 1500ms + extra based on magnitude, capped at 2000ms
    function getDur(val) {
      return Math.max(1500, Math.min(1500 + Math.log10(val + 1) * 200, 2000));
    }

    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        if (el._frCounted) return;  // animate only once
        el._frCounted = true;
        observer.unobserve(el);

        // Parse current text (or data-stat-value if set explicitly)
        var rawText = el.dataset.statValue || el.textContent.trim();
        var parsed  = parseNumber(rawText);
        if (!parsed) return;

        // Stagger: small delay per element for a wave effect (0-150ms)
        var idx = pool.indexOf(el);
        var delay = Math.min(idx * 30, 150);

        setTimeout(function() {
          countUp(el, parsed, getDur(parsed.value));
        }, delay);
      });
    }, {
      threshold: 0.25,    // start when 25% visible
      rootMargin: '0px'   // no pre-loading
    });

    pool.forEach(function(el) { observer.observe(el); });
  }

  /* ---- 5. PATCH HTML LINKS ---- */
  function patchLinks() {
    document.querySelectorAll('a[href]').forEach(function(a) {
      var h = a.getAttribute('href');
      if (!h||h==='#'||h.indexOf('javascript')===0||h.indexOf('http')===0||h.indexOf('mailto')===0) return;
      if (h.endsWith('.html')) {
        a.addEventListener('click', function(e) { e.preventDefault(); window.frNavigate(h); });
      }
    });
  }

  /* ---- INIT ---- */
  initTransitions();
  document.addEventListener('DOMContentLoaded', function() {
    injectBack();
    initSidebar();
    initCounters();
    patchLinks();
    wireAllButtons();
  });

  /* ---- 6. WIRE ALL BUTTONS ---- */
  function wireAllButtons() {
    // Helper: show a quick toast
    function toast(msg, icon) {
      icon = icon || 'check_circle';
      var t = document.createElement('div');
      t.style.cssText = 'position:fixed;bottom:96px;left:50%;transform:translateX(-50%) translateY(12px);z-index:999999;background:#006c49;color:#fff;padding:11px 20px;border-radius:13px;font-size:14px;font-weight:600;font-family:Inter,sans-serif;box-shadow:0 6px 24px rgba(0,108,73,.32);opacity:0;transition:opacity .22s,transform .22s;display:flex;align-items:center;gap:8px;white-space:nowrap;';
      t.innerHTML = '<span class="material-symbols-outlined" style="font-size:17px">' + icon + '</span>' + msg;
      document.body.appendChild(t);
      requestAnimationFrame(function(){ requestAnimationFrame(function(){ t.style.opacity='1'; t.style.transform='translateX(-50%) translateY(0)'; }); });
      setTimeout(function(){ t.style.opacity='0'; t.style.transform='translateX(-50%) translateY(12px)'; setTimeout(function(){ t.remove(); }, 230); }, 2600);
    }

    /* ──── SHARED: Bottom nav bar wiring for all pages ──── */
    document.querySelectorAll('nav a, nav button').forEach(function(el) {
      var icon = (el.querySelector('.material-symbols-outlined') || {}).textContent || '';
      icon = icon.trim();
      var txt = el.textContent.trim().toLowerCase();
      var map = {
        'dashboard': '7_restaurant_dashboard.html', 'home': '7_restaurant_dashboard.html',
        'history': '13_impact_analytics.html', 'analytics': '13_impact_analytics.html',
        'add_circle': '8_create_food_donation.html', 'donate': '8_create_food_donation.html',
        'volunteer_activism': '8_create_food_donation.html',
        'notifications': '11_notifications.html', 'alerts': '11_notifications.html',
        'person': '12_profile.html', 'profile': '12_profile.html',
        'settings': 'restaurant_settings.html',
        'grid_view': '7_restaurant_dashboard.html',
        'receipt_long': '13_impact_analytics.html',
        'leaderboard': '13_impact_analytics.html',
        'group': 'restaurant_volunteers.html',
      };
      var dest = map[icon] || (txt === 'home' ? '7_restaurant_dashboard.html' : null)
                            || (txt === 'donate' ? '8_create_food_donation.html' : null)
                            || (txt === 'alerts' ? '11_notifications.html' : null)
                            || (txt === 'profile' ? '12_profile.html' : null)
                            || (txt === 'history' ? '13_impact_analytics.html' : null);
      if (dest && !el._wired) {
        el._wired = true;
        el.href = '#';
        el.onclick = function(e){ e.preventDefault(); window.frNavigate(dest); };
      }
    });

    /* ──── 10_ngo_dashboard ──── */
    if (currentPage === '10_ngo_dashboard.html') {
      document.querySelectorAll('button').forEach(function(btn) {
        var txt = btn.textContent.trim().toLowerCase();
        var icon = (btn.querySelector('.material-symbols-outlined')||{}).textContent||'';
        icon = icon.trim();
        if (txt.includes('view all') || icon === 'arrow_forward') {
          btn.onclick = function(){ window.frNavigate('ngo_browse_donations.html'); };
        } else if (txt.includes('claim now') || icon === 'shopping_cart_checkout') {
          btn.onclick = function(){ window.frNavigate('ngo_claim_donation.html'); };
        } else if (icon === 'filter_list' || txt.includes('filter')) {
          btn.onclick = function(){ toast('Filters coming soon!', 'tune'); };
        } else if (txt.includes('verified') || txt.includes('fssai')) {
          btn.onclick = function(){ window.frNavigate('15_verification_management.html'); };
        } else if (txt.includes('top donors') || icon === 'star') {
          btn.onclick = function(){ window.frNavigate('ngo_browse_donations.html'); };
        }
      });
    }

    /* ──── 11_notifications ──── */
    if (currentPage === '11_notifications.html') {
      document.querySelectorAll('button, a').forEach(function(el) {
        var txt = el.textContent.trim().toLowerCase();
        var icon = (el.querySelector('.material-symbols-outlined')||{}).textContent||'';
        if (txt.includes('mark all') || icon.trim() === 'done_all') {
          el.onclick = function(e){ e.preventDefault();
            document.querySelectorAll('.notification-item, [class*=notif]').forEach(function(n){ n.style.opacity='0.5'; });
            toast('All notifications marked as read', 'done_all');
          };
        } else if (txt.includes('boost now')) {
          el.onclick = function(){ toast('Boost feature coming soon!', 'rocket_launch'); };
        } else if (txt.includes('dismiss')) {
          el.onclick = function(){ 
            var p = el.closest('[class*=notif], li, .card, div.p-4');
            if (p) { p.style.opacity='0'; setTimeout(function(){ p.remove(); }, 300); }
            toast('Notification dismissed', 'close'); 
          };
        }
      });
    }

    /* ──── 13_impact_analytics ──── */
    if (currentPage === '13_impact_analytics.html') {
      document.querySelectorAll('button').forEach(function(btn) {
        var txt = btn.textContent.trim().toLowerCase();
        var icon = (btn.querySelector('.material-symbols-outlined')||{}).textContent||'';
        if (txt.includes('last 30') || txt.includes('quarterly') || txt.includes('custom')) {
          if (!btn._wired) {
            btn._wired = true;
            btn.onclick = function(){
              document.querySelectorAll('button').forEach(function(b){ if(['last 30 days','quarterly','custom'].some(function(k){ return b.textContent.trim().toLowerCase().includes(k); })) b.style.fontWeight='400'; });
              btn.style.fontWeight = '700'; btn.style.background='rgba(0,108,73,.12)';
              toast('Showing: ' + btn.textContent.trim(), 'calendar_today');
            };
          }
        } else if (txt.includes('boost outreach')) {
          btn.onclick = function(){ toast('Boost campaign started!', 'rocket_launch'); };
        } else if (txt.includes('view all')) {
          btn.onclick = function(){ window.frNavigate('ngo_browse_donations.html'); };
        } else if (icon.trim() === 'download' || txt.includes('download')) {
          btn.onclick = function(){
            var a = document.createElement('a');
            a.href = 'data:text/csv,Date,Rescued,Donated\n' + ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(function(d,i){ return d+','+(45+i*7)+','+(30+i*6); }).join('\n');
            a.download = 'impact_analytics.csv'; a.click();
            toast('Analytics exported!', 'download');
          };
        }
      });
    }

    /* ──── 14_chat_and_coordination ──── */
    if (currentPage === '14_chat_and_coordination.html') {
      document.querySelectorAll('button').forEach(function(btn) {
        var icon = (btn.querySelector('.material-symbols-outlined')||{}).textContent||'';
        icon = icon.trim();
        var txt = btn.textContent.trim().toLowerCase();
        if (icon === 'call') {
          btn.onclick = function(){ toast('📞 Calling…', 'phone_in_talk'); };
        } else if (icon === 'more_vert') {
          btn.onclick = function(){ toast('Options: Delete chat, Mute, Block', 'more_vert'); };
        } else if (icon === 'arrow_back' || txt === 'back') {
          btn.onclick = function(){ history.back(); };
        }
      });
      // Send button
      var sendInput = document.querySelector('input[type=text], textarea');
      document.querySelectorAll('button').forEach(function(btn) {
        var icon = (btn.querySelector('.material-symbols-outlined')||{}).textContent||'';
        if (icon.trim() === 'send') {
          btn.onclick = function(){
            var val = sendInput ? sendInput.value.trim() : '';
            if (!val) { toast('Type a message first', 'edit'); return; }
            if (sendInput) sendInput.value = '';
            toast('Message sent!', 'send');
          };
        }
      });
    }

    /* ──── 7_restaurant_dashboard ──── */
    if (currentPage === '7_restaurant_dashboard.html') {
      document.querySelectorAll('button, a').forEach(function(el) {
        var icon = (el.querySelector('.material-symbols-outlined')||{}).textContent||'';
        icon = icon.trim();
        var txt = el.textContent.trim().toLowerCase();
        if (icon === 'add_circle' || txt.includes('donate food')) { el.onclick = function(e){ e.preventDefault(); window.frNavigate('8_create_food_donation.html'); }; }
        else if (icon === 'local_shipping' || txt.includes('track pickup')) { el.onclick = function(e){ e.preventDefault(); window.frNavigate('restaurant_track_pickup.html'); }; }
        else if (txt.includes('view all') && !el._wired) { el._wired=true; el.onclick = function(e){ e.preventDefault(); window.frNavigate('13_impact_analytics.html'); }; }
        else if (icon === 'search' || txt.includes('search')) { el.onclick = function(){ toast('Search coming soon!', 'search'); }; }
        else if (icon === 'more_vert' && !el._wired) { el._wired=true; el.onclick = function(){ toast('Options: Edit, Delete', 'more_vert'); }; }
      });
    }

    /* ──── 8_create_food_donation ──── */
    if (currentPage === '8_create_food_donation.html') {
      document.querySelectorAll('button').forEach(function(btn) {
        var txt = btn.textContent.trim().toLowerCase();
        if (txt === 'veg' || txt === 'non-veg' || txt === 'vegan') {
          btn.onclick = function(){
            document.querySelectorAll('button').forEach(function(b){ if(['veg','non-veg','vegan'].includes(b.textContent.trim().toLowerCase())) b.style.background='transparent'; });
            btn.style.background = 'rgba(0,108,73,.15)';
            toast(btn.textContent.trim() + ' selected', 'eco');
          };
        } else if (txt.includes('edit address')) {
          btn.onclick = function(){ toast('Address editing coming soon!', 'edit_location'); };
        }
      });
    }

    /* ──── 20_help_and_support ──── */
    if (currentPage === '20_help_and_support.html') {
      document.querySelectorAll('button').forEach(function(btn) {
        var icon = (btn.querySelector('.material-symbols-outlined')||{}).textContent||'';
        icon = icon.trim();
        var txt = btn.textContent.trim().toLowerCase();
        if (icon === 'expand_more' || txt.includes('how do') || txt.includes('account') || txt.includes('track') || txt.includes('donor is closed')) {
          if (!btn._wired) {
            btn._wired = true;
            var next = btn.nextElementSibling || btn.parentElement.nextElementSibling;
            btn.onclick = function(){
              if (next) { next.style.display = next.style.display === 'none' ? 'block' : 'none'; }
              var ic = btn.querySelector('.material-symbols-outlined');
              if (ic) ic.textContent = ic.textContent.trim() === 'expand_more' ? 'expand_less' : 'expand_more';
            };
          }
        } else if (txt.includes('browse guides')) {
          btn.onclick = function(){ window.frNavigate('22_food_safety_and_compliance.html'); };
        } else if (txt.includes('send message')) {
          var msgInput = document.querySelector('textarea, input[type=text]');
          btn.onclick = function(){
            var val = msgInput ? msgInput.value.trim() : '';
            if (!val) { toast('Please type your message first', 'edit'); return; }
            if (msgInput) msgInput.value = '';
            toast('Message sent! We\'ll respond within 24h', 'send');
          };
        } else if (txt.includes('live chat') || txt.includes('start live')) {
          btn.onclick = function(){ window.frNavigate('14_chat_and_coordination.html'); };
        }
      });
    }

    /* ──── ngo_browse_donations ──── */
    if (currentPage === 'ngo_browse_donations.html') {
      document.querySelectorAll('button').forEach(function(btn) {
        var txt = btn.textContent.trim();
        var isFilter = ['All','Perishable','Bakery','Produce','Dairy','Cooked'].some(function(f){ return txt === f; });
        if (isFilter && !btn._wired) {
          btn._wired = true;
          btn.onclick = function(){
            document.querySelectorAll('button').forEach(function(b){ if(['All','Perishable','Bakery','Produce','Dairy','Cooked'].includes(b.textContent.trim())) { b.style.background='transparent'; b.style.color=''; } });
            btn.style.background = '#006c49'; btn.style.color = '#fff';
            toast('Filtered: ' + txt, 'filter_list');
          };
        }
        if ((btn.querySelector('.material-symbols-outlined')||{}).textContent?.trim() === 'filter_list') {
          btn.onclick = function(){ toast('More filters coming soon!', 'tune'); };
        }
        if (txt.toLowerCase().includes('claim') && !btn._wired) {
          btn._wired = true;
          btn.onclick = function(){ window.frNavigate('ngo_claim_donation.html'); };
        }
      });
    }

    /* ──── ngo_claim_donation ──── */
    if (currentPage === 'ngo_claim_donation.html') {
      document.querySelectorAll('button, a').forEach(function(el) {
        var txt = el.textContent.trim().toLowerCase();
        var icon = (el.querySelector('.material-symbols-outlined')||{}).textContent||'';
        if (txt.includes('confirm claim')) {
          el.onclick = function(){
            el.style.opacity = '0.7'; el.disabled = true;
            setTimeout(function(){
              var overlay = document.createElement('div');
              overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,108,73,.97);z-index:99999;display:flex;flex-direction:column;align-items:center;justify-content:center;color:#fff;font-family:Inter,sans-serif;text-align:center;padding:24px;';
              overlay.innerHTML = '<div style="font-size:80px;margin-bottom:16px">🎉</div>'
                + '<h2 style="font-size:26px;font-weight:800;margin:0 0 10px">Donation Claimed!</h2>'
                + '<p style="opacity:.85;font-size:15px;max-width:300px;line-height:1.6;margin:0 0 28px">A volunteer will be assigned shortly to pick up this donation.</p>'
                + '<button onclick="window.frNavigate(\'10_ngo_dashboard.html\')" style="padding:13px 28px;background:#fff;color:#006c49;border-radius:14px;font-weight:700;border:none;cursor:pointer;font-size:15px;">Go to Dashboard</button>';
              document.body.appendChild(overlay);
            }, 600);
          };
        } else if (txt.includes('view my claims')) {
          el.onclick = function(e){ e.preventDefault(); window.frNavigate('ngo_browse_donations.html'); };
        } else if (txt.includes('back to home') || icon.trim() === 'arrow_back') {
          el.onclick = function(e){ e.preventDefault(); window.frNavigate('10_ngo_dashboard.html'); };
        } else if (icon.trim() === 'edit') {
          el.onclick = function(){ toast('Edit pickup notes', 'edit'); };
        }
      });
    }

    /* ──── delivery_confirmation ──── */
    if (currentPage === 'delivery_confirmation.html') {
      document.querySelectorAll('button, a').forEach(function(el) {
        var txt = el.textContent.trim().toLowerCase();
        var icon = (el.querySelector('.material-symbols-outlined')||{}).textContent||'';
        if (txt.includes('confirm drop') || txt.includes('confirm delivery')) {
          el.onclick = function(){
            el.style.opacity = '0.7'; el.disabled = true;
            setTimeout(function(){
              var overlay = document.createElement('div');
              overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,108,73,.97);z-index:99999;display:flex;flex-direction:column;align-items:center;justify-content:center;color:#fff;font-family:Inter,sans-serif;text-align:center;padding:24px;';
              overlay.innerHTML = '<div style="font-size:80px;margin-bottom:16px">✅</div>'
                + '<h2 style="font-size:26px;font-weight:800;margin:0 0 10px">Delivery Complete!</h2>'
                + '<p style="opacity:.85;font-size:15px;max-width:300px;line-height:1.6;margin:0 0 28px">You just made a difference. Thank you for rescuing food!</p>'
                + '<button onclick="window.frNavigate(\'9_volunteer_dashboard.html\')" style="padding:13px 28px;background:#fff;color:#006c49;border-radius:14px;font-weight:700;border:none;cursor:pointer;font-size:15px;">Back to Dashboard</button>';
              document.body.appendChild(overlay);
            }, 600);
          };
        } else if (txt.includes('return to dashboard') || txt.includes('back')) {
          el.onclick = function(e){ e.preventDefault(); window.frNavigate('9_volunteer_dashboard.html'); };
        } else if (txt.includes('view route') || icon.trim() === 'map') {
          el.onclick = function(e){ e.preventDefault(); window.frNavigate('volunteer_navigation.html'); };
        } else if (txt.includes('call') || icon.trim() === 'call') {
          el.onclick = function(e){ e.preventDefault(); toast('📞 Calling volunteer…', 'phone_in_talk'); };
        }
      });
    }

    /* ──── restaurant_volunteers ──── */
    if (currentPage === 'restaurant_volunteers.html') {
      document.querySelectorAll('button').forEach(function(btn) {
        var txt = btn.textContent.trim().toLowerCase();
        var icon = (btn.querySelector('.material-symbols-outlined')||{}).textContent||'';
        if (txt.includes('invite volunteer') || icon.trim() === 'person_add') {
          btn.onclick = function(){
            var email = prompt('Enter volunteer email to invite:');
            if (email) toast('Invite sent to ' + email, 'send');
          };
        } else if (icon.trim() === 'call') {
          btn.onclick = function(){ toast('📞 Calling volunteer…', 'phone_in_talk'); };
        } else if (txt.includes('assign') && !btn._wired) {
          btn._wired = true;
          btn.onclick = function(){ toast('Volunteer assigned to pickup!', 'check_circle'); btn.style.background='#e8f5ef'; btn.textContent='Assigned ✓'; };
        } else if (['all','available','busy','top rated'].includes(txt) && !btn._wired) {
          btn._wired = true;
          btn.onclick = function(){
            document.querySelectorAll('button').forEach(function(b){ if(['all','available','busy','top rated'].includes(b.textContent.trim().toLowerCase())) { b.style.background='transparent'; b.style.color=''; } });
            btn.style.background='#006c49'; btn.style.color='#fff';
            toast('Filtered: ' + btn.textContent.trim(), 'filter_list');
          };
        }
      });
    }

    /* ──── volunteer_navigation ──── */
    if (currentPage === 'volunteer_navigation.html') {
      document.querySelectorAll('button').forEach(function(btn) {
        var txt = btn.textContent.trim().toLowerCase();
        var icon = (btn.querySelector('.material-symbols-outlined')||{}).textContent||'';
        if (icon.trim() === 'call') {
          btn.onclick = function(){ toast('📞 Calling restaurant…', 'phone_in_talk'); };
        } else if (txt.includes("i've arrived") || txt.includes('arrived')) {
          btn.onclick = function(){
            btn.style.background='#4caf50'; btn.textContent='✅ Arrived! Proceeding to delivery…';
            setTimeout(function(){ window.frNavigate('delivery_confirmation.html'); }, 1200);
          };
        }
      });
    }

    /* ──── restaurant_track_pickup ──── */
    if (currentPage === 'restaurant_track_pickup.html') {
      document.querySelectorAll('button').forEach(function(btn) {
        var icon = (btn.querySelector('.material-symbols-outlined')||{}).textContent||'';
        var txt = btn.textContent.trim().toLowerCase();
        if (icon.trim() === 'call' || txt.includes('call volunteer')) {
          btn.onclick = function(){ toast('📞 Calling volunteer…', 'phone_in_talk'); };
        } else if (icon.trim() === 'chat_bubble' || txt.includes('send message') || txt.includes('message')) {
          btn.onclick = function(){ window.frNavigate('14_chat_and_coordination.html'); };
        }
      });
    }

    /* ──── Sidebar nav links wiring for pages with aside ──── */
    document.querySelectorAll('aside a, aside button').forEach(function(el) {
      if (el._wired) return;
      var icon = (el.querySelector('.material-symbols-outlined')||{}).textContent||'';
      icon = icon.trim();
      var txt = el.textContent.trim().toLowerCase();
      var map2 = {
        'grid_view':          '7_restaurant_dashboard.html',
        'dashboard':          '7_restaurant_dashboard.html',
        'receipt_long':       '13_impact_analytics.html',
        'leaderboard':        '13_impact_analytics.html',
        'analytics':          '13_impact_analytics.html',
        'group':              'restaurant_volunteers.html',
        'settings':           'restaurant_settings.html',
        'person':             '12_profile.html',
        'volunteer_activism': '8_create_food_donation.html',
        'receipt':            'restaurant_track_pickup.html',
      };
      var dest = map2[icon];
      if (!dest && txt.includes('dashboard'))  dest = '7_restaurant_dashboard.html';
      if (!dest && txt.includes('volunteer'))  dest = 'restaurant_volunteers.html';
      if (!dest && txt.includes('settings'))   dest = 'restaurant_settings.html';
      if (!dest && txt.includes('profile'))    dest = '12_profile.html';
      if (!dest && txt.includes('analytics'))  dest = '13_impact_analytics.html';
      if (!dest && txt.includes('donation'))   dest = '8_create_food_donation.html';
      if (!dest && (txt.includes('logout') || txt.includes('sign out'))) {
        el._wired = true;
        el.onclick = function(e){ e.preventDefault(); localStorage.clear(); window.frNavigate('1_splash_screen.html'); };
        return;
      }
      if (dest) {
        el._wired = true;
        el.href = '#';
        el.onclick = function(e){ e.preventDefault(); window.frNavigate(dest); };
      }
    });
  }
})();
