<template>
  <div class="professionals-page">
  <div class="container">
    <div class="row g-2 mb-3 align-items-center">
      <div class="col-12 col-md-6">
        <input ref="qInput" class="form-control" placeholder="Search clinics, e.g. psychologist near me" @keyup.enter="onSearch" />
      </div>
      <div class="col-auto d-flex gap-2">
        <button class="btn btn-primary" @click="onSearch">Search</button>
        <button class="btn btn-outline-secondary" @click="searchNearby">Nearby</button>
        <button class="btn btn-outline-secondary" @click="useMyLocation">Use my location</button>
      </div>
    </div>
    <div ref="mapEl" class="map-host"></div>
  </div>
  </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, ref } from 'vue';
import mapboxgl from 'mapbox-gl';
import MapboxDirections from '@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions';
import mbxGeocoding from '@mapbox/mapbox-sdk/services/geocoding';
import { fetchHealthPOIs } from '../services/overpass';

import 'mapbox-gl/dist/mapbox-gl.css';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';
import '@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions.css';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || 'pk.eyJ1Ijoid2VpamlheHVhbiIsImEiOiJjbWdvcHRtOWsxYXJpMnFxMmVzcXdyb3l0In0.swwDw3sMoaHHHYHZKXdCdQ';
mapboxgl.accessToken = MAPBOX_TOKEN;

const mapEl = ref(null);
const qInput = ref(null);
let map, geocodingClient, directions, markers = [];
const travelMode = ref('mapbox/driving');
const loading = ref(false);

function clearMarkers() { markers.forEach(m => m.remove()); markers = []; }

function fitToFeatures(features) {
  if (!features?.length) return;
  const bounds = new mapboxgl.LngLatBounds();
  features.forEach(f => bounds.extend(f.center || f.geometry?.coordinates));
  if (!bounds.isEmpty()) map.fitBounds(bounds, { padding: 40, duration: 500 });
}

function addClinicMarker(feature) {
  const [lng, lat] = feature.center || feature.geometry?.coordinates;
  const name = feature.text || feature.place_name?.split(',')[0] || 'Clinic';
  const address = feature.place_name || feature.properties?.address || '';
  const props = feature.properties || {};
  const phone = props.tel || props.phone || props["contact:phone"] || 'N/A';
  const website = props.website || props.url || 'N/A';
  const rating = props.rating || 'N/A';

  const marker = new mapboxgl.Marker({ color: '#d39219' }).setLngLat([lng, lat]).addTo(map);
  const popup = new mapboxgl.Popup({ offset: 16 }).setHTML(`
    <div style="min-width:240px">
      <div class="fw-semibold">${name}</div>
      <div class="small text-muted">${address}</div>
      <div class="mt-2 small">
        <div><b>Rating:</b> ${rating}</div>
        <div><b>Phone:</b> ${phone}</div>
        <div><b>Website:</b> ${website !== 'N/A' ? `<a href="${website}" target="_blank" rel="noopener">${website}</a>` : 'N/A'}</div>
      </div>
      <div class="mt-2 d-flex gap-2">
        <button class="btn btn-sm btn-primary" id="dirBtn">Directions</button>
      </div>
    </div>
  `);
  marker.setPopup(popup);
  marker.getElement().addEventListener('click', () => setTimeout(() => {
    const btn = document.getElementById('dirBtn');
    if (btn) btn.onclick = () => {
      directions.setProfile(travelMode.value);
      directions.setDestination([lng, lat]);
    };
  }, 0));
  markers.push(marker);
}

function bboxAround(center, km = 5) {
  const lat = center.lat, lon = center.lng;
  const dLat = km / 110.574;
  const dLon = km / (111.320 * Math.cos(lat * Math.PI / 180));
  return [lon - dLon, lat - dLat, lon + dLon, lat + dLat];
}

async function searchClinics(query, { bbox } = {}) {
  clearMarkers();
  loading.value = true;
  try {
    // Prefer Overpass (OSM) POIs for healthcare; bbox from map viewport for relevance
    const bb = bbox || currentMapBBox() || bboxAround(map.getCenter(), 7);
    let pois = await fetchHealthPOIs({ bbox: bb });
    const q = (query && query.trim()) ? query.trim().toLowerCase() : '';
    if (q) {
      pois = pois.filter(p => `${p.text} ${p.place_name}`.toLowerCase().includes(q));
    }
    // If still empty and user typed a generic term, try a wider bbox
    if (!pois.length && !q) {
      const center = map.getCenter();
      pois = await fetchHealthPOIs({ bbox: bboxAround(center, 12) });
    }
    if (!pois.length) console.warn('No clinics found for query:', query || '(nearby)');
    pois.forEach(addClinicMarker);
    fitToFeatures(pois);
  } catch (e) {
    console.error('Search error', e);
  } finally {
    loading.value = false;
  }
}

