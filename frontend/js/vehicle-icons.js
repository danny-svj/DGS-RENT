// Tipos de vehiculo: icono (Material Symbols), color de acento, imagen de
// respaldo, especificaciones tipicas y promociones. Se usa en la landing, el
// portal de flota y el panel admin para los iconos, la insignia por
// categoria, el modal de detalle del vehiculo y las promociones.

const DGS_VEHICLE_TYPES = {
  Sedan: { icon: 'directions_car', color: 'var(--blue)', fallback: 'sedan-white.svg' },
  SUV: { icon: 'terrain', color: 'var(--gold)', fallback: 'suv-silver.svg' },
  Deportivo: { icon: 'sports_motorsports', color: 'var(--red)', fallback: 'deportivo-red.svg' },
  Van: { icon: 'airport_shuttle', color: 'var(--success)', fallback: 'van-white.svg' },
  Pickup: { icon: 'local_shipping', color: 'var(--ink-soft)', fallback: 'pickup-gray.svg' },
};

const DGS_SPECS = {
  Sedan: { seats: 5, bags: 2, transmission: 'Automatica', fuel: 'Gasolina', extra: ['Aire acondicionado', 'Bluetooth', 'Sensores de reversa'] },
  SUV: { seats: 5, bags: 4, transmission: 'Automatica', fuel: 'Gasolina', extra: ['Aire acondicionado', 'Bluetooth', 'Camara de reversa', 'Techo panoramico'] },
  Deportivo: { seats: 2, bags: 1, transmission: 'Automatica', fuel: 'Gasolina Premium', extra: ['Aire acondicionado', 'Bluetooth', 'Modo Sport', 'Asientos deportivos'] },
  Van: { seats: 12, bags: 6, transmission: 'Automatica', fuel: 'Diesel', extra: ['Aire acondicionado', 'Bluetooth', 'Camara de reversa', '3 filas de asientos'] },
  Pickup: { seats: 5, bags: 0, transmission: 'Automatica', fuel: 'Diesel', extra: ['Aire acondicionado', 'Bluetooth', 'Camara de reversa', 'Enganche para remolque', 'Caja de carga abierta'] },
};

// Promociones vigentes por placa (se muestran como listón en la tarjeta y en
// el detalle del vehiculo).
const DGS_PROMOS = {
  'DGS-004': { label: '-20% fin de semana', detail: 'Reserva de viernes a domingo y obten 20% de descuento.' },
  'DGS-007': { label: '-15% primera renta', detail: 'Valido para clientes nuevos en su primera reservacion.' },
  'DGS-011': { label: '-10% 5+ dias', detail: '10% de descuento en rentas de 5 dias o mas.' },
  'DGS-012': { label: '-20% fin de semana', detail: 'Reserva de viernes a domingo y obten 20% de descuento.' },
  'DGS-015': { label: '-10% tarifa eco', detail: 'Descuento especial en vehiculos de bajo consumo.' },
  'DGS-017': { label: '2x1 seguro premium', detail: 'Agrega proteccion total sin costo extra en tu segunda renta.' },
  'DGS-020': { label: 'Tarifa corporativa', detail: 'Precio preferente para cuentas empresariales registradas.' },
  'DGS-023': { label: '-15% primera renta', detail: 'Valido para clientes nuevos en su primera reservacion.' },
};

function dgsVehicleType(category) {
  return DGS_VEHICLE_TYPES[category] || DGS_VEHICLE_TYPES.Sedan;
}
function dgsVehicleSpecs(category) {
  return DGS_SPECS[category] || DGS_SPECS.Sedan;
}
function dgsVehiclePromo(plate) {
  return DGS_PROMOS[plate] || null;
}
function dgsVehicleFallbackImage(category, base) {
  return (base || 'assets/cars/') + dgsVehicleType(category).fallback;
}

// Icono inline para usar junto al texto de categoria (car-meta, tablas, etc.)
function dgsVehicleIconInline(category) {
  const t = dgsVehicleType(category);
  return `<span class="material-symbols-rounded veh-icon-inline" style="color:${t.color}" aria-hidden="true">${t.icon}</span>`;
}

