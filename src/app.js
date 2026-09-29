/**
 * GeoFields - Spatial Analysis & Web Mapping Application
 * Conceived, designed, and developed by Ty Fields
 * 
 * Core GIS Engine (src/app.js)
 * License: Apache 2.0 / GPLv3 (See LICENSE and NOTICE files)
 */

document.addEventListener('DOMContentLoaded', () => {

  // 1. Initialize Map Instance
  const map = L.map('map', {
    center: [39.8283, -98.5795], // Centered on US Public Lands
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

  // 3. Add Location Search Bar (Leaflet Geosearch)
  const searchProvider = new GeoSearch.OpenStreetMapProvider();
  const searchControl = new GeoSearch.GeoSearchControl({
    provider: searchProvider,
    style: 'bar',
    showMarker: true,
    showPopup: false,
    autoClose: true,
    retainZoomLevel: false,
    animateZoom: true,
    keepResult: true,
    searchLabel: 'Search location, park, or coordinates...'
  });
  map.addControl(searchControl);

  // 4. Custom Marker Generators
  // Red Marker for Missing Persons Last Known Location (LKL)
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

  // Green Marker for National Parks
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

  // 5. Dataset 1: Missing Persons Database (NamUs Schema Compatible)
  const missingPersonsLayer = L.layerGroup();

  const missingPersonsData = [
    {
      id: "MP-NAMUS-84920",
      fullName: "Sample Case: John Doe",
      lklName: "Grand Canyon National Park - South Rim Trailhead",
      lat: 36.0544,
      lng: -112.1401,
      missingDate: "2024-06-12",
      ageAtDisappearance: "34",
      circumstances: "Subject was last seen departing South Kaibab Trailhead for a day hike toward Phantom Ranch. Failed to check back in at camping destination. Personal items recovered near Skeleton Point.",
      investigatingAgency: "Coconino County Sheriff's Office / NPS ISB",
      contactPhone: "(928) 679-8700"
    },
    {
      id: "MP-NAMUS-19204",
      fullName: "Sample Case: Jane Smith",
      lklName: "Yellowstone National Park - Lamar Valley",
      lat: 44.8722,
      lng: -110.2291,
      missingDate: "2023-09-28",
      ageAtDisappearance: "28",
      circumstances: "Vehicle found parked off US-212 near Rose Creek. Subject intended to photograph wildlife along the northern range. Extensive ground and aerial SAR searches conducted.",
      investigatingAgency: "National Park Service Investigative Services Branch (ISB)",
      contactPhone: "(888) 653-0009"
    }
  ];

  missingPersonsData.forEach(person => {
    const marker = L.marker([person.lat, person.lng], { icon: createRedLKLIcon() });

    const popupContent = `
      <div class="popup-container">
        <span class="popup-badge-mp">Missing Person - LKL</span>
        <h3>${person.fullName}</h3>
        <div class="popup-section"><strong>NamUs / Case ID:</strong> ${person.id}</div>
        <div class="popup-section"><strong>Last Known Location:</strong> ${person.lklName}</div>
        <div class="popup-section"><strong>Date Missing:</strong> ${person.missingDate} (Age: ${person.ageAtDisappearance})</div>
        <div class="popup-section"><strong>Circumstances:</strong> ${person.circumstances}</div>
        <hr style="border:none; border-top: 1px solid rgba(232, 220, 196, 0.2); margin: 8px 0;">
        <div class="popup-section"><strong>Investigating Agency:</strong> ${person.investigatingAgency}</div>
        <div class="popup-section"><strong>Contact Phone:</strong> ${person.contactPhone}</div>
      </div>
    `;

    marker.bindPopup(popupContent);
    missingPersonsLayer.addLayer(marker);
  });

  // 6. Dataset 2 & 3: National Parks (63 US Parks) & Park Contacts / Agencies
  const nationalParksLayer = L.layerGroup();

  const nationalParksData = [
    {
      parkName: "Grand Canyon National Park",
      parkCode: "GRCA",
      state: "AZ",
      lat: 36.1069,
      lng: -112.1129,
      acreage: "1,217,403",
      superintendent: "Park Superintendent Office",
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
      acreage: "2,219,791",
      superintendent: "Yellowstone Superintendent Office",
      phone: "(307) 344-7381",
      email: "yell_information@nps.gov",
      address: "PO Box 168, Yellowstone National Park, WY 82190",
      primarySARAgency: "Yellowstone NPS Law Enforcement & SAR Branch"
    },
    {
      parkName: "Yosemite National Park",
      parkCode: "YOSE",
      state: "CA",
      lat: 37.8651,
      lng: -119.5383,
      acreage: "759,620",
      superintendent: "Yosemite Park Headquarters",
      phone: "(209) 372-0200",
      email: "yose_information@nps.gov",
      address: "PO Box 577, Yosemite, CA 95389",
      primarySARAgency: "Yosemite Search and Rescue (YOSAR) / Mariposa Sheriff"
    }
  ];

  nationalParksData.forEach(park => {
    const marker = L.marker([park.lat, park.lng], { icon: createParkIcon() });

    const popupContent = `
      <div class="popup-container">
        <span class="popup-badge-park">US National Park</span>
        <h3>${park.parkName} (${park.parkCode})</h3>
        <div class="popup-section"><strong>State:</strong> ${park.state} | <strong>Size:</strong> ${park.acreage} acres</div>
        <hr style="border:none; border-top: 1px solid rgba(232, 220, 196, 0.2); margin: 8px 0;">
        <div style="font-weight:700; color:#E8DCC4; margin-bottom:4px;">Park Administration & Contacts</div>
        <div class="popup-section"><strong>Superintendent Contact:</strong> ${park.superintendent}</div>
        <div class="popup-section"><strong>Phone:</strong> ${park.phone}</div>
        <div class="popup-section"><strong>Email:</strong> ${park.email}</div>
        <div class="popup-section"><strong>Address:</strong> ${park.address}</div>
        <hr style="border:none; border-top: 1px solid rgba(232, 220, 196, 0.2); margin: 8px 0;">
        <div style="font-weight:700; color:#E8DCC4; margin-bottom:4px;">Assigned SAR & Investigating Agencies</div>
        <div class="popup-section"><strong>Primary Agency:</strong> ${park.primarySARAgency}</div>
      </div>
    `;

    marker.bindPopup(popupContent);
    nationalParksLayer.addLayer(marker);
  });

  // Automatically add layers to map
  missingPersonsLayer.addTo(map);
  nationalParksLayer.addTo(map);

  // 7. Layer Control Configuration
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

  console.log("GeoFields engine updated with dark forest green theme, location search, and structured SAR/Park datasets.");
});
