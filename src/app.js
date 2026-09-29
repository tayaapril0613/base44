/**
 * GeoFields - Spatial Analysis & Web Mapping Application
 * Conceived, designed, and developed by Ty Fields
 * 
 * Core Web GIS Engine & Data Form Manager (src/app.js)
 * License: Apache 2.0 / GPLv3 (See LICENSE and NOTICE files)
 */

let map;
let missingPersonsLayer;
let nationalParksLayer;

// Core Data Repositories
const missingPersonsData = [
  {
    id: "MP-NAMUS-84920",
    fullName: "John Doe (Sample)",
    lklName: "Grand Canyon National Park - South Rim Trailhead",
    lat: 36.0544,
    lng: -112.1401,
    missingDate: "2024-06-12",
    ageAtDisappearance: "34",
    circumstances: "Subject departed South Kaibab Trailhead for a day hike toward Phantom Ranch. Failed to return. Personal pack recovered near Skeleton Point.",
    weatherTemp: "104°F High / 68°F Low",
    weatherPrecip: "0.00 in (Extreme Heat)",
    weatherWind: "SW 15 mph (Gusts 25 mph)",
    weatherVisibility: "Clear / Low Humidity",
    investigatingAgency: "Coconino County Sheriff's Office / NPS ISB",
    contactPhone: "(928) 679-8700"
  },
  {
    id: "MP-NAMUS-19204",
    fullName: "Jane Smith (Sample)",
    lklName: "Yellowstone National Park - Lamar Valley",
    lat: 44.8722,
    lng: -110.2291,
    missingDate: "2023-09-28",
    ageAtDisappearance: "28",
    circumstances: "Vehicle found parked off US-212 near Rose Creek. Intended to conduct wildlife photography along northern range.",
    weatherTemp: "42°F High / 22°F Low",
    weatherPrecip: "0.35 in (Early Snow Flurries)",
    weatherWind: "NW 22 mph",
    weatherVisibility: "Overcast / Fog in Valleys",
    investigatingAgency: "National Park Service Investigative Services Branch (ISB)",
    contactPhone: "(888) 653-0009"
  }
];

const nationalParksData = [
  {
    parkName: "Grand Canyon National Park",
    parkCode: "GRCA",
    state: "AZ",
    lat: 36.1069,
    lng: -112.1129,
    superintendent: "Grand Canyon Superintendent Office",
    phone: "(928) 638-7888",
    email: "grca_information@nps.gov",
    address: "PO Box 129, Grand Canyon, AZ 86023",
    primarySARAgency: "NPS Search and Rescue / Coconino County SAR"
  },
  {
    parkName: "Yellowstone National Park",
    parkCode: "YELL",
    state: "WY / MT / ID",
    lat: 44.4280,
    lng: -110.5885,
    superintendent: "Yellowstone Superintendent Office",
    phone: "(307) 344-7381",
    email: "yell_information@nps.gov",
    address: "PO Box 168, Yellowstone National Park, WY 82190",
    primarySARAgency: "Yellowstone NPS Law Enforcement & SAR Branch"
  }
];

document.addEventListener('DOMContentLoaded', () => {

  // 1. Initialize Leaflet Map Instance
  map = L.map('map', {
    center: [39.8283, -98.5795],
    zoom: 4,
    zoomControl: false
  });

  L.control.zoom({ position: 'topright' }).addTo(map);

  // 2. Base Tile Layers
  const topoLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors | GeoFields by Ty Fields'
  });

  const terrainLayer = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    maxZoom: 17,
    attribution: 'Map data: &copy; OpenStreetMap | Style: &copy; OpenTopoMap | GeoFields'
  });

  const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    maxZoom: 18,
    attribution: 'Tiles &copy; Esri &mdash; Earthstar Geographics | GeoFields'
  });

  topoLayer.addTo(map);

  // 3. Location Search Bar
  const searchProvider = new GeoSearch.OpenStreetMapProvider();
  const searchControl = new GeoSearch.GeoSearchControl({
    provider: searchProvider,
    style: 'bar',
    showMarker: true,
    showPopup: false,
    autoClose: true,
    keepResult: true,
    searchLabel: 'Search location, park, or coordinates...'
  });
  map.addControl(searchControl);

  // 4. Initialize Data Layers
  missingPersonsLayer = L.layerGroup().addTo(map);
  nationalParksLayer = L.layerGroup().addTo(map);

  // Render Initial Datasets
  renderAllData();

  // 5. Layer Control Setup
  const baseMaps = {
    "Topographic Map": topoLayer,
    "Terrain / Relief": terrainLayer,
    "Satellite Imagery": satelliteLayer
  };

  const overlayMaps = {
    "Red: Missing Persons (LKL)": missingPersonsLayer,
    "Green: US National Parks & Contacts": nationalParksLayer
  };

  L.control.layers(baseMaps, overlayMaps, { position: 'topright' }).addTo(map);
});

