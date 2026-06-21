/**
 * FoodRescue — Map Picker + Cascading Location Dropdowns
 * Uses Leaflet.js + OpenStreetMap (FREE, no API key)
 * Uses Nominatim for reverse geocoding (FREE)
 */

// ── Styles injected into <head> ────────────────────────────────────────────
(function injectStyles() {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
  document.head.appendChild(link);

  const style = document.createElement('style');
  style.textContent = `
    .fr-map-modal {
      display:none; position:fixed; inset:0; z-index:99999;
      background:rgba(0,0,0,0.65); backdrop-filter:blur(4px);
      align-items:center; justify-content:center; padding:16px;
    }
    .fr-map-modal.open { display:flex; }
    .fr-map-box {
      background:#fff; border-radius:20px; width:100%; max-width:600px;
      overflow:hidden; box-shadow:0 24px 64px rgba(0,0,0,0.3);
      display:flex; flex-direction:column; max-height:90vh;
    }
    .fr-map-header {
      background:#006c49; color:#fff; padding:14px 18px;
      display:flex; align-items:center; gap:10px;
    }
    .fr-map-header h3 { font-size:16px; font-weight:700; flex:1; font-family:Inter,sans-serif; }
    .fr-map-close {
      background:rgba(255,255,255,0.15); border:none; border-radius:8px;
      color:#fff; width:32px; height:32px; cursor:pointer;
      font-family:'Material Symbols Outlined'; font-size:20px;
      display:flex; align-items:center; justify-content:center;
    }
    #fr-leaflet-map { flex:1; min-height:320px; }
    .fr-map-footer {
      padding:14px 18px; border-top:1px solid #e8f0e9;
      display:flex; flex-direction:column; gap:8px;
    }
    .fr-map-addr-preview {
      font-size:13px; color:#3c4a42; font-family:Inter,sans-serif;
      background:#f4fbf4; border-radius:8px; padding:8px 12px;
      min-height:36px; border:1px solid #bbcabf;
    }
    .fr-map-confirm {
      background:#006c49; color:#fff; border:none; border-radius:999px;
      padding:12px 24px; font-size:14px; font-weight:700; cursor:pointer;
      font-family:Inter,sans-serif; transition:filter 0.15s;
    }
    .fr-map-confirm:hover { filter:brightness(1.1); }
    .fr-loc-select {
      width:100%; background:#F3F4F6; border:0; border-bottom:2px solid #bbcabf;
      border-radius:8px 8px 0 0; padding:12px; font-size:14px;
      font-family:Inter,sans-serif; color:#161d19; appearance:none;
      cursor:pointer; transition:border-color 0.2s;
      background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M7 10l5 5 5-5z' fill='%236c7a71'/%3E%3C/svg%3E");
      background-repeat:no-repeat; background-position:right 10px center; background-size:20px;
    }
    .fr-loc-select:focus { outline:none; border-bottom-color:#006c49; }
    .fr-loc-select:disabled { opacity:0.5; cursor:not-allowed; }
    .fr-tab-btn {
      flex:1; padding:10px; border:2px solid #bbcabf; background:#fff;
      border-radius:10px; font-size:13px; font-weight:600; cursor:pointer;
      font-family:Inter,sans-serif; color:#3c4a42; transition:all 0.2s;
      display:flex; align-items:center; justify-content:center; gap:6px;
    }
    .fr-tab-btn.active { background:#006c49; color:#fff; border-color:#006c49; }
    .fr-tab-row { display:flex; gap:10px; margin-bottom:16px; }
    .fr-address-panel { display:none; }
    .fr-address-panel.active { display:block; }

    /* Live tracking pulse */
    .live-dot {
      width:14px; height:14px; border-radius:50%;
      background:#10b981; box-shadow:0 0 0 0 rgba(16,185,129,0.7);
      animation:livePulse 1.5s infinite;
    }
    @keyframes livePulse {
      0% { box-shadow:0 0 0 0 rgba(16,185,129,0.7); }
      70% { box-shadow:0 0 0 10px rgba(16,185,129,0); }
      100% { box-shadow:0 0 0 0 rgba(16,185,129,0); }
    }
    .fr-tracking-panel {
      background:#fff; border-radius:16px; border:2px solid #e8f0e9;
      overflow:hidden; margin-top:12px;
    }
    #fr-tracking-map { height:280px; }
  `;
  document.head.appendChild(style);
})();

