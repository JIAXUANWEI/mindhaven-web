// Simple Overpass API client for health-related POIs within a bbox
// bbox: [west, south, east, north]
export async function fetchHealthPOIs({ bbox, timeoutSec = 25 }) {
  if (!bbox || bbox.length !== 4) throw new Error('bbox must be [west, south, east, north]');
  const [w, s, e, n] = bbox;
  const q = `
    [out:json][timeout:${timeoutSec}];
    (
      node["amenity"~"hospital|clinic|doctors|dentist|pharmacy"](${s},${w},${n},${e});
      way["amenity"~"hospital|clinic|doctors|dentist|pharmacy"](${s},${w},${n},${e});
      relation["amenity"~"hospital|clinic|doctors|dentist|pharmacy"](${s},${w},${n},${e});
    );
    out center tags;
  `;
  const url = "https://overpass-api.de/api/interpreter";
  const resp = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
    body: new URLSearchParams({ data: q })
  });
  if (!resp.ok) {
    const text = await resp.text().catch(() => '');
    throw new Error(`Overpass error ${resp.status}: ${text}`);
  }
  const data = await resp.json();
  const elements = Array.isArray(data?.elements) ? data.elements : [];
  // Normalize to a simple feature-like object list
  return elements.map(el => {
    const lat = el.lat ?? el.center?.lat;
    const lon = el.lon ?? el.center?.lon;
    const tags = el.tags || {};
    const name = tags.name || tags["official_name"] || 'Unnamed';
    const addressParts = [
      tags["addr:housenumber"],
      tags["addr:street"],
      tags["addr:suburb"],
      tags["addr:city"],
      tags["addr:state"],
      tags["addr:postcode"],
      tags["addr:country"],
    ].filter(Boolean);
    const place_name = addressParts.join(', ');
    return {
      id: el.id,
      center: [lon, lat],
      text: name,
      place_name,
      properties: tags,
    };
  }).filter(f => Array.isArray(f.center) && f.center.every(v => typeof v === 'number'));
}

