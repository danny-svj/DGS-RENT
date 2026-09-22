// Cliente ligero para hablar con la API de DGS Rent a Car.
const DGS = (() => {
  const BASE = window.DGS_CONFIG.API_BASE;

  function getToken() {
    return localStorage.getItem('dgs_token');
  }
  function setSession(token, user) {
    localStorage.setItem('dgs_token', token);
    localStorage.setItem('dgs_user', JSON.stringify(user));
  }
  function clearSession() {
    localStorage.removeItem('dgs_token');
    localStorage.removeItem('dgs_user');
  }
  function getUser() {
    try {
      return JSON.parse(localStorage.getItem('dgs_user'));
    } catch (e) {
      return null;
    }
  }

  async function request(path, { method = 'GET', body, auth = false } = {}) {
    const headers = { 'Content-Type': 'application/json' };
    if (auth) {
      const token = getToken();
      if (token) headers.Authorization = `Bearer ${token}`;
    }

    let res;
    try {
      res = await fetch(`${BASE}${path}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      });
    } catch (networkErr) {
      const err = new Error('No se pudo conectar con el servidor. Verifica que el backend este activo.');
      err.network = true;
      throw err;
    }

    let data = {};
    try {
      data = await res.json();
    } catch (e) {
      data = {};
    }

    if (!res.ok) {
      const err = new Error(data.error || 'Ocurrio un error inesperado');
      err.status = res.status;
      throw err;
    }
    return data;
  }

  return {
    getToken,
    setSession,
    clearSession,
    getUser,
    isLoggedIn: () => !!getToken(),
    auth: {
      register: (payload) => request('/auth/register', { method: 'POST', body: payload }),
      login: (payload) => request('/auth/login', { method: 'POST', body: payload }),
      me: () => request('/auth/me', { auth: true }),
    },
    vehicles: {
      list: (params = {}) => {
        const qs = new URLSearchParams(params).toString();
        return request(`/vehicles${qs ? `?${qs}` : ''}`);
      },
      get: (id) => request(`/vehicles/${id}`),
      create: (payload) => request('/vehicles', { method: 'POST', body: payload, auth: true }),
      update: (id, payload) => request(`/vehicles/${id}`, { method: 'PUT', body: payload, auth: true }),
      remove: (id) => request(`/vehicles/${id}`, { method: 'DELETE', auth: true }),
    },
    reservations: {
      list: () => request('/reservations', { auth: true }),
      create: (payload) => request('/reservations', { method: 'POST', body: payload, auth: true }),
      updateStatus: (id, status) =>
        request(`/reservations/${id}/status`, { method: 'PUT', body: { status }, auth: true }),
      cancel: (id) => request(`/reservations/${id}`, { method: 'DELETE', auth: true }),
    },
    users: {
      list: () => request('/users', { auth: true }),
    },
  };
})();

function dgsToast(message, type = 'default') {
  let el = document.querySelector('.toast');
  if (!el) {
    el = document.createElement('div');
    el.className = 'toast';
    document.body.appendChild(el);
  }
  el.textContent = message;
  el.className = `toast show ${type === 'error' ? 'error' : type === 'success' ? 'success' : ''}`;
  clearTimeout(el._timer);
  el._timer = setTimeout(() => el.classList.remove('show'), 3200);
}

function dgsGuard(requiredRole) {
  const user = DGS.getUser();
  if (!DGS.isLoggedIn() || !user) {
    window.location.href = '/login.html';
    return null;
  }
  if (requiredRole && user.role !== requiredRole) {
    window.location.href = user.role === 'admin' ? '/admin/dashboard.html' : '/app/fleet.html';
    return null;
  }
  return user;
}

function dgsLogout() {
  DGS.clearSession();
  window.location.href = '/index.html';
}

function dgsFormatMoney(n) {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(n);
}

function dgsInitials(name) {
  return (name || '?')
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}
