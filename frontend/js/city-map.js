// Mapa 3D de sucursales: clic en una ciudad abre un modal con MapLibre GL en 3D.
document.addEventListener('DOMContentLoaded', () => {
  // ---------- AOS (Animate On Scroll) ----------
  if (window.AOS) {
    AOS.init({
      duration: 700,
      easing: 'ease-out-cubic',
      once: true,
      offset: 40,
    });
  }

  const backdrop = document.getElementById('map-modal-backdrop');
  const mapEl = document.getElementById('map-3d');
  const closeBtn = document.getElementById('map-modal-close');
  const titleEl = document.getElementById('map-modal-title');
  if (!backdrop || !mapEl || typeof maplibregl === 'undefined') return;

  let map = null;
  let marker = null;

  function ensureMap(lng, lat) {
    if (map) return map;
    map = new maplibregl.Map({
      container: 'map-3d',
      style: 'https://tiles.openfreemap.org/styles/liberty',
      center: [lng, lat],
      zoom: 13.5,
      pitch: 60,
      bearing: -17.6,
      antialias: true,
      attributionControl: true,
    });
    map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), 'top-right');

    map.on('load', () => {
      mapEl.classList.remove('loading');
      try {
        const layers = map.getStyle().layers || [];
        const labelLayer = layers.find((l) => l.type === 'symbol' && l.layout && l.layout['text-field']);
        if (!map.getLayer('dgs-3d-buildings')) {
          map.addLayer(
            {
              id: 'dgs-3d-buildings',
              source: 'openmaptiles',
              'source-layer': 'building',
              type: 'fill-extrusion',
              minzoom: 13,
              paint: {
                'fill-extrusion-color': '#c3cfe9',
                'fill-extrusion-height': ['coalesce', ['get', 'render_height'], 14],
                'fill-extrusion-base': ['coalesce', ['get', 'render_min_height'], 0],
                'fill-extrusion-opacity': 0.9,
              },
            },
            labelLayer ? labelLayer.id : undefined
          );
        }
      } catch (e) {
        // Estilo sin capa de edificios disponible: el mapa sigue funcionando en 3D (pitch/bearing).
      }
    });

    map.on('error', () => {
      mapEl.classList.remove('loading');
    });

    return map;
  }

  function flyTo(city, lng, lat) {
    mapEl.classList.add('loading');
    const m = ensureMap(lng, lat);
    if (marker) marker.remove();
    marker = new maplibregl.Marker({ color: '#e0342c' }).setLngLat([lng, lat]).addTo(m);

    if (m.loaded()) {
      mapEl.classList.remove('loading');
    }
    m.flyTo({
      center: [lng, lat],
      zoom: 13.5,
      pitch: 60,
      bearing: -17.6,
      duration: 1800,
      essential: true,
    });
  }

  function openMapModal(city, lng, lat) {
    titleEl.textContent = `Sucursal DGS — ${city}`;
    backdrop.classList.add('show');
    document.body.style.overflow = 'hidden';
    flyTo(city, lng, lat);
    setTimeout(() => {
      if (map) map.resize();
    }, 260);
  }

  function closeMapModal() {
    backdrop.classList.remove('show');
    document.body.style.overflow = '';
  }

  document.querySelectorAll('.city-chip[data-city]').forEach((chip) => {
    const open = () => {
      const city = chip.getAttribute('data-city');
      const lat = parseFloat(chip.getAttribute('data-lat'));
      const lng = parseFloat(chip.getAttribute('data-lng'));
      openMapModal(city, lng, lat);
    };
    chip.addEventListener('click', open);
    chip.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        open();
      }
    });
  });

  closeBtn.addEventListener('click', closeMapModal);
  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) closeMapModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && backdrop.classList.contains('show')) closeMapModal();
  });
});
