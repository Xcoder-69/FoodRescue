/**
 * FoodRescue — Location Data
 * Country → State → City cascading dropdown data
 */
const LOCATION_DATA = {
  "India": {
    "Andhra Pradesh": ["Visakhapatnam","Vijayawada","Guntur","Nellore","Kurnool","Tirupati","Kakinada","Rajahmundry","Kadapa","Anantapur"],
    "Arunachal Pradesh": ["Itanagar","Naharlagun","Pasighat","Tezpur"],
    "Assam": ["Guwahati","Silchar","Dibrugarh","Jorhat","Nagaon","Tinsukia","Tezpur","Bongaigaon"],
    "Bihar": ["Patna","Gaya","Bhagalpur","Muzaffarpur","Purnia","Darbhanga","Arrah","Begusarai","Katihar","Munger"],
    "Chhattisgarh": ["Raipur","Bhilai","Bilaspur","Korba","Durg","Rajnandgaon","Jagdalpur"],
    "Goa": ["Panaji","Margao","Vasco da Gama","Mapusa","Ponda"],
    "Gujarat": ["Ahmedabad","Surat","Vadodara","Rajkot","Bhavnagar","Jamnagar","Gandhinagar","Junagadh","Anand","Navsari"],
    "Haryana": ["Faridabad","Gurgaon","Panipat","Ambala","Yamunanagar","Rohtak","Hisar","Karnal","Sonipat","Panchkula"],
    "Himachal Pradesh": ["Shimla","Mandi","Solan","Dharamsala","Baddi","Palampur","Bilaspur"],
    "Jharkhand": ["Ranchi","Jamshedpur","Dhanbad","Bokaro","Deoghar","Hazaribagh","Giridih"],
    "Karnataka": ["Bengaluru","Mysuru","Mangaluru","Hubballi","Belagavi","Davangere","Ballari","Vijayapura","Shimoga","Tumkur"],
    "Kerala": ["Thiruvananthapuram","Kochi","Kozhikode","Thrissur","Kollam","Palakkad","Alappuzha","Kottayam","Kannur","Malappuram"],
    "Madhya Pradesh": ["Bhopal","Indore","Jabalpur","Gwalior","Ujjain","Sagar","Ratlam","Dewas","Satna","Rewa"],
    "Maharashtra": ["Mumbai","Pune","Nagpur","Nashik","Aurangabad","Solapur","Kolhapur","Amravati","Nanded","Thane","Kalyan","Vasai","Bhiwandi"],
    "Manipur": ["Imphal","Thoubal","Bishnupur","Churachandpur"],
    "Meghalaya": ["Shillong","Tura","Jowai"],
    "Mizoram": ["Aizawl","Lunglei","Champhai"],
    "Nagaland": ["Kohima","Dimapur","Mokokchung"],
    "Odisha": ["Bhubaneswar","Cuttack","Rourkela","Berhampur","Sambalpur","Puri","Balasore","Bhadrak"],
    "Punjab": ["Ludhiana","Amritsar","Jalandhar","Patiala","Bathinda","Mohali","Firozpur","Pathankot","Hoshiarpur"],
    "Rajasthan": ["Jaipur","Jodhpur","Kota","Bikaner","Ajmer","Udaipur","Bhilwara","Alwar","Bharatpur","Sikar"],
    "Sikkim": ["Gangtok","Namchi","Mangan"],
    "Tamil Nadu": ["Chennai","Coimbatore","Madurai","Tiruchirappalli","Salem","Tirunelveli","Tiruppur","Erode","Vellore","Thoothukudi"],
    "Telangana": ["Hyderabad","Warangal","Nizamabad","Khammam","Karimnagar","Ramagundam","Secunderabad"],
    "Tripura": ["Agartala","Udaipur","Dharmanagar"],
    "Uttar Pradesh": ["Lucknow","Kanpur","Agra","Varanasi","Meerut","Allahabad","Bareilly","Aligarh","Moradabad","Saharanpur","Ghaziabad","Noida","Mathura","Firozabad"],
    "Uttarakhand": ["Dehradun","Haridwar","Roorkee","Haldwani","Rudrapur","Kashipur","Rishikesh"],
    "West Bengal": ["Kolkata","Asansol","Siliguri","Durgapur","Bardhaman","Malda","Baharampur","Habra","Kharagpur","Shantipur"],
    "Delhi": ["New Delhi","North Delhi","South Delhi","East Delhi","West Delhi","Central Delhi","Dwarka","Rohini","Janakpuri","Lajpat Nagar"],
    "Chandigarh": ["Chandigarh"],
    "Puducherry": ["Puducherry","Karaikal","Mahe","Yanam"],
    "Jammu & Kashmir": ["Srinagar","Jammu","Anantnag","Baramulla","Udhampur"],
    "Ladakh": ["Leh","Kargil"],
    "Andaman & Nicobar Islands": ["Port Blair"],
    "Dadra & Nagar Haveli": ["Silvassa"],
    "Daman & Diu": ["Daman","Diu"],
    "Lakshadweep": ["Kavaratti"]
  },
  "United States": {
    "California": ["Los Angeles","San Francisco","San Diego","San Jose","Sacramento","Oakland","Fresno","Long Beach"],
    "New York": ["New York City","Buffalo","Rochester","Albany","Syracuse","Yonkers"],
    "Texas": ["Houston","Dallas","Austin","San Antonio","Fort Worth","El Paso","Arlington","Plano"],
    "Florida": ["Miami","Orlando","Tampa","Jacksonville","St. Petersburg","Tallahassee","Fort Lauderdale"],
    "Illinois": ["Chicago","Springfield","Rockford","Joliet","Aurora","Naperville"],
    "Pennsylvania": ["Philadelphia","Pittsburgh","Allentown","Erie","Reading","Scranton"],
    "Ohio": ["Columbus","Cleveland","Cincinnati","Toledo","Akron","Dayton"],
    "Georgia": ["Atlanta","Augusta","Columbus","Savannah","Athens","Macon"],
    "North Carolina": ["Charlotte","Raleigh","Greensboro","Durham","Winston-Salem","Fayetteville"],
    "Michigan": ["Detroit","Grand Rapids","Warren","Sterling Heights","Ann Arbor","Lansing"]
  },
  "United Kingdom": {
    "England": ["London","Birmingham","Manchester","Leeds","Liverpool","Sheffield","Bristol","Newcastle","Nottingham","Southampton"],
    "Scotland": ["Edinburgh","Glasgow","Aberdeen","Dundee","Inverness","Stirling"],
    "Wales": ["Cardiff","Swansea","Newport","Bangor","St Davids"],
    "Northern Ireland": ["Belfast","Derry","Lisburn","Newry","Armagh"]
  },
  "Australia": {
    "New South Wales": ["Sydney","Newcastle","Wollongong","Maitland","Albury","Wagga Wagga"],
    "Victoria": ["Melbourne","Geelong","Ballarat","Bendigo","Shepparton","Melton"],
    "Queensland": ["Brisbane","Gold Coast","Townsville","Cairns","Toowoomba","Sunshine Coast"],
    "Western Australia": ["Perth","Fremantle","Bunbury","Geraldton","Kalgoorlie"],
    "South Australia": ["Adelaide","Mount Gambier","Whyalla","Victor Harbor"],
    "Tasmania": ["Hobart","Launceston","Devonport","Burnie"]
  },
  "Canada": {
    "Ontario": ["Toronto","Ottawa","Mississauga","Brampton","Hamilton","London","Markham","Vaughan","Kitchener","Windsor"],
    "Quebec": ["Montreal","Quebec City","Laval","Gatineau","Longueuil","Sherbrooke"],
    "British Columbia": ["Vancouver","Surrey","Burnaby","Richmond","Kelowna","Abbotsford","Coquitlam"],
    "Alberta": ["Calgary","Edmonton","Red Deer","Lethbridge","St. Albert","Medicine Hat"],
    "Manitoba": ["Winnipeg","Brandon","Steinbach","Thompson"],
    "Saskatchewan": ["Saskatoon","Regina","Prince Albert","Moose Jaw"]
  },
  "Pakistan": {
    "Punjab": ["Lahore","Faisalabad","Rawalpindi","Gujranwala","Multan","Sialkot","Bahawalpur","Sargodha"],
    "Sindh": ["Karachi","Hyderabad","Sukkur","Larkana","Nawabshah","Mirpur Khas"],
    "Khyber Pakhtunkhwa": ["Peshawar","Mardan","Abbottabad","Mingora","Kohat","Dera Ismail Khan"],
    "Balochistan": ["Quetta","Turbat","Khuzdar","Hub","Gwadar"]
  },
  "Bangladesh": {
    "Dhaka Division": ["Dhaka","Gazipur","Narayanganj","Manikganj","Munshiganj"],
    "Chittagong Division": ["Chittagong","Cox's Bazar","Comilla","Feni","Brahmanbaria"],
    "Rajshahi Division": ["Rajshahi","Bogra","Naogaon","Natore","Chapainawabganj"],
    "Khulna Division": ["Khulna","Jessore","Satkhira","Kushtia","Bagerhat"]
  },
  "Nepal": {
    "Bagmati Province": ["Kathmandu","Lalitpur","Bhaktapur","Hetauda","Bharatpur"],
    "Gandaki Province": ["Pokhara","Baglung","Gorkha","Lamjung","Mustang"],
    "Lumbini Province": ["Butwal","Bhairahawa","Tulsipur","Nepalgunj"],
    "Koshi Province": ["Biratnagar","Dharan","Itahari","Birtamod"]
  },
  "Sri Lanka": {
    "Western Province": ["Colombo","Negombo","Kalutara","Gampaha"],
    "Central Province": ["Kandy","Nuwara Eliya","Matale"],
    "Southern Province": ["Galle","Matara","Hambantota"],
    "Northern Province": ["Jaffna","Mannar","Vavuniya"]
  },
  "Singapore": {
    "Central Region": ["Downtown Core","Orchard","Marina Bay","Queenstown","Toa Payoh"],
    "East Region": ["Tampines","Pasir Ris","Bedok","Changi","Paya Lebar"],
    "West Region": ["Jurong East","Jurong West","Bukit Batok","Clementi","Choa Chu Kang"],
    "North Region": ["Woodlands","Yishun","Sembawang","Mandai"],
    "North-East Region": ["Punggol","Sengkang","Hougang","Serangoon"]
  },
  "UAE": {
    "Dubai": ["Dubai","Deira","Bur Dubai","Jumeirah","Al Barsha","Business Bay","Downtown Dubai"],
    "Abu Dhabi": ["Abu Dhabi City","Al Ain","Khalifa City","Mussafah","Yas Island"],
    "Sharjah": ["Sharjah City","Al Majaz","Al Khan","Al Nahda"],
    "Ajman": ["Ajman City","Al Rashidiya","Al Nuaimia"],
    "Fujairah": ["Fujairah City","Dibba","Kalba"],
    "Ras Al Khaimah": ["RAK City","Al Hamra","Khuzam"],
    "Umm Al Quwain": ["UAQ City","Al Salamah"]
  },
  "Germany": {
    "Bavaria": ["Munich","Nuremberg","Augsburg","Regensburg","Ingolstadt","Würzburg"],
    "North Rhine-Westphalia": ["Cologne","Düsseldorf","Dortmund","Essen","Duisburg","Bochum","Wuppertal","Bielefeld"],
    "Baden-Württemberg": ["Stuttgart","Karlsruhe","Mannheim","Freiburg","Heidelberg","Ulm"],
    "Hesse": ["Frankfurt","Wiesbaden","Kassel","Darmstadt","Offenbach"],
    "Berlin": ["Berlin"],
    "Hamburg": ["Hamburg"],
    "Saxony": ["Dresden","Leipzig","Chemnitz","Zwickau"]
  },
  "France": {
    "Île-de-France": ["Paris","Versailles","Boulogne-Billancourt","Saint-Denis","Argenteuil","Montreuil"],
    "Auvergne-Rhône-Alpes": ["Lyon","Grenoble","Saint-Étienne","Clermont-Ferrand","Chambéry"],
    "Provence-Alpes-Côte d'Azur": ["Marseille","Nice","Toulon","Aix-en-Provence","Cannes"],
    "Occitanie": ["Toulouse","Montpellier","Nîmes","Perpignan","Béziers"],
    "Nouvelle-Aquitaine": ["Bordeaux","Limoges","Pau","Bayonne","Périgueux"]
  },
  "Other": {
    "Other": ["Other"]
  }
};