// ── Load Leaflet JS ─────────────────────────────────────────────────────────
function loadLeaflet(cb) {
  if (window.L) { cb(); return; }
  const s = document.createElement('script');
  s.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
  s.onload = cb;
  document.head.appendChild(s);
}

// ── Map Picker ──────────────────────────────────────────────────────────────
let _pickerMap = null, _pickerMarker = null, _pickerCallback = null;

function openMapPicker(onConfirm) {
  _pickerCallback = onConfirm;
  const modal = document.getElementById('fr-map-modal');
  modal.classList.add('open');

  loadLeaflet(() => {
    if (_pickerMap) { _pickerMap.invalidateSize(); return; }

    const defaultLat = 19.076, defaultLng = 72.877; // Mumbai
    _pickerMap = L.map('fr-leaflet-map').setView([defaultLat, defaultLng], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(_pickerMap);

    const greenIcon = L.divIcon({
      html: `<span class="material-symbols-outlined" style="color:#006c49;font-size:36px;font-variation-settings:'FILL' 1;text-shadow:0 2px 8px rgba(0,0,0,0.3)">location_on</span>`,
      iconSize: [36, 36], iconAnchor: [18, 36], className: ''
    });

    _pickerMarker = L.marker([defaultLat, defaultLng], { draggable: true, icon: greenIcon }).addTo(_pickerMap);
    reverseGeocode(defaultLat, defaultLng);

    _pickerMap.on('click', (e) => {
      _pickerMarker.setLatLng(e.latlng);
      reverseGeocode(e.latlng.lat, e.latlng.lng);
    });

    _pickerMarker.on('dragend', (e) => {
      const ll = e.target.getLatLng();
      reverseGeocode(ll.lat, ll.lng);
    });

    // Try to use user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        _pickerMap.setView([lat, lng], 15);
        _pickerMarker.setLatLng([lat, lng]);
        reverseGeocode(lat, lng);
      }, () => {});
    }
  });
}

let _lastGeoResult = null;
async function reverseGeocode(lat, lng) {
  const preview = document.getElementById('fr-map-addr-preview');
  if (preview) preview.textContent = 'Fetching address…';
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
      { headers: { 'Accept-Language': 'en' } }
    );
    const data = await res.json();
    _lastGeoResult = data;
    const addr = data.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
    if (preview) preview.textContent = addr;
  } catch {
    if (preview) preview.textContent = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
  }
}

function confirmMapPicker() {
  if (_pickerCallback && _lastGeoResult) {
    const ll = _pickerMarker.getLatLng();
    _pickerCallback({
      lat: ll.lat, lng: ll.lng,
      displayAddress: _lastGeoResult.display_name,
      address: _lastGeoResult.address || {}
    });
  }
  closeMapPicker();
}

function closeMapPicker() {
  document.getElementById('fr-map-modal').classList.remove('open');
}

// ── Map Modal HTML injected into page ──────────────────────────────────────
function injectMapModal() {
  if (document.getElementById('fr-map-modal')) return;
  const modal = document.createElement('div');
  modal.id = 'fr-map-modal';
  modal.className = 'fr-map-modal';
  modal.innerHTML = `
    <div class="fr-map-box">
      <div class="fr-map-header">
        <span class="material-symbols-outlined" style="font-variation-settings:'FILL' 1">map</span>
        <h3>Pick Location on Map</h3>
        <button class="fr-map-close" onclick="closeMapPicker()">close</button>
      </div>
      <div id="fr-leaflet-map"></div>
      <div class="fr-map-footer">
        <div class="fr-map-addr-preview" id="fr-map-addr-preview">Tap on the map to select a location</div>
        <button class="fr-map-confirm" onclick="confirmMapPicker()">
          ✅ Confirm This Location
        </button>
      </div>
    </div>
  `;
  modal.addEventListener('click', (e) => { if (e.target === modal) closeMapPicker(); });
  document.body.appendChild(modal);
}

// ── Location Dropdowns ─────────────────────────────────────────────────────
function populateSelect(el, options, placeholder) {
  el.innerHTML = `<option value="" disabled selected>${placeholder}</option>`;
  options.forEach(opt => {
    const o = document.createElement('option');
    o.value = opt; o.textContent = opt;
    el.appendChild(o);
  });
  el.disabled = false;
}

