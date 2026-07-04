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

    /* Wire any existing arrow_back elements first */
    var found = false;
    document.querySelectorAll('button,a,span').forEach(function(el) {
      if (el.textContent.trim() === 'arrow_back') {
        found = true;
        if (!el._frWired) {
          el._frWired = true;
          el.style.cursor = 'pointer';
          el.addEventListener('click', function(e) {
            e.preventDefault(); e.stopPropagation();
            window.frNavigate(dest);
          });
        }
      }
    });
    if (found) return;

    /* Floating FAB back button */
    var s = document.createElement('style');
    s.textContent =
      '#fr-back{position:fixed;top:16px;left:16px;z-index:9998;width:44px;height:44px;border-radius:50%;' +
      'background:rgba(255,255,255,.95);border:1.5px solid rgba(0,108,73,.2);' +
      'box-shadow:0 2px 16px rgba(0,108,73,.18);display:flex;align-items:center;justify-content:center;' +
      'cursor:pointer;color:#006c49;transition:transform .2s,box-shadow .2s,background .2s;' +
      'backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);}' +
      '#fr-back:hover{transform:scale(1.1) translateX(-2px);box-shadow:0 4px 24px rgba(0,108,73,.28);background:#e6f4ef;}' +
      '#fr-back:active{transform:scale(.93);}' +
      '#fr-back .material-symbols-outlined{font-size:22px;pointer-events:none;}';
    document.head.appendChild(s);

    var btn = document.createElement('button');
    btn.id = 'fr-back';
    btn.title = 'Go Back';
    btn.setAttribute('aria-label','Go Back');
    btn.innerHTML = '<span class= material-symbols-outlined>arrow_back</span>';
    btn.addEventListener('click', function(){ window.frNavigate(dest); });
    document.body.appendChild(btn);
  }

  /* ---- 3. SIDEBAR / HAMBURGER ---- */
  function initSidebar() {
    var sidebar = document.querySelector('aside') ||
                  document.getElementById('nav-drawer');
    if (!sidebar) return;

    var triggers = Array.from(document.querySelectorAll('*')).filter(function(el) {
      var t = el.textContent.trim();
      return (t === 'menu' || t === 'menu_open') &&
             el.children.length === 0 &&
             !el.closest('aside');
    });
    if (!triggers.length) return;

    var overlay = document.createElement('div');
    overlay.id = 'fr-ov';
    document.body.appendChild(overlay);

    var s = document.createElement('style');
    s.textContent =
      '#fr-ov{display:none;position:fixed;inset:0;background:rgba(0,0,0,.38);z-index:49;' +
      'backdrop-filter:blur(2px);-webkit-backdrop-filter:blur(2px);}' +
      '#fr-ov.on{display:block;animation:fr-ol .22s ease}' +
      '@keyframes fr-ol{from{opacity:0}to{opacity:1}}' +
      '@media(max-width:1023px){' +
      'aside{position:fixed!important;top:0!important;left:0!important;height:100%!important;' +
      'z-index:50!important;display:flex!important;' +
      'transform:translateX(-110%)!important;' +
      'transition:transform .3s cubic-bezier(.22,1,.36,1)!important;will-change:transform;}' +
      'aside.fr-open{transform:translateX(0)!important;}}';
    document.head.appendChild(s);

    var isOpen = false;
    function open()  { isOpen=true;  sidebar.classList.add('fr-open');    overlay.classList.add('on');    document.body.style.overflow='hidden'; }
    function close() { isOpen=false; sidebar.classList.remove('fr-open'); overlay.classList.remove('on'); document.body.style.overflow=''; }

    triggers.forEach(function(trigger) {
      var el = (trigger.parentElement &&
        (trigger.parentElement.tagName==='BUTTON'||trigger.parentElement.tagName==='A'))
        ? trigger.parentElement : trigger;
      el.style.cursor = 'pointer';
      var fresh = el.cloneNode(true);
      el.parentNode.replaceChild(fresh, el);
      fresh.addEventListener('click', function(e) {
        e.preventDefault(); e.stopPropagation();
        isOpen ? close() : open();
      });
    });

    overlay.addEventListener('click', close);
    sidebar.querySelectorAll('a,button').forEach(function(el) {
      el.addEventListener('click', function() { if(window.innerWidth<1024) setTimeout(close,150); });
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
  });
})();
