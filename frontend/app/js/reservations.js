const user = dgsGuard('user');
if (user) {
  document.getElementById('user-name').textContent = user.name;
  document.getElementById('user-email').textContent = user.email;
  document.getElementById('avatar').textContent = dgsInitials(user.name);
}

function fmtDate(d) {
  return new Date(d).toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: 'numeric' });
}

async function cancelReservation(id) {
  try {
    await DGS.reservations.cancel(id);
    dgsToast('Reservacion cancelada', 'success');
    loadReservations();
  } catch (err) {
    dgsToast(err.message, 'error');
  }
}

async function loadReservations() {
  const body = document.getElementById('res-table-body');
  const empty = document.getElementById('res-empty');
  try {
    const { reservations } = await DGS.reservations.list();
    if (!reservations.length) {
      body.innerHTML = '';
      empty.style.display = 'block';
      empty.innerHTML = '<div class="empty-state"><div class="ic"><i class="fa-solid fa-calendar-xmark"></i></div>Aun no tienes reservaciones. <a href="fleet.html">Reserva tu primer auto</a>.</div>';
      return;
    }
    empty.style.display = 'none';
    body.innerHTML = reservations
      .map(
        (r) => `
      <tr>
        <td><b>${r.brand} ${r.model}</b><br/><span style="color:var(--ink-soft);font-size:0.8rem">${r.plate}</span></td>
        <td>${fmtDate(r.start_date)}</td>
        <td>${fmtDate(r.end_date)}</td>
        <td>${dgsFormatMoney(r.total_price)}</td>
        <td><span class="badge badge-${r.status}">${r.status}</span></td>
        <td>${r.status === 'pending' ? `<button class="btn btn-ghost btn-sm" onclick="cancelReservation(${r.id})">Cancelar</button>` : ''}</td>
      </tr>`
      )
      .join('');
  } catch (err) {
    body.innerHTML = '';
    empty.style.display = 'block';
    empty.innerHTML = `<div class="empty-state"><div class="ic"><i class="fa-solid fa-plug-circle-xmark"></i></div>${err.message}</div>`;
  }
}

loadReservations();
