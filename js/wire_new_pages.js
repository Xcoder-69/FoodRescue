/**
 * FoodRescue — New Pages Wiring (js/wire_new_pages.js)
 * Handles all button + nav wiring for the 6 Stitch-generated pages.
 */
(function () {
  var page = window.location.pathname.split('/').pop() || '';

  // ── Shared nav helper ──────────────────────────────────────────────────────
  function wireNav(roleHome) {
    document.querySelectorAll('nav a, aside a, footer a, a').forEach(function (a) {
      var icon = '';
      var iconEl = a.querySelector('.material-symbols-outlined');
      if (iconEl) icon = iconEl.textContent.trim();
      var txt = a.textContent.trim().toLowerCase();

      if (icon === 'home' || icon === 'dashboard' || icon === 'grid_view' || txt === 'home') {
        a.href = '#'; a.onclick = function (e) { e.preventDefault(); window.frNavigate(roleHome); };
      } else if (icon === 'history' || txt.includes('history') || txt.includes('donation history')) {
        a.href = '#'; a.onclick = function (e) { e.preventDefault(); window.frNavigate('13_impact_analytics.html'); };
      } else if (icon === 'notifications' || txt.includes('alert') || txt.includes('notif')) {
        a.href = '#'; a.onclick = function (e) { e.preventDefault(); window.frNavigate('11_notifications.html'); };
      } else if (icon === 'person' || txt.includes('profile')) {
        a.href = '#'; a.onclick = function (e) { e.preventDefault(); window.frNavigate('12_profile.html'); };
      } else if (icon === 'group' || txt.includes('volunteer')) {
        a.href = '#'; a.onclick = function (e) { e.preventDefault(); window.frNavigate('restaurant_volunteers.html'); };
      } else if (icon === 'settings' || txt.includes('setting')) {
        a.href = '#'; a.onclick = function (e) { e.preventDefault(); window.frNavigate('restaurant_settings.html'); };
      } else if (icon === 'leaderboard' || txt.includes('analytics') || txt.includes('impact')) {
        a.href = '#'; a.onclick = function (e) { e.preventDefault(); window.frNavigate('13_impact_analytics.html'); };
      } else if (icon === 'local_shipping' || txt.includes('track')) {
        a.href = '#'; a.onclick = function (e) { e.preventDefault(); window.frNavigate('restaurant_track_pickup.html'); };
      } else if (icon === 'logout' || txt.includes('logout') || txt.includes('sign out')) {
        a.href = '#'; a.onclick = function () { localStorage.clear(); window.frNavigate('1_splash_screen.html'); };
      } else if (icon === 'add_circle' || txt.includes('donate')) {
        a.href = '#'; a.onclick = function (e) { e.preventDefault(); window.frNavigate('8_create_food_donation.html'); };
      }
    });
  }

  // ── Success overlay helper ─────────────────────────────────────────────────
  function showSuccess(emoji, title, subtitle, btnLabel, btnDest) {
    var o = document.createElement('div');
    o.style.cssText = 'position:fixed;inset:0;background:rgba(0,108,73,0.97);z-index:99999;display:flex;flex-direction:column;align-items:center;justify-content:center;color:#fff;font-family:Inter,sans-serif;animation:fr-in .35s ease;text-align:center;padding:24px';
    var btn = document.createElement('button');
    btn.textContent = btnLabel;
    btn.style.cssText = 'margin-top:28px;padding:14px 36px;background:#fff;color:#006c49;border-radius:14px;font-weight:700;border:none;cursor:pointer;font-size:16px;box-shadow:0 4px 16px rgba(0,0,0,.15)';
    btn.onclick = function () { window.frNavigate(btnDest); };
    o.innerHTML = '<div style="font-size:80px;line-height:1">' + emoji + '</div><h2 style="font-size:26px;font-weight:800;margin:20px 0 10px">' + title + '</h2><p style="opacity:.85;font-size:15px;max-width:300px;line-height:1.5">' + subtitle + '</p>';
    o.appendChild(btn);
    document.body.appendChild(o);
  }

  // ── PAGE: ngo_browse_donations.html ───────────────────────────────────────
  if (page === 'ngo_browse_donations.html') {
    document.addEventListener('DOMContentLoaded', function () {
      wireNav('10_ngo_dashboard.html');
      document.querySelectorAll('button').forEach(function (btn) {
        var txt = btn.textContent.trim().toLowerCase();
        if (txt.includes('claim') || txt.includes('claim now')) {
          btn.addEventListener('click', function () { window.frNavigate('ngo_claim_donation.html'); });
        }
        if (txt.includes('filter')) {
          btn.addEventListener('click', function () {
            var panel = document.getElementById('fr-filter-panel');
            if (panel) panel.classList.toggle('hidden');
          });
        }
      });
    });
  }

  // ── PAGE: ngo_claim_donation.html ─────────────────────────────────────────
  else if (page === 'ngo_claim_donation.html') {
    document.addEventListener('DOMContentLoaded', function () {
      wireNav('10_ngo_dashboard.html');
      document.querySelectorAll('button').forEach(function (btn) {
        var txt = btn.textContent.trim().toLowerCase();
        var icon = (btn.querySelector('.material-symbols-outlined') || {}).textContent || '';
        if (txt === 'arrow_back' || icon.trim() === 'arrow_back') {
          btn.addEventListener('click', function () { window.frNavigate('ngo_browse_donations.html'); });
        }
        if (txt.includes('confirm') || txt.includes('claim')) {
          btn.addEventListener('click', function () {
            showSuccess('✅', 'Donation Claimed!', 'A volunteer will be assigned shortly. You will receive a notification.', '← Back to Dashboard', '10_ngo_dashboard.html');
          });
        }
      });
    });
  }

  // ── PAGE: delivery_confirmation.html ──────────────────────────────────────
  else if (page === 'delivery_confirmation.html') {
    document.addEventListener('DOMContentLoaded', function () {
      wireNav('10_ngo_dashboard.html');
      document.querySelectorAll('button').forEach(function (btn) {
        var txt = btn.textContent.trim().toLowerCase();
        var icon = (btn.querySelector('.material-symbols-outlined') || {}).textContent || '';
        if (txt === 'arrow_back' || icon.trim() === 'arrow_back') {
          btn.addEventListener('click', function () { history.back(); });
        }
        if (txt.includes('confirm') || txt.includes('drop') || txt.includes('delivery')) {
          btn.addEventListener('click', function () {
            showSuccess('🎉', 'Delivery Confirmed!', '40 families fed today. Great work making a difference!', '← Go to Dashboard', '10_ngo_dashboard.html');
          });
        }
        if (txt.includes('call') || txt.includes('phone')) {
          btn.addEventListener('click', function () { alert('Calling volunteer...'); });
        }
        if (txt.includes('route') || txt.includes('map')) {
          btn.addEventListener('click', function () { window.frNavigate('volunteer_navigation.html'); });
        }
      });
    });
  }

  // ── PAGE: restaurant_track_pickup.html ────────────────────────────────────
  else if (page === 'restaurant_track_pickup.html') {
    document.addEventListener('DOMContentLoaded', function () {
      wireNav('7_restaurant_dashboard.html');
      document.querySelectorAll('button').forEach(function (btn) {
        var txt = btn.textContent.trim().toLowerCase();
        var icon = (btn.querySelector('.material-symbols-outlined') || {}).textContent || '';
        if (txt.includes('call') || txt.includes('phone') || icon.trim() === 'call') {
          btn.addEventListener('click', function () { alert('Calling volunteer...'); });
        }
        if (txt.includes('message') || txt.includes('chat') || icon.trim() === 'chat') {
          btn.addEventListener('click', function () { window.frNavigate('14_chat_and_coordination.html'); });
        }
        if (txt === 'arrow_back' || icon.trim() === 'arrow_back') {
          btn.addEventListener('click', function () { window.frNavigate('7_restaurant_dashboard.html'); });
        }
      });
    });
  }

  // ── PAGE: restaurant_settings.html ────────────────────────────────────────
  else if (page === 'restaurant_settings.html') {
    document.addEventListener('DOMContentLoaded', function () {
      wireNav('7_restaurant_dashboard.html');
      document.querySelectorAll('button').forEach(function (btn) {
        var txt = btn.textContent.trim().toLowerCase();
        var icon = (btn.querySelector('.material-symbols-outlined') || {}).textContent || '';
        if (txt.includes('logout') || txt.includes('sign out')) {
          btn.onclick = function () { localStorage.clear(); window.frNavigate('1_splash_screen.html'); };
        }
        if (txt.includes('deactivate') || txt.includes('delete')) {
          btn.onclick = function () {
            if (confirm('Are you sure? This action cannot be undone.')) {
              localStorage.clear(); window.frNavigate('1_splash_screen.html');
            }
          };
        }
        if (txt === 'arrow_back' || icon.trim() === 'arrow_back') {
          btn.addEventListener('click', function () { window.frNavigate('7_restaurant_dashboard.html'); });
        }
        if (txt.includes('edit profile') || txt.includes('save')) {
          btn.addEventListener('click', function () { alert('Profile update saved!'); });
        }
      });
    });
  }

  // ── PAGE: restaurant_volunteers.html ──────────────────────────────────────
  else if (page === 'restaurant_volunteers.html') {
    document.addEventListener('DOMContentLoaded', function () {
      wireNav('7_restaurant_dashboard.html');
      document.querySelectorAll('button').forEach(function (btn) {
        var txt = btn.textContent.trim().toLowerCase();
        var icon = (btn.querySelector('.material-symbols-outlined') || {}).textContent || '';
        if (txt.includes('assign')) {
          btn.addEventListener('click', function () {
            showSuccess('👋', 'Volunteer Assigned!', 'The volunteer has been notified and will arrive for pickup.', '← Back to Volunteers', 'restaurant_volunteers.html');
          });
        }
        if (txt.includes('call') || txt.includes('phone') || icon.trim() === 'call') {
          btn.addEventListener('click', function () { alert('Calling volunteer...'); });
        }
        if (txt.includes('invite') || txt.includes('add')) {
          btn.addEventListener('click', function () { alert('Volunteer invite link copied!'); });
        }
        if (txt === 'arrow_back' || icon.trim() === 'arrow_back') {
          btn.addEventListener('click', function () { window.frNavigate('7_restaurant_dashboard.html'); });
        }
      });
    });
  }

  // ── PAGE: volunteer_navigation.html ───────────────────────────────────────
  else if (page === 'volunteer_navigation.html') {
    document.addEventListener('DOMContentLoaded', function () {
      wireNav('9_volunteer_dashboard.html');
      document.querySelectorAll('button').forEach(function (btn) {
        var txt = btn.textContent.trim().toLowerCase();
        var icon = (btn.querySelector('.material-symbols-outlined') || {}).textContent || '';
        if (txt.includes('arrived') || txt.includes('confirm') || txt.includes('drop')) {
          btn.addEventListener('click', function () { window.frNavigate('delivery_confirmation.html'); });
        }
        if (txt.includes('call') || txt.includes('ngo') || icon.trim() === 'call') {
          btn.addEventListener('click', function () { alert('Calling NGO...'); });
        }
        if (txt === 'arrow_back' || icon.trim() === 'arrow_back') {
          btn.addEventListener('click', function () { window.frNavigate('9_volunteer_dashboard.html'); });
        }
      });
    });
  }

})();
