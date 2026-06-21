/**
 * FoodRescue Dashboard Data Binding
 * Loads live stats from backend APIs on page load.
 */

// Role-based dashboard loaders
const DashboardLoader = {

  /** Greets the user by name if stored */
  greetUser() {
    const user = JSON.parse(localStorage.getItem('foodRescueUser') || '{}');
    const greetEl = document.getElementById('dash-greeting');
    if (greetEl && user.email) {
      const name = user.email.split('@')[0];
      const hour = new Date().getHours();
      const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
      greetEl.textContent = `${greeting}, ${name.charAt(0).toUpperCase() + name.slice(1)}.`;
    }
  },

  /** Loads Restaurant dashboard stats */
  async loadRestaurant() {
    this.greetUser();
    try {
      const data = await ApiClient.get('/restaurant/dashboard');
      const stats = data?.data;
      if (!stats) return;
      const el = (id) => document.getElementById(id);
      if (el('stat-total'))     el('stat-total').textContent     = stats.totalDonations     ?? '--';
      if (el('stat-active'))    el('stat-active').textContent    = stats.activeDonations    ?? '--';
      if (el('stat-completed')) el('stat-completed').textContent = stats.completedDonations ?? '--';
    } catch (e) {
      console.warn('Could not load restaurant stats:', e.message);
    }
  },

  /** Loads NGO dashboard stats */
  async loadNgo() {
    this.greetUser();
    try {
      const data = await ApiClient.get('/ngo/dashboard');
      const stats = data?.data;
      if (!stats) return;
      const el = (id) => document.getElementById(id);
      if (el('stat-total'))    el('stat-total').textContent    = stats.totalClaimed     ?? '--';
      if (el('stat-active'))   el('stat-active').textContent   = stats.activeDeliveries ?? '--';
    } catch (e) {
      console.warn('Could not load NGO stats:', e.message);
    }
  },

  /** Loads Volunteer dashboard stats */
  async loadVolunteer() {
    this.greetUser();
    try {
      const data = await ApiClient.get('/volunteer/dashboard');
      const stats = data?.data;
      if (!stats) return;
      const el = (id) => document.getElementById(id);
      if (el('stat-completed')) el('stat-completed').textContent = stats.completedDeliveries ?? '--';
      if (el('stat-active'))    el('stat-active').textContent    = stats.activeDelivery ? '1' : '0';
    } catch (e) {
      console.warn('Could not load volunteer stats:', e.message);
    }
  },

  /** Guard: Redirect unauthenticated users to login */
  requireAuth() {
    if (!ApiClient.getToken()) {
      window.location.href = '4_login_and_verification.html';
      return false;
    }
    return true;
  }
};

window.DashboardLoader = DashboardLoader;
