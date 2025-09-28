// Función para reproducir sonidos
function playSound(url) {
  const audio = new Audio(url);
  audio.play();
}
const socket = io();

// DOM
const loginScreen = document.getElementById('loginScreen');
const chatScreen = document.getElementById('chatScreen');
const usernameInput = document.getElementById('usernameInput');
const enterBtn = document.getElementById('enterBtn');
const usersList = document.getElementById('usersList');

const messagesEl = document.getElementById('messages');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const typingEl = document.getElementById('typing');

let myName = null;
let typingTimer = null;

// Entrar al chat
enterBtn.addEventListener('click', () => {
  const name = usernameInput.value.trim();
  if (!name) return alert('Escribe tu nombre');
  myName = name;
  socket.emit('new user', myName);
  loginScreen.classList.add('hidden');
  chatScreen.classList.remove('hidden');
});

// Enviar mensaje
sendBtn.addEventListener('click', sendMessage);
messageInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') sendMessage();
});

// emitir typing (notificar que estamos escribiendo)
messageInput.addEventListener('input', () => {
  socket.emit('typing', true);
  clearTimeout(typingTimer);
  typingTimer = setTimeout(() => {
    socket.emit('typing', false);
  }, 800);
});

function sendMessage() {
  const msg = messageInput.value.trim();
  if (!msg) return;
  socket.emit('chat message', msg);
  messageInput.value = '';
  socket.emit('typing', false);
}

function addMessage({ username, msg, time }) {
  const p = document.createElement('p');
  p.innerHTML = `<strong>${escapeHtml(username)}</strong><span class="mensaje-hora">${time}</span><br>${escapeHtml(msg)}`;
  document.getElementById('output').appendChild(p);
  document.getElementById('output').scrollTop = document.getElementById('output').scrollHeight;
}

function updateUsersList(list) {
  usersList.innerHTML = '';
  list.forEach(username => {
    const li = document.createElement('li');
    li.textContent = username;
    usersList.appendChild(li);
  });
}

// eventos del servidor
socket.on('chat message', (payload) => {
  addMessage(payload);
  playSound('Mensaje.mp3'); je
});

socket.on('user joined', (data) => {
  addSystemMessage(`${data.username} se unió al chat`);
  updateUsersList(data.users);
  playSound('Note-iPhone.mp3'); 
});

socket.on('user left', (data) => {
  addSystemMessage(`${data.username} salió del chat`);
  updateUsersList(data.users);
  playSound('Salir.mp3'); // 
});

socket.on('typing', ({ username, isTyping }) => {
  if (isTyping) typingEl.textContent = `${username} está escribiendo...`;
  else typingEl.textContent = '';
});

function addSystemMessage(text) {
  const p = document.createElement('p');
  p.innerHTML = `<em>${escapeHtml(text)}</em>`;
  p.style.color = '#888';
  document.getElementById('output').appendChild(p);
  document.getElementById('output').scrollTop = document.getElementById('output').scrollHeight;
}

// pequeña función para evitar inyección
function escapeHtml(unsafe) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