// Custom Icon Generators
const createRedLKLIcon = () => {
  return L.divIcon({
    className: 'custom-red-pin',
    html: `<div style="
      background-color: #D9383A;
      width: 16px;
      height: 16px;
      border-radius: 50%;
      border: 2px solid #FFFFFF;
      box-shadow: 0 0 8px rgba(0,0,0,0.7);
    "></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10]
  });
};

const createParkIcon = () => {
  return L.divIcon({
    className: 'custom-park-pin',
    html: `<div style="
      background-color: #27ae60;
      width: 14px;
      height: 14px;
      border-radius: 3px;
      border: 2px solid #E8DCC4;
      box-shadow: 0 0 6px rgba(0,0,0,0.6);
    "></div>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9]
  });
};

// Render Datasets to Map & Right Directory Panel
function renderAllData() {
  missingPersonsLayer.clearLayers();
  nationalParksLayer.clearLayers();

  const directoryList = document.getElementById('directory-list');
  if (directoryList) directoryList.innerHTML = '';

  // Render Missing Persons
  missingPersonsData.forEach((person, idx) => {
    const marker = L.marker([person.lat, person.lng], { icon: createRedLKLIcon() });

    const popupContent = `
      <div class="popup-container">
        <span class="popup-badge-mp">Missing Person - LKL</span>
        <h3 style="margin:4px 0;">${person.fullName}</h3>
        <div style="font-size:0.85rem; margin-bottom:4px;"><strong>NamUs ID:</strong> ${person.id} | <strong>Age:</strong> ${person.ageAtDisappearance || 'N/A'}</div>
        <div style="font-size:0.85rem;"><strong>LKL Location:</strong> ${person.lklName}</div>
        <div style="font-size:0.85rem;"><strong>Date Missing:</strong> ${person.missingDate}</div>
        <div style="font-size:0.85rem; margin-top:4px;"><strong>Circumstances:</strong> ${person.circumstances}</div>
        
        <div class="weather-box">
          <div class="weather-box-title">⛅ Historical Weather on Date Missing (${person.missingDate})</div>
          <div><strong>Temperature:</strong> ${person.weatherTemp || 'Recorded in log'}</div>
          <div><strong>Precipitation:</strong> ${person.weatherPrecip || 'None'}</div>
          <div><strong>Wind / Sky:</strong> ${person.weatherWind || 'N/A'} (${person.weatherVisibility || 'N/A'})</div>
        </div>

        <hr style="border:none; border-top: 1px solid rgba(232, 220, 196, 0.2); margin: 8px 0;">
        <div style="font-size:0.85rem;"><strong>Investigating Agency:</strong> ${person.investigatingAgency}</div>
        <div style="font-size:0.85rem;"><strong>Contact Phone:</strong> ${person.contactPhone}</div>
      </div>
    `;

    marker.bindPopup(popupContent);
    missingPersonsLayer.addLayer(marker);

    // Add to Directory List
    if (directoryList) {
      const card = document.createElement('div');
      card.className = 'data-card';
      card.onclick = () => focusMapLocation(person.lat, person.lng, marker);
      card.innerHTML = `
        <span class="badge-mp">Missing Person</span>
        <div class="data-card-title">${person.fullName} (${person.id})</div>
        <div class="data-card-sub">📍 ${person.lklName}</div>
        <div class="data-card-sub">🗓️ Date Missing: ${person.missingDate}</div>
      `;
      directoryList.appendChild(card);
    }
  });

  // Render National Parks
  nationalParksData.forEach((park, idx) => {
    const marker = L.marker([park.lat, park.lng], { icon: createParkIcon() });

    const popupContent = `
      <div class="popup-container">
        <span class="popup-badge-park">US National Park</span>
        <h3 style="margin:4px 0;">${park.parkName} (${park.parkCode})</h3>
        <div style="font-size:0.85rem;"><strong>State:</strong> ${park.state}</div>
        <hr style="border:none; border-top: 1px solid rgba(232, 220, 196, 0.2); margin: 6px 0;">
        <div style="font-weight:700; font-size:0.85rem;">Superintendent Office & Contacts</div>
        <div style="font-size:0.85rem;">${park.superintendent}</div>
        <div style="font-size:0.85rem;"><strong>Phone:</strong> ${park.phone}</div>
        <div style="font-size:0.85rem;"><strong>Email:</strong> ${park.email}</div>
        <div style="font-size:0.85rem;"><strong>Address:</strong> ${park.address}</div>
        <hr style="border:none; border-top: 1px solid rgba(232, 220, 196, 0.2); margin: 6px 0;">
        <div style="font-size:0.85rem;"><strong>Primary SAR Agency:</strong> ${park.primarySARAgency}</div>
      </div>
    `;

    marker.bindPopup(popupContent);
    nationalParksLayer.addLayer(marker);

    // Add to Directory List
    if (directoryList) {
      const card = document.createElement('div');
      card.className = 'data-card';
      card.onclick = () => focusMapLocation(park.lat, park.lng, marker);
      card.innerHTML = `
        <span class="badge-park">National Park</span>
        <div class="data-card-title">${park.parkName} (${park.parkCode})</div>
        <div class="data-card-sub">📞 ${park.phone}</div>
        <div class="data-card-sub">🚨 SAR: ${park.primarySARAgency}</div>
      `;
      directoryList.appendChild(card);
    }
  });
}

