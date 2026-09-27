const user = dgsGuard('user');
if (user) {
  document.getElementById('user-name').textContent = user.name;
  document.getElementById('user-email').textContent = user.email;
  document.getElementById('avatar').textContent = dgsInitials(user.name);
}

const messagesEl = document.getElementById('chat-messages');
const form = document.getElementById('chat-form');
const input = document.getElementById('chat-input');
const sendBtn = document.getElementById('chat-send');

function fmtTime(d) {
  return new Date(d).toLocaleString('es-MX', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

function escapeHtml(s) {
  const div = document.createElement('div');
  div.textContent = s;
  return div.innerHTML;
}

function render(messages) {
  if (!messages.length) {
    messagesEl.innerHTML = '<div class="empty-state"><div class="ic"><i class="ph-bold ph-chats-circle"></i></div>Escribe tu primer mensaje y el equipo de DGS te respondera aqui.</div>';
    return;
  }
  messagesEl.innerHTML = messages
    .map(
      (m) => `
    <div class="chat-row ${m.sender_role === 'user' ? 'mine' : 'theirs'}">
      <div class="chat-bubble">
        <p>${escapeHtml(m.body)}</p>
        <span class="chat-time">${fmtTime(m.created_at)}</span>
      </div>
    </div>`
    )
    .join('');
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

async function loadMessages() {
  try {
    const { messages } = await DGS.messages.list();
    render(messages);
  } catch (err) {
    messagesEl.innerHTML = `<div class="empty-state"><div class="ic"><i class="ph-bold ph-plug"></i></div>${err.message}</div>`;
  }
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text) return;
  sendBtn.disabled = true;
  try {
    await DGS.messages.send(text);
    input.value = '';
    await loadMessages();
  } catch (err) {
    dgsToast(err.message, 'error');
  } finally {
    sendBtn.disabled = false;
    input.focus();
  }
});

loadMessages();
setInterval(loadMessages, 5000);
