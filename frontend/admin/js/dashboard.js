const user = dgsGuard('admin');
if (user) {
  document.getElementById('user-name').textContent = user.name;
  document.getElementById('user-email').textContent = user.email;
  document.getElementById('avatar').textContent = dgsInitials(user.name);
}

function fmtDate(d) {
  return new Date(d).toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: 'numeric' });
}

async function loadDashboard() {
  const kpiGrid = document.getElementById('kpi-grid');
  const recentBody = document.getElementById('recent-body');
  try {
    const [{ vehicles }, { reservations }, { users }] = await Promise.all([
      DGS.vehicles.list(),
      DGS.reservations.list(),
      DGS.users.list(),
    ]);

    const available = vehicles.filter((v) => v.status === 'available').length;
    const rented = vehicles.filter((v) => v.status === 'rented').length;
    const revenue = reservations
      .filter((r) => r.status === 'confirmed' || r.status === 'completed')
      .reduce((sum, r) => sum + r.total_price, 0);

    kpiGrid.innerHTML = `
      <div class="kpi-card"><div class="ic" style="background:var(--blue)"><i class="fa-solid fa-car"></i></div><b>${vehicles.length}</b><span>Vehiculos totales</span></div>
      <div class="kpi-card"><div class="ic" style="background:var(--success)"><i class="fa-solid fa-circle-check"></i></div><b>${available}</b><span>Disponibles</span></div>
      <div class="kpi-card"><div class="ic" style="background:var(--gold)"><i class="fa-solid fa-key"></i></div><b>${rented}</b><span>Rentados ahora</span></div>
      <div class="kpi-card"><div class="ic" style="background:var(--red)"><i class="fa-solid fa-users"></i></div><b>${users.length}</b><span>Usuarios registrados</span></div>
    `;

    const recent = reservations.slice(0, 8);
    if (!recent.length) {
      recentBody.innerHTML = '<tr><td colspan="6" class="empty-state">Aun no hay reservaciones.</td></tr>';
    } else {
      recentBody.innerHTML = recent
        .map(
          (r) => `
        <tr>
          <td>${r.user_name}</td>
          <td>${r.brand} ${r.model}</td>
          <td>${fmtDate(r.start_date)}</td>
          <td>${fmtDate(r.end_date)}</td>
          <td>${dgsFormatMoney(r.total_price)}</td>
          <td><span class="badge badge-${r.status}">${r.status}</span></td>
        </tr>`
        )
        .join('');
    }
  } catch (err) {
    kpiGrid.innerHTML = `<div class="empty-state"><div class="ic"><i class="fa-solid fa-plug-circle-xmark"></i></div>${err.message}</div>`;
  }
}

loadDashboard();