// Insignia circular con el icono del tipo de vehiculo para la esquina de la tarjeta.
function dgsVehicleBadge(category) {
  const t = dgsVehicleType(category);
  return `<span class="car-type-badge" style="background:${t.color}" title="${category}"><span class="material-symbols-rounded" aria-hidden="true">${t.icon}</span></span>`;
}

// Liston de promocion para la tarjeta de la flota (vacio si no aplica).
function dgsPromoRibbon(plate) {
  const promo = dgsVehiclePromo(plate);
  if (!promo) return '';
  return `<span class="car-promo-ribbon"><span class="material-symbols-rounded" aria-hidden="true">local_offer</span>${promo.label}</span>`;
}

const DGS_STATUS_TEXT = { available: 'Disponible', rented: 'Rentado', maintenance: 'Mantenimiento' };

function dgsVehicleDetailHtml(v, imgBase) {
  const t = dgsVehicleType(v.category);
  const specs = dgsVehicleSpecs(v.category);
  const promo = dgsVehiclePromo(v.plate);
  const img = v.image_url || dgsVehicleFallbackImage(v.category, imgBase);
  const statusText = DGS_STATUS_TEXT[v.status] || v.status;
  const chips = specs.extra
    .map((e) => `<span class="vd-chip"><span class="material-symbols-rounded" aria-hidden="true">check_circle</span>${e}</span>`)
    .join('');
  return `
    <div class="vd-media">
      <img src="${img}" alt="${v.brand} ${v.model}" />
      <span class="car-badge badge-${v.status}">${statusText}</span>
      ${dgsVehicleBadge(v.category)}
      ${promo ? `<span class="vd-promo-ribbon"><span class="material-symbols-rounded" aria-hidden="true">local_offer</span>${promo.label}</span>` : ''}
    </div>
    <div class="vd-info">
      <div class="vd-head">
        <h3>${v.brand} ${v.model} <span>${v.year}</span></h3>
        <div class="vd-price"><b>${dgsFormatMoney(v.daily_price)}</b><span>por dia</span></div>
      </div>
      <div class="vd-specs">
        <div class="vd-spec"><span class="material-symbols-rounded" aria-hidden="true">event_seat</span>${specs.seats} asientos</div>
        <div class="vd-spec"><span class="material-symbols-rounded" aria-hidden="true">luggage</span>${specs.bags} maletas</div>
        <div class="vd-spec"><span class="material-symbols-rounded" aria-hidden="true">local_gas_station</span>${specs.fuel}</div>
        <div class="vd-spec"><span class="material-symbols-rounded" aria-hidden="true">settings</span>${specs.transmission}</div>
      </div>
      <div class="vd-chips">${chips}</div>
      ${
        promo
          ? `<div class="vd-promo-box"><span class="material-symbols-rounded" aria-hidden="true">sell</span><div><b>${promo.label}</b><span>${promo.detail}</span></div></div>`
          : ''
      }
      <div class="vd-meta"><span>${dgsVehicleIconInline(v.category)} ${v.category}</span><span><span class="material-symbols-rounded veh-icon-inline" aria-hidden="true">tag</span>${v.plate}</span></div>
      <div class="vd-actions" id="vd-actions"></div>
    </div>`;
}

function dgsOpenVehicleDetail(v, imgBase, actionHtml) {
  const modal = document.getElementById('vehicle-detail-modal');
  const body = document.getElementById('vd-body');
  if (!modal || !body) return;
  body.innerHTML = dgsVehicleDetailHtml(v, imgBase);
  const actions = document.getElementById('vd-actions');
  if (actions) actions.innerHTML = actionHtml || '';
  modal.classList.add('show');
  document.body.style.overflow = 'hidden';
}

function dgsCloseVehicleDetail() {
  const modal = document.getElementById('vehicle-detail-modal');
  if (modal) modal.classList.remove('show');
  document.body.style.overflow = '';
}

document.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById('vehicle-detail-modal');
  if (!modal) return;
  const closeBtn = document.getElementById('vd-close');
  if (closeBtn) closeBtn.addEventListener('click', dgsCloseVehicleDetail);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) dgsCloseVehicleDetail();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('show')) dgsCloseVehicleDetail();
  });
});
