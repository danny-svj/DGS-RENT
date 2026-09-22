const user = dgsGuard('admin');
if (user) {
  document.getElementById('user-name').textContent = user.name;
  document.getElementById('user-email').textContent = user.email;
  document.getElementById('avatar').textContent = dgsInitials(user.name);
}

function fmtDate(d) {
  return new Date(d).toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: 'numeric' });
}

const NEXT_STATUS = {
  pending: 'confirmed',
  confirmed: 'completed',
};
const NEXT_LABEL = {
  pending: 'Confirmar',
  confirmed: 'Marcar completada',
};

async function updateStatus(id, status) {
  try {
    await DGS.reservations.updateStatus(id, status);
    dgsToast('Estado actualizado', 'success');
    loadReservations();
  } catch (err) {
    dgsToast(err.message, 'error');
  }
}

async function loadReservations() {
  const body = document.getElementById('res-body');
  try {
    const { reservations } = await DGS.reservations.list();
    if (!reservations.length) {
      body.innerHTML = '<tr><td colspan="7" class="empty-state">Aun no hay reservaciones.</td></tr>';
      return;
    }
    body.innerHTML = reservations
      .map((r) => {
        const nextStatus = NEXT_STATUS[r.status];
        const actions = [];
        if (nextStatus) {
          actions.push(`<button class="btn btn-primary btn-sm" onclick="updateStatus(${r.id}, '${nextStatus}')">${NEXT_LABEL[r.status]}</button>`);
        }
        if (r.status === 'pending' || r.status === 'confirmed') {
          actions.push(`<button class="btn btn-danger btn-sm" onclick="updateStatus(${r.id}, 'cancelled')">Cancelar</button>`);
        }
        return `
        <tr>
          <td>${r.user_name}<br/><span style="color:var(--ink-soft);font-size:0.8rem">${r.user_email}</span></td>
          <td>${r.brand} ${r.model}</td>
          <td>${fmtDate(r.start_date)}</td>
          <td>${fmtDate(r.end_date)}</td>
          <td>${dgsFormatMoney(r.total_price)}</td>
          <td><span class="badge badge-${r.status}">${r.status}</span></td>
          <td class="row-actions">${actions.join('')}</td>
        </tr>`;
      })
      .join('');
  } catch (err) {
    body.innerHTML = `<tr><td colspan="7" class="empty-state">${err.message}</td></tr>`;
  }
}

loadReservations();
