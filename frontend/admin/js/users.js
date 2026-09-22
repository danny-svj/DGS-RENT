const user = dgsGuard('admin');
if (user) {
  document.getElementById('user-name').textContent = user.name;
  document.getElementById('user-email').textContent = user.email;
  document.getElementById('avatar').textContent = dgsInitials(user.name);
}

function fmtDate(d) {
  return new Date(d).toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: 'numeric' });
}

async function loadUsers() {
  const body = document.getElementById('users-body');
  try {
    const { users } = await DGS.users.list();
    if (!users.length) {
      body.innerHTML = '<tr><td colspan="5" class="empty-state">No hay usuarios registrados.</td></tr>';
      return;
    }
    body.innerHTML = users
      .map(
        (u) => `
      <tr>
        <td>${u.name}</td>
        <td>${u.email}</td>
        <td>${u.company || '-'}</td>
        <td><span class="badge badge-${u.role}">${u.role}</span></td>
        <td>${fmtDate(u.created_at)}</td>
      </tr>`
      )
      .join('');
  } catch (err) {
    body.innerHTML = `<tr><td colspan="5" class="empty-state">${err.message}</td></tr>`;
  }
}

loadUsers();