/**
 * Populate a <select> element with options from an array
 */
function populateSelect(selectEl, options, placeholder) {
  selectEl.innerHTML = `<option value="" disabled selected>${placeholder}</option>`;
  options.forEach(opt => {
    const o = document.createElement('option');
    o.value = opt;
    o.textContent = opt;
    selectEl.appendChild(o);
  });
  selectEl.disabled = false;
}

/**
 * Initialize cascading Country → State → City dropdowns
 * Call this after DOM is ready.
 */
function initLocationDropdowns() {
  const countryEl = document.getElementById('loc-country');
  const stateEl   = document.getElementById('loc-state');
  const cityEl    = document.getElementById('loc-city');

  if (!countryEl || !stateEl || !cityEl) return;

  // Populate countries
  populateSelect(countryEl, Object.keys(LOCATION_DATA), 'Select Country');
  stateEl.disabled = true;
  cityEl.disabled  = true;

  countryEl.addEventListener('change', () => {
    const states = Object.keys(LOCATION_DATA[countryEl.value] || {});
    populateSelect(stateEl, states, 'Select State / Province');
    cityEl.innerHTML = '<option value="" disabled selected>Select City</option>';
    cityEl.disabled = true;
  });

  stateEl.addEventListener('change', () => {
    const cities = LOCATION_DATA[countryEl.value]?.[stateEl.value] || [];
    populateSelect(cityEl, cities, 'Select City');
  });
}

document.addEventListener('DOMContentLoaded', initLocationDropdowns);
