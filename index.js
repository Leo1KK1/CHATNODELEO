
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(__dirname + '/public'));

const users = new Map();

io.on('connection', (socket) => {
  console.log('Nuevo cliente conectado:', socket.id);

  socket.on('new user', (username) => {
    users.set(socket.id, username);
    io.emit('user joined', { username, users: Array.from(users.values()) });
    console.log(`${username} se unió. Total usuarios: ${users.size}`);
  });

  socket.on('chat message', (msg) => {
    const username = users.get(socket.id) || 'Anon';
    io.emit('chat message', { username, msg, time: new Date().toLocaleTimeString() });
  });

  socket.on('typing', (isTyping) => {
    const username = users.get(socket.id) || 'Anon';
    socket.broadcast.emit('typing', { username, isTyping });
  });

  socket.on('disconnect', () => {
    const username = users.get(socket.id);
    users.delete(socket.id);
    if (username) {
      io.emit('user left', { username, users: Array.from(users.values()) });
      console.log(`${username} se desconectó. Total usuarios: ${users.size}`);
    } else {
      console.log(`Cliente desconectado: ${socket.id}`);
    }
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