// ── Build Address Section HTML ─────────────────────────────────────────────
function buildAddressHTML(prefix, inputClass) {
  const cls = inputClass || 'bg-[#F3F4F6] border-0 border-b-2 border-outline-variant focus:border-primary focus:ring-0 rounded-t-lg p-3 w-full transition-all font-family-inter';
  return `
  <!-- Tab switcher: Map / Manual -->
  <div class="fr-tab-row">
    <button type="button" class="fr-tab-btn active" id="${prefix}-tab-map" onclick="switchAddrTab('${prefix}','map')">
      <span class="material-symbols-outlined" style="font-size:18px;font-variation-settings:'FILL' 1">map</span> Pick on Map
    </button>
    <button type="button" class="fr-tab-btn" id="${prefix}-tab-manual" onclick="switchAddrTab('${prefix}','manual')">
      <span class="material-symbols-outlined" style="font-size:18px">edit</span> Type Manually
    </button>
  </div>

  <!-- Map panel -->
  <div class="fr-address-panel active" id="${prefix}-panel-map">
    <div style="background:#f4fbf4;border:2px dashed #bbcabf;border-radius:14px;padding:16px;text-align:center;cursor:pointer"
         onclick="openMapPicker(function(r){applyMapResult('${prefix}',r)})">
      <span class="material-symbols-outlined" style="color:#006c49;font-size:40px;font-variation-settings:'FILL' 1">add_location_alt</span>
      <p style="color:#006c49;font-weight:700;font-size:14px;font-family:Inter,sans-serif;margin:6px 0 2px">Tap to Open Map</p>
      <p style="color:#3c4a42;font-size:12px;font-family:Inter,sans-serif">Click to drop a pin on the map</p>
    </div>
    <div id="${prefix}-map-result" style="display:none;margin-top:10px;padding:10px 14px;background:#e8f0e9;border-radius:10px;font-family:Inter,sans-serif;font-size:13px;color:#161d19">
      <strong>📍 Selected:</strong> <span id="${prefix}-map-addr"></span>
    </div>
  </div>

  <!-- Manual panel -->
  <div class="fr-address-panel" id="${prefix}-panel-manual">
    <div class="grid grid-cols-1 gap-3">
      <div>
        <label style="font-size:12px;font-weight:600;color:#3c4a42;font-family:Inter,sans-serif">Country</label>
        <select id="${prefix}-country" class="fr-loc-select" onchange="onCountryChange('${prefix}')">
          <option value="" disabled selected>Select Country</option>
        </select>
      </div>
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label style="font-size:12px;font-weight:600;color:#3c4a42;font-family:Inter,sans-serif">State / Province</label>
          <select id="${prefix}-state" class="fr-loc-select" disabled onchange="onStateChange('${prefix}')">
            <option value="" disabled selected>Select State</option>
          </select>
        </div>
        <div>
          <label style="font-size:12px;font-weight:600;color:#3c4a42;font-family:Inter,sans-serif">City</label>
          <select id="${prefix}-city" class="fr-loc-select" disabled>
            <option value="" disabled selected>Select City</option>
          </select>
        </div>
      </div>
      <div>
        <label style="font-size:12px;font-weight:600;color:#3c4a42;font-family:Inter,sans-serif">Street / Building / Area</label>
        <input id="${prefix}-street" type="text" placeholder="e.g. 123 Main St, Bandra West"
          style="width:100%;background:#F3F4F6;border:0;border-bottom:2px solid #bbcabf;border-radius:8px 8px 0 0;padding:12px;font-size:14px;font-family:Inter,sans-serif;box-sizing:border-box;outline:none;transition:border-color 0.2s"
          onfocus="this.style.borderBottomColor='#006c49'" onblur="this.style.borderBottomColor='#bbcabf'"/>
      </div>
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label style="font-size:12px;font-weight:600;color:#3c4a42;font-family:Inter,sans-serif">Pincode / ZIP</label>
          <input id="${prefix}-pincode" type="text" placeholder="e.g. 400050"
            style="width:100%;background:#F3F4F6;border:0;border-bottom:2px solid #bbcabf;border-radius:8px 8px 0 0;padding:12px;font-size:14px;font-family:Inter,sans-serif;box-sizing:border-box;outline:none;transition:border-color 0.2s"
            onfocus="this.style.borderBottomColor='#006c49'" onblur="this.style.borderBottomColor='#bbcabf'"/>
        </div>
        <div>
          <label style="font-size:12px;font-weight:600;color:#3c4a42;font-family:Inter,sans-serif">Landmark</label>
          <input id="${prefix}-landmark" type="text" placeholder="Near ..."
            style="width:100%;background:#F3F4F6;border:0;border-bottom:2px solid #bbcabf;border-radius:8px 8px 0 0;padding:12px;font-size:14px;font-family:Inter,sans-serif;box-sizing:border-box;outline:none;transition:border-color 0.2s"
            onfocus="this.style.borderBottomColor='#006c49'" onblur="this.style.borderBottomColor='#bbcabf'"/>
        </div>
      </div>
    </div>
  </div>
  `;
}

