/**
* GeoFields - Spatial Analysis & Web Mapping Application
* Conceived, designed, and developed by Ty Fields
*
* Module: Core Web GIS Map Engine (app.js)
* License: Apache 2.0 / GPLv3 (See LICENSE and NOTICE files)
*/

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Map Instance centered on US Public Lands
  const map = L.map('map', {
    center: [39.8283, -98.5795],
    zoom: 4,
    zoomControl: false // Reposition zoom control below header
  });

  // Re-add zoom control to top-right corner
  L.control.zoom({ position: 'topright' }).addTo(map);

  // 2. Define Base Map Layers
  const topoLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors | GeoFields by Ty Fields'
  });

  const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    maxZoom: 18,
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community | GeoFields'
  });

  const terrainLayer = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    maxZoom: 17,
    attribution: 'Map data: &copy; OpenStreetMap contributors, SRTM | Map style: &copy; OpenTopoMap (CC-BY-SA) | GeoFields'
  });

  // Set default layer
  topoLayer.addTo(map);

  // Add Layer Control
  const baseMaps = {
    "Topographic": topoLayer,
    "Terrain / Relief": terrainLayer,
    "Satellite Imagery": satelliteLayer
  };

  const overlayMaps = {}; // Future GeoJSON/SAR layers go here
  L.control.layers(baseMaps, overlayMaps, { position: 'topright' }).addTo(map);

  // 3. Custom Marker Styles for Incident & Feature Logging
  const createCustomIcon = (color = '#e74c3c') => {
    return L.divIcon({
      className: 'custom-map-pin',
      html: `<div style="
          background-color: ${color};
          width: 14px;
          height: 14px;
          border-radius: 50%;
          border: 2px solid #ffffff;
          box-shadow: 0 0 6px rgba(0,0,0,0.5);
        "></div>`,
        iconSize: [18, 18],
        iconAnchor: [9, 9]
    });
  };
// 4. Sample Incident Log (Data Schema Verification Placeholder)
  const sampleIncidents = [
    {
      id: "GF-001",
      name: "Grand Canyon National Park Region",
      lat: 36.1069,
      lng: -112.1129,
      status: "Verified Schema Marker",
      type: "Public Lands Incident Log"
    },
    {
      id: "GF-002",
      name: "Yellowstone National Park Region",
      lat: 44.4280,
      lng: -110.5885,
      status: "Verified Schema Marker",
      type: "Public Lands Incident Log"
    }
  ];

  // Add sample markers with spatial popups
  sampleIncidents.forEach(item => {
    const marker = L.marker([item.lat, item.lng], {
      icon: createCustomIcon('#e67e22')
    }).addTo(map);

    const popupContent = `
      <div style="font-family: sans-serif; padding: 4px;">
        <h4 style="margin: 0 0 4px 0; color: #2c3e50;">${item.name}</h4>
        <p style="margin: 0 0 2px 0; font-size: 0.8rem;"><strong>ID:</strong> ${item.id}</p>
        <p style="margin: 0 0 2px 0; font-size: 0.8rem;"><strong>Type:</strong> ${item.type}</p>
        <p style="margin: 0 0 4px 0; font-size: 0.8rem;"><strong>Status:</strong> ${item.status}</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 6px 0;">
        <span style="font-size: 0.7rem; color: #7f8c8d;">GeoFields Spatial Analysis System</span>
      </div>
    `;

    marker.bindPopup(popupContent);
  });

  // 5. Spatial Coordinate & Bounding Box Listener (For Search Queries)
  map.on('moveend', () => {
    const bounds = map.getBounds();
    const center = map.getCenter();
    console.log(`[GeoFields View Update] Center: ${center.lat.toFixed(4)}, ${center.lng.toFixed(4)} | Bounding Box: SW(${bounds.getSouthWest().lat.toFixed(4)}, ${bounds.getSouthWest().lng.toFixed(4)}) NE(${bounds.getNorthEast().lat.toFixed(4)}, ${bounds.getNorthEast().lng.toFixed(4)})`);
  });

  console.log("GeoFields Web Mapping Application initialized successfully.");
});  