// Form Submission Handlers
function handleMissingPersonSubmit(e) {
  e.preventDefault();

  const newRecord = {
    fullName: document.getElementById('mp-name').value,
    id: document.getElementById('mp-id').value,
    ageAtDisappearance: document.getElementById('mp-age').value,
    missingDate: document.getElementById('mp-date').value,
    lklName: document.getElementById('mp-lkl').value,
    lat: parseFloat(document.getElementById('mp-lat').value),
    lng: parseFloat(document.getElementById('mp-lng').value),
    circumstances: document.getElementById('mp-circumstances').value || "No detailed summary provided.",
    weatherTemp: document.getElementById('mp-weather-temp').value || "Not specified",
    weatherPrecip: document.getElementById('mp-weather-precip').value || "Not specified",
    weatherWind: document.getElementById('mp-weather-wind').value || "Not specified",
    weatherVisibility: document.getElementById('mp-weather-visibility').value || "Not specified",
    investigatingAgency: document.getElementById('mp-agency').value || "Pending Assignment",
    contactPhone: document.getElementById('mp-agency-phone').value || "N/A"
  };

  missingPersonsData.unshift(newRecord);
  renderAllData();

  // Center map on new point
  map.setView([newRecord.lat, newRecord.lng], 10);

  // Reset Form
  document.getElementById('form-mp').reset();
  alert(`Missing person record for ${newRecord.fullName} added successfully.`);
}

function handleParkSubmit(e) {
  e.preventDefault();

  const newPark = {
    parkName: document.getElementById('park-name').value,
    parkCode: document.getElementById('park-code').value,
    state: document.getElementById('park-state').value,
    lat: parseFloat(document.getElementById('park-lat').value),
    lng: parseFloat(document.getElementById('park-lng').value),
    superintendent: document.getElementById('park-superintendent').value || "Superintendent Headquarters",
    phone: document.getElementById('park-phone').value || "N/A",
    email: document.getElementById('park-email').value || "N/A",
    address: document.getElementById('park-address').value || "N/A",
    primarySARAgency: document.getElementById('park-sar-agency').value || "NPS Law Enforcement / Local Sheriff"
  };

  nationalParksData.unshift(newPark);
  renderAllData();

  // Center map on new park point
  map.setView([newPark.lat, newPark.lng], 9);

  // Reset Form
  document.getElementById('form-park').reset();
  alert(`Park record for ${newPark.parkName} added successfully.`);
}

// UI Panel & Tab Functions
function togglePanel(panelId) {
  const panel = document.getElementById(panelId);
  if (!panel) return;

  if (panelId === 'panel-left') {
    panel.classList.toggle('collapsed-left');
  } else if (panelId === 'panel-right') {
    panel.classList.toggle('collapsed-right');
  }

  setTimeout(() => { map.invalidateSize(); }, 350);
}

function switchTab(tabId, btn) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

  btn.classList.add('active');
  document.getElementById(tabId).classList.add('active');
}

function focusMapLocation(lat, lng, marker) {
  map.setView([lat, lng], 11, { animate: true });
  marker.openPopup();
}

function filterDirectory() {
  const query = document.getElementById('directory-search').value.toLowerCase();
  const cards = document.querySelectorAll('.data-card');

  cards.forEach(card => {
    const text = card.innerText.toLowerCase();
    card.style.display = text.includes(query) ? 'block' : 'none';
  });
}
