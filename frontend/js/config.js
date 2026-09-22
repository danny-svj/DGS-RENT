// Cambia esta URL cuando despliegues el backend (por ejemplo en Render).
// En local usa http://localhost:4000
window.DGS_CONFIG = {
  API_BASE: (() => {
    const host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1') {
      return 'http://localhost:4000/api';
    }
    // Reemplaza esto con la URL real de tu backend en Render una vez desplegado.
    return 'https://dgs-rent-api.onrender.com/api';
  })(),
};
