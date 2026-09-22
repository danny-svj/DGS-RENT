const user = dgsGuard('admin');
if (user) {
  document.getElementById('user-name').textContent = user.name;
  document.getElementById('user-email').textContent = user.email;
  document.getElementById('avatar').textContent = dgsInitials(user.name);
}

let vehiclesCache = [];

async function loadVehicles() {
  const body = document.getElementById('vehicles-body');
  try {
    const { vehicles } = await DGS.vehicles.list();
    vehiclesCache = vehicles;
    if (!vehicles.length) {
      body.innerHTML = '<tr><td colspan="6" class="empty-state">No hay vehiculos registrados.</td></tr>';
      return;
    }
    body.innerHTML = vehicles
      .map(
        (v) => `
      <tr>
        <td><b>${v.brand} ${v.model}</b><br/><span style="color:var(--ink-soft);font-size:0.8rem">${v.year}</span></td>
        <td>${v.category}</td>
        <td>${v.plate}</td>
        <td>${dgsFormatMoney(v.daily_price)}</td>
        <td><span class="badge badge-${v.status}">${v.status}</span></td>
        <td class="row-actions">
          <button class="btn btn-ghost btn-sm" onclick="openVehicleModal(${v.id})"><i class="fa-solid fa-pen"></i></button>
          <button class="btn btn-danger btn-sm" onclick="deleteVehicle(${v.id})"><i class="fa-solid fa-trash"></i></button>
        </td>
      </tr>`
      )
      .join('');
  } catch (err) {
    body.innerHTML = `<tr><td colspan="6" class="empty-state">${err.message}</td></tr>`;
  }
}

function openVehicleModal(id) {
  const form = document.getElementById('vehicle-form');
  form.reset();
  document.getElementById('vehicle-alert').classList.remove('show');
  const vehicle = id ? vehiclesCache.find((v) => v.id === id) : null;

  document.getElementById('vehicle-modal-title').textContent = vehicle ? 'Editar vehiculo' : 'Agregar vehiculo';
  document.getElementById('v-id').value = vehicle ? vehicle.id : '';
  document.getElementById('v-brand').value = vehicle ? vehicle.brand : '';
  document.getElementById('v-model').value = vehicle ? vehicle.model : '';
  document.getElementById('v-year').value = vehicle ? vehicle.year : 2024;
  document.getElementById('v-plate').value = vehicle ? vehicle.plate : '';
  document.getElementById('v-category').value = vehicle ? vehicle.category : 'Sedan';
  document.getElementById('v-price').value = vehicle ? vehicle.daily_price : '';
  document.getElementById('v-status').value = vehicle ? vehicle.status : 'available';
  document.getElementById('v-image').value = vehicle ? vehicle.image_url || '' : '';

  document.getElementById('vehicle-modal').classList.add('show');
}
function closeVehicleModal() {
  document.getElementById('vehicle-modal').classList.remove('show');
}

document.getElementById('vehicle-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const alertEl = document.getElementById('vehicle-alert');
  const btn = document.getElementById('vehicle-submit');
  alertEl.classList.remove('show');
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span> Guardando...';

  const id = document.getElementById('v-id').value;
  const payload = {
    brand: document.getElementById('v-brand').value.trim(),
    model: document.getElementById('v-model').value.trim(),
    year: Number(document.getElementById('v-year').value),
    plate: document.getElementById('v-plate').value.trim(),
    category: document.getElementById('v-category').value,
    daily_price: Number(document.getElementById('v-price').value),
    status: document.getElementById('v-status').value,
    image_url: document.getElementById('v-image').value.trim(),
  };

  try {
    if (id) {
      await DGS.vehicles.update(id, payload);
    } else {
      await DGS.vehicles.create(payload);
    }
    closeVehicleModal();
    dgsToast('Vehiculo guardado correctamente', 'success');
    loadVehicles();
  } catch (err) {
    alertEl.textContent = err.message;
    alertEl.classList.add('show');
  } finally {
    btn.disabled = false;
    btn.innerHTML = 'Guardar';
  }
});

async function deleteVehicle(id) {
  if (!confirm('Seguro que quieres eliminar este vehiculo?')) return;
  try {
    await DGS.vehicles.remove(id);
    dgsToast('Vehiculo eliminado', 'success');
    loadVehicles();
  } catch (err) {
    dgsToast(err.message, 'error');
  }
}

loadVehicles();
