// Muestra un contador de mensajes sin leer junto al enlace "Chat" del menu lateral.
(function () {
  function attachBadge() {
    const badge = document.getElementById('chat-badge');
    if (!badge || typeof DGS === 'undefined') return;
    const user = DGS.getUser();
    if (!user) return;
    const fetchCount = user.role === 'admin' ? DGS.messages.adminUnreadCount : DGS.messages.unreadCount;

    async function refresh() {
      try {
        const { count } = await fetchCount();
        if (count > 0) {
          badge.textContent = count > 9 ? '9+' : String(count);
          badge.style.display = 'inline-flex';
        } else {
          badge.style.display = 'none';
        }
      } catch (e) {
        // se ignora; se reintenta en el siguiente ciclo
      }
    }

    refresh();
    setInterval(refresh, 20000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', attachBadge);
  } else {
    attachBadge();
  }
})();
