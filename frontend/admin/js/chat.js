const user = dgsGuard('admin');
if (user) {
  document.getElementById('user-name').textContent = user.name;
  document.getElementById('user-email').textContent = user.email;
  document.getElementById('avatar').textContent = dgsInitials(user.name);
}

const threadList = document.getElementById('thread-list');
const conversationHead = document.getElementById('conversation-head');
const messagesEl = document.getElementById('chat-messages');
const form = document.getElementById('chat-form');
const input = document.getElementById('chat-input');
const sendBtn = document.getElementById('chat-send');

let activeUserId = null;
let threadsCache = [];

function fmtTime(d) {
  return new Date(d).toLocaleString('es-MX', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

function escapeHtml(s) {
  const div = document.createElement('div');
  div.textContent = s;
  return div.innerHTML;
}

function renderThreads() {
  if (!threadsCache.length) {
    threadList.innerHTML = '<div class="empty-state"><div class="ic"><i class="ph-bold ph-chats-circle"></i></div>Aun no hay conversaciones.</div>';
    return;
  }
  threadList.innerHTML = threadsCache
    .map(
      (t) => `
    <div class="chat-thread-item ${t.user_id === activeUserId ? 'active' : ''}" onclick="openThread(${t.user_id})">
      <div class="avatar">${dgsInitials(t.name)}</div>
      <div class="who">
        <b>${escapeHtml(t.name)}</b>
        <span>${escapeHtml(t.last_message || '')}</span>
      </div>
      ${t.unread_count > 0 ? `<span class="chat-unread-dot">${t.unread_count}</span>` : ''}
    </div>`
    )
    .join('');
}

async function loadThreads() {
  try {
    const { threads } = await DGS.messages.adminThreads();
    threadsCache = threads;
    renderThreads();
  } catch (err) {
    threadList.innerHTML = `<div class="empty-state"><div class="ic"><i class="ph-bold ph-plug"></i></div>${err.message}</div>`;
  }
}

function renderMessages(customer, messages) {
  conversationHead.textContent = `${customer.name} — ${customer.email}`;
  form.style.display = 'flex';
  if (!messages.length) {
    messagesEl.innerHTML = '<div class="empty-state"><div class="ic"><i class="ph-bold ph-chats-circle"></i></div>Sin mensajes todavia.</div>';
    return;
  }
  messagesEl.innerHTML = messages
    .map(
      (m) => `
    <div class="chat-row ${m.sender_role === 'admin' ? 'mine' : 'theirs'}">
      <div class="chat-bubble">
        <p>${escapeHtml(m.body)}</p>
        <span class="chat-time">${fmtTime(m.created_at)}</span>
      </div>
    </div>`
    )
    .join('');
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

async function openThread(userId) {
  activeUserId = userId;
  renderThreads();
  try {
    const { customer, messages } = await DGS.messages.adminThread(userId);
    renderMessages(customer, messages);
  } catch (err) {
    dgsToast(err.message, 'error');
  }
  loadThreads();
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!activeUserId) return;
  const text = input.value.trim();
  if (!text) return;
  sendBtn.disabled = true;
  try {
    await DGS.messages.adminSend(activeUserId, text);
    input.value = '';
    const { customer, messages } = await DGS.messages.adminThread(activeUserId);
    renderMessages(customer, messages);
  } catch (err) {
    dgsToast(err.message, 'error');
  } finally {
    sendBtn.disabled = false;
    input.focus();
  }
});

async function refreshActiveThread() {
  if (!activeUserId) return;
  try {
    const { customer, messages } = await DGS.messages.adminThread(activeUserId);
    renderMessages(customer, messages);
  } catch (err) {
    // se ignora; se reintenta en el siguiente ciclo
  }
}

loadThreads();
setInterval(() => {
  loadThreads();
  refreshActiveThread();
}, 5000);
