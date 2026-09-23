const user = dgsGuard('user');
if (user) {
  document.getElementById('user-name').textContent = user.name;
  document.getElementById('user-email').textContent = user.email;
  document.getElementById('avatar').textContent = dgsInitials(user.name);
}

let selectedVehicle = null;
let vehiclesCache = [];

function vehicleCard(v) {
  const badgeClass = `badge-${v.status}`;
  const badgeText = { available: 'Disponible', rented: 'Rentado', maintenance: 'Mantenimiento' }[v.status];
  const disabled = v.status !== 'available';
  return `
    <div class="car-card tilt" onclick="dgsShowFleetDetail(${v.id})">
      <div class="car-media">
        <img src="${v.image_url || dgsVehicleFallbackImage(v.category, '../assets/cars/')}" alt="${v.brand} ${v.model}" />
        <span class="car-badge ${badgeClass}">${badgeText}</span>
        ${dgsVehicleBadge(v.category)}
        ${dgsPromoRibbon(v.plate)}
      </div>
      <div class="car-body">
        <h4>${v.brand} ${v.model} ${v.year}</h4>
        <div class="car-meta"><span>${dgsVehicleIconInline(v.category)} ${v.category}</span><span><i class="ph-bold ph-hash"></i> ${v.plate}</span></div>
        <div class="car-price"><b>${dgsFormatMoney(v.daily_price)}</b><span>por dia</span></div>
        <button class="btn btn-primary btn-block btn-sm" ${disabled ? 'disabled' : ''} onclick="event.stopPropagation(); openReserveModal(${v.id})">
          ${disabled ? 'No disponible' : 'Reservar'}
        </button>
      </div>
    </div>`;
}

function dgsFleetReserveActionHtml(v) {
  const disabled = v.status !== 'available';
  return `<button class="btn btn-primary" ${disabled ? 'disabled' : ''} onclick="dgsCloseVehicleDetail(); openReserveModal(${v.id})">
    ${disabled ? 'No disponible' : 'Reservar este vehiculo'}
  </button>`;
}

function dgsShowFleetDetail(id) {
  const v = vehiclesCache.find((x) => x.id === id);
  if (!v) return;
  dgsOpenVehicleDetail(v, '../assets/cars/', dgsFleetReserveActionHtml(v));
}

async function loadFleet() {
  const grid = document.getElementById('fleet-grid');
  const params = {};
  const category = document.getElementById('f-category').value;
  const status = document.getElementById('f-status').value;
  const maxPrice = document.getElementById('f-price').value;
  if (category) params.category = category;
  if (status) params.status = status;
  if (maxPrice) params.maxPrice = maxPrice;

  try {
    const { vehicles } = await DGS.vehicles.list(params);
    vehiclesCache = vehicles;
    if (!vehicles.length) {
      grid.innerHTML = '<div class="empty-state"><div class="ic"><i class="ph-bold ph-car"></i></div>No hay vehiculos que coincidan con tu busqueda.</div>';
      return;
    }
    grid.innerHTML = vehicles.map(vehicleCard).join('');
  } catch (err) {
    grid.innerHTML = `<div class="empty-state"><div class="ic"><i class="ph-bold ph-plug"></i></div>${err.message}</div>`;
  }
}

function openReserveModal(vehicleOrId) {
  const vehicle = typeof vehicleOrId === 'object' ? vehicleOrId : vehiclesCache.find((x) => x.id === vehicleOrId);
  if (!vehicle) return;
  selectedVehicle = vehicle;
  dgsCloseVehicleDetail();
  document.getElementById('reserve-vehicle-info').innerHTML = `
    <div style="display:flex;gap:12px;align-items:center">
      <img src="${vehicle.image_url || dgsVehicleFallbackImage(vehicle.category, '../assets/cars/')}" style="width:70px;height:56px;object-fit:contain;background:linear-gradient(180deg,#fff,#f5f7ff);border-radius:10px;padding:4px" />
      <div><b>${vehicle.brand} ${vehicle.model}</b><br/><span style="color:var(--ink-soft);font-size:0.85rem">${dgsVehicleIconInline(vehicle.category)} ${vehicle.category} · ${dgsFormatMoney(vehicle.daily_price)} / dia</span></div>
    </div>`;
  document.getElementById('reserve-alert').classList.remove('show');
  document.getElementById('reserve-form').reset();
  document.getElementById('reserve-modal').classList.add('show');
}
function closeReserveModal() {
  document.getElementById('reserve-modal').classList.remove('show');
}

document.getElementById('reserve-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const alertEl = document.getElementById('reserve-alert');
  const btn = document.getElementById('reserve-submit');
  alertEl.classList.remove('show');
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span> Reservando...';

  try {
    const start_date = document.getElementById('start_date').value;
    const end_date = document.getElementById('end_date').value;
    await DGS.reservations.create({ vehicle_id: selectedVehicle.id, start_date, end_date });
    closeReserveModal();
    dgsToast('Reservacion creada correctamente', 'success');
    loadFleet();
  } catch (err) {
    alertEl.textContent = err.message;
    alertEl.classList.add('show');
  } finally {
    btn.disabled = false;
    btn.innerHTML = 'Confirmar reservacion';
  }
});

['f-category', 'f-status', 'f-price'].forEach((id) =>
  document.getElementById(id).addEventListener('change', loadFleet)
);

loadFleet();