// ── Tab switching ──────────────────────────────────────────────────────────
function switchAddrTab(prefix, tab) {
  ['map','manual'].forEach(t => {
    document.getElementById(`${prefix}-tab-${t}`)?.classList.toggle('active', t === tab);
    document.getElementById(`${prefix}-panel-${t}`)?.classList.toggle('active', t === tab);
  });
}

// ── Apply map result ───────────────────────────────────────────────────────
function applyMapResult(prefix, result) {
  const resultEl = document.getElementById(`${prefix}-map-result`);
  const addrEl = document.getElementById(`${prefix}-map-addr`);
  if (resultEl && addrEl) {
    addrEl.textContent = result.displayAddress;
    resultEl.style.display = 'block';
  }
  // Also populate manual fields from reverse geocode result
  const a = result.address;
  if (document.getElementById(`${prefix}-street`))
    document.getElementById(`${prefix}-street`).value =
      [a.road, a.suburb, a.neighbourhood].filter(Boolean).join(', ');
  if (document.getElementById(`${prefix}-pincode`))
    document.getElementById(`${prefix}-pincode`).value = a.postcode || '';
}

// ── Cascading dropdowns ────────────────────────────────────────────────────
const LOCATION_DATA = {
  "India": {
    "Andhra Pradesh": ["Visakhapatnam","Vijayawada","Guntur","Nellore","Kurnool","Tirupati","Kakinada","Rajahmundry","Kadapa","Anantapur"],
    "Arunachal Pradesh": ["Itanagar","Naharlagun","Pasighat"],
    "Assam": ["Guwahati","Silchar","Dibrugarh","Jorhat","Nagaon","Tinsukia","Tezpur"],
    "Bihar": ["Patna","Gaya","Bhagalpur","Muzaffarpur","Purnia","Darbhanga","Arrah","Begusarai"],
    "Chhattisgarh": ["Raipur","Bhilai","Bilaspur","Korba","Durg","Rajnandgaon"],
    "Goa": ["Panaji","Margao","Vasco da Gama","Mapusa","Ponda"],
    "Gujarat": ["Ahmedabad","Surat","Vadodara","Rajkot","Bhavnagar","Jamnagar","Gandhinagar","Junagadh","Anand"],
    "Haryana": ["Faridabad","Gurgaon","Panipat","Ambala","Yamunanagar","Rohtak","Hisar","Karnal","Sonipat"],
    "Himachal Pradesh": ["Shimla","Mandi","Solan","Dharamsala","Baddi","Palampur"],
    "Jharkhand": ["Ranchi","Jamshedpur","Dhanbad","Bokaro","Deoghar","Hazaribagh"],
    "Karnataka": ["Bengaluru","Mysuru","Mangaluru","Hubballi","Belagavi","Davangere","Ballari","Vijayapura","Shimoga","Tumkur"],
    "Kerala": ["Thiruvananthapuram","Kochi","Kozhikode","Thrissur","Kollam","Palakkad","Alappuzha","Kottayam","Kannur"],
    "Madhya Pradesh": ["Bhopal","Indore","Jabalpur","Gwalior","Ujjain","Sagar","Ratlam","Dewas","Satna"],
    "Maharashtra": ["Mumbai","Pune","Nagpur","Nashik","Aurangabad","Solapur","Kolhapur","Amravati","Nanded","Thane","Kalyan","Vasai","Bhiwandi"],
    "Manipur": ["Imphal","Thoubal","Bishnupur","Churachandpur"],
    "Meghalaya": ["Shillong","Tura","Jowai"],
    "Mizoram": ["Aizawl","Lunglei","Champhai"],
    "Nagaland": ["Kohima","Dimapur","Mokokchung"],
    "Odisha": ["Bhubaneswar","Cuttack","Rourkela","Berhampur","Sambalpur","Puri","Balasore"],
    "Punjab": ["Ludhiana","Amritsar","Jalandhar","Patiala","Bathinda","Mohali","Firozpur","Pathankot"],
    "Rajasthan": ["Jaipur","Jodhpur","Kota","Bikaner","Ajmer","Udaipur","Bhilwara","Alwar","Bharatpur"],
    "Sikkim": ["Gangtok","Namchi","Mangan"],
    "Tamil Nadu": ["Chennai","Coimbatore","Madurai","Tiruchirappalli","Salem","Tirunelveli","Tiruppur","Erode","Vellore"],
    "Telangana": ["Hyderabad","Warangal","Nizamabad","Khammam","Karimnagar","Secunderabad"],
    "Tripura": ["Agartala","Udaipur","Dharmanagar"],
    "Uttar Pradesh": ["Lucknow","Kanpur","Agra","Varanasi","Meerut","Allahabad","Bareilly","Aligarh","Moradabad","Ghaziabad","Noida","Mathura"],
    "Uttarakhand": ["Dehradun","Haridwar","Roorkee","Haldwani","Rudrapur","Rishikesh"],
    "West Bengal": ["Kolkata","Asansol","Siliguri","Durgapur","Bardhaman","Malda","Kharagpur"],
    "Delhi": ["New Delhi","North Delhi","South Delhi","East Delhi","West Delhi","Dwarka","Rohini"],
    "Chandigarh": ["Chandigarh"],
    "Puducherry": ["Puducherry","Karaikal","Mahe"],
    "Jammu & Kashmir": ["Srinagar","Jammu","Anantnag","Baramulla","Udhampur"],
    "Ladakh": ["Leh","Kargil"],
    "Andaman & Nicobar Islands": ["Port Blair"],
    "Lakshadweep": ["Kavaratti"]
  },
  "United States": {
    "California": ["Los Angeles","San Francisco","San Diego","San Jose","Sacramento","Oakland"],
    "New York": ["New York City","Buffalo","Rochester","Albany","Syracuse"],
    "Texas": ["Houston","Dallas","Austin","San Antonio","Fort Worth","El Paso"],
    "Florida": ["Miami","Orlando","Tampa","Jacksonville","St. Petersburg"],
    "Illinois": ["Chicago","Springfield","Rockford","Joliet","Aurora"],
    "Georgia": ["Atlanta","Augusta","Columbus","Savannah"],
    "North Carolina": ["Charlotte","Raleigh","Greensboro","Durham"]
  },
  "United Kingdom": {
    "England": ["London","Birmingham","Manchester","Leeds","Liverpool","Sheffield","Bristol"],
    "Scotland": ["Edinburgh","Glasgow","Aberdeen","Dundee","Inverness"],
    "Wales": ["Cardiff","Swansea","Newport"],
    "Northern Ireland": ["Belfast","Derry","Lisburn"]
  },
  "Australia": {
    "New South Wales": ["Sydney","Newcastle","Wollongong"],
    "Victoria": ["Melbourne","Geelong","Ballarat"],
    "Queensland": ["Brisbane","Gold Coast","Townsville","Cairns"],
    "Western Australia": ["Perth","Fremantle","Bunbury"],
    "South Australia": ["Adelaide","Mount Gambier"]
  },
  "Canada": {
    "Ontario": ["Toronto","Ottawa","Mississauga","Brampton","Hamilton","London"],
    "Quebec": ["Montreal","Quebec City","Laval","Gatineau"],
    "British Columbia": ["Vancouver","Surrey","Burnaby","Kelowna"],
    "Alberta": ["Calgary","Edmonton","Red Deer","Lethbridge"]
  },
  "Pakistan": {
    "Punjab": ["Lahore","Faisalabad","Rawalpindi","Gujranwala","Multan"],
    "Sindh": ["Karachi","Hyderabad","Sukkur","Larkana"],
    "Khyber Pakhtunkhwa": ["Peshawar","Mardan","Abbottabad"]
  },
  "Bangladesh": {
    "Dhaka Division": ["Dhaka","Gazipur","Narayanganj"],
    "Chittagong Division": ["Chittagong","Cox's Bazar","Comilla"],
    "Rajshahi Division": ["Rajshahi","Bogra"]
  },
  "UAE": {
    "Dubai": ["Dubai","Deira","Bur Dubai","Jumeirah","Al Barsha","Business Bay"],
    "Abu Dhabi": ["Abu Dhabi City","Al Ain","Khalifa City","Mussafah"],
    "Sharjah": ["Sharjah City","Al Majaz","Al Khan"]
  },
  "Singapore": {
    "Central Region": ["Downtown Core","Orchard","Marina Bay","Queenstown"],
    "East Region": ["Tampines","Pasir Ris","Bedok","Changi"],
    "West Region": ["Jurong East","Jurong West","Clementi","Choa Chu Kang"],
    "North Region": ["Woodlands","Yishun","Sembawang"],
    "North-East Region": ["Punggol","Sengkang","Hougang"]
  },
  "Nepal": {
    "Bagmati Province": ["Kathmandu","Lalitpur","Bhaktapur","Hetauda"],
    "Gandaki Province": ["Pokhara","Baglung","Gorkha"],
    "Lumbini Province": ["Butwal","Bhairahawa","Nepalgunj"]
  },
  "Sri Lanka": {
    "Western Province": ["Colombo","Negombo","Kalutara"],
    "Central Province": ["Kandy","Nuwara Eliya","Matale"],
    "Southern Province": ["Galle","Matara"]
  },
  "Germany": {
    "Bavaria": ["Munich","Nuremberg","Augsburg","Regensburg"],
    "North Rhine-Westphalia": ["Cologne","Düsseldorf","Dortmund","Essen"],
    "Berlin": ["Berlin"],
    "Hamburg": ["Hamburg"]
  },
  "France": {
    "Île-de-France": ["Paris","Versailles","Saint-Denis"],
    "Auvergne-Rhône-Alpes": ["Lyon","Grenoble","Saint-Étienne"],
    "Provence-Alpes-Côte d'Azur": ["Marseille","Nice","Toulon","Cannes"]
  },
  "Other": { "Other": ["Other"] }
};