function currentMapBBox() {
  const b = map.getBounds();
  const arr = b.toArray().flat(); // [sw.lng, sw.lat, ne.lng, ne.lat]
  return arr;
}

function onSearch() {
  const q = qInput.value?.value?.trim();//为什么两个value：qInput	一个 Vue ref 对象（包装层）qInput.value	引用的实际 DOM 元素（即 <input> 标签）qInput.value.value	输入框中的文本内容（例如用户输入的 "hello"）
console.log('onSearch called with query:', q);
  const bbox = currentMapBBox();
  searchClinics(q, { bbox });
  
}

function searchNearby() {
  const bbox = currentMapBBox();
  searchClinics('clinic', { bbox });
}

function useMyLocation() {
  if (!navigator.geolocation) return alert('Geolocation not supported');
  navigator.geolocation.getCurrentPosition((pos) => {
    const center = [pos.coords.longitude, pos.coords.latitude];
    map.flyTo({ center, zoom: 13 });
    // Trigger nearby search at new viewport
    setTimeout(searchNearby, 600);
  }, (err) => alert('Failed to get location'));
}

onMounted(() => {
  geocodingClient = mbxGeocoding({ accessToken: MAPBOX_TOKEN });
  map = new mapboxgl.Map({
    container: mapEl.value,
    style: 'mapbox://styles/mapbox/streets-v12',
    center: [144.9631, -37.8136],
    zoom: 12,
    attributionControl: true
  });
  map.addControl(new mapboxgl.FullscreenControl(), 'top-right');
  map.addControl(new mapboxgl.NavigationControl(), 'top-right');
  map.addControl(new mapboxgl.GeolocateControl({ positionOptions: { enableHighAccuracy: true }, trackUserLocation: true }), 'top-right');

  directions = new MapboxDirections({
    accessToken: MAPBOX_TOKEN,
    unit: 'metric',
    profile: travelMode.value,
    controls: { instructions: true, profileSwitcher: true }
  });
  map.addControl(directions, 'top-left');
  // Try to use user's current position first
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((pos) => {
      const center = [pos.coords.longitude, pos.coords.latitude];
      map.setCenter(center);
      map.setZoom(13);
      searchClinics('clinic');
    }, () => {
      // Fallback to default center
      searchNearby();
    }, { enableHighAccuracy: true, timeout: 5000 });
  } else {
    searchNearby();
  }
});

onBeforeUnmount(() => {
  clearMarkers();
  if (map) map.remove();
});
</script>

<style scoped>
.professionals-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  color: #ffffff;
  padding-top: 80px; /* avoid overlap with fixed navbar and ensure background covers under navbar */
}

.map-host { 
  height: 72vh; 
  border-radius: 16px; 
  overflow: hidden; 
  border: 1px solid rgba(255,255,255,0.2);
  box-shadow: 0 20px 60px rgba(0,0,0,0.35); 
}
.fw-semibold { font-weight: 600; }
.btn { font-weight: 600; }

.form-control, .form-select {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #ffffff;
}
.form-control::placeholder { color: rgba(255, 255, 255, 0.7); }
.form-control:focus, .form-select:focus {
  background: rgba(255, 255, 255, 0.15);
  border-color: #4facfe;
  box-shadow: 0 0 0 0.2rem rgba(79, 172, 254, 0.25);
  color: #ffffff;
}

.btn-primary {
  background: linear-gradient(135deg, #CCCCCC, #006372);
  border: none;
  color: #ffffff;
  box-shadow: 0 4px 15px rgba(79, 172, 254, 0.3);
}
.btn-primary:hover { background: linear-gradient(135deg, #006372, #CCCCCC); color: #ffffff; }
.btn-outline-secondary { color: #ffffff; border-color: rgba(255,255,255,0.5); }
.btn-outline-secondary:hover { background: rgba(255,255,255,0.15); color: #ffffff; }

/* Ensure Mapbox popups use dark text on white background (page default text is white) */
:deep(.mapboxgl-popup-content) {
  color: #222 !important;
  background: #fff !important;
}
:deep(.mapboxgl-popup-close-button) {
  color: #000 !important;
}
:deep(.mapboxgl-popup-content a) {
  color: #0d6efd !important; /* bootstrap primary */
}
</style>