function onCountryChange(prefix) {
  const country = document.getElementById(`${prefix}-country`).value;
  const stateEl = document.getElementById(`${prefix}-state`);
  const cityEl = document.getElementById(`${prefix}-city`);
  const states = Object.keys(LOCATION_DATA[country] || {});
  populateSelect(stateEl, states, 'Select State / Province');
  cityEl.innerHTML = '<option value="" disabled selected>Select City</option>';
  cityEl.disabled = true;
}

function onStateChange(prefix) {
  const country = document.getElementById(`${prefix}-country`).value;
  const state = document.getElementById(`${prefix}-state`).value;
  const cities = LOCATION_DATA[country]?.[state] || [];
  populateSelect(document.getElementById(`${prefix}-city`), cities, 'Select City');
}

function initCountryDropdown(prefix) {
  const el = document.getElementById(`${prefix}-country`);
  if (!el) return;
  populateSelect(el, Object.keys(LOCATION_DATA), 'Select Country');
  el.disabled = false;
}

// ── Live Tracking (Volunteer) ───────────────────────────────────────────────
let _trackingMap = null, _trackingMarker = null, _trackingWatch = null;

function initLiveTracking(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  loadLeaflet(() => {
    if (_trackingMap) return;
    _trackingMap = L.map(containerId).setView([19.076, 72.877], 14);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors', maxZoom: 19
    }).addTo(_trackingMap);

    const pulseIcon = L.divIcon({
      html: `<div style="position:relative">
        <div class="live-dot"></div>
        <div style="position:absolute;top:-2px;left:-2px;width:18px;height:18px;border-radius:50%;border:3px solid #006c49;background:rgba(16,185,129,0.2)"></div>
      </div>`,
      iconSize: [14, 14], iconAnchor: [7, 7], className: ''
    });

    if (navigator.geolocation) {
      _trackingWatch = navigator.geolocation.watchPosition(
        (pos) => {
          const { latitude: lat, longitude: lng } = pos.coords;
          if (!_trackingMarker) {
            _trackingMarker = L.marker([lat, lng], { icon: pulseIcon }).addTo(_trackingMap);
            _trackingMap.setView([lat, lng], 16);
          } else {
            _trackingMarker.setLatLng([lat, lng]);
          }
          document.getElementById('vol-lat').textContent = lat.toFixed(6);
          document.getElementById('vol-lng').textContent = lng.toFixed(6);
          document.getElementById('vol-acc').textContent = Math.round(pos.coords.accuracy) + 'm';
        },
        (err) => {
          console.warn('Geolocation error:', err.message);
          document.getElementById('vol-tracking-status').textContent = '⚠️ Location access denied';
        },
        { enableHighAccuracy: true, maximumAge: 5000 }
      );
    }
  });
}

function stopTracking() {
  if (_trackingWatch !== null) navigator.geolocation.clearWatch(_trackingWatch);
  document.getElementById('vol-tracking-status').textContent = '⏸ Tracking paused';
}

// ── Init all address sections on page load ─────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  injectMapModal();
  // Auto-init for known prefixes
  ['rest', 'ngo', 'vol'].forEach(prefix => initCountryDropdown(prefix));
});
