const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);


app.use(express.static('public'));

server.listen(3000, () => {
  console.log('listening on *:3000');
});

let ready = 0;

io.on("connection", (socket) => {
  if (io.engine.clientsCount > 2) {
    socket.emit("socket is busy", 'socket is already busy');
    socket.disconnect()
  }

  socket.on('tetromino move', (moves) => {
    socket.broadcast.emit('tetromino move', moves)
  })



  
  socket.on('player ready', (text) => {
    ready++
    if (ready >= 2) {
      io.sockets.emit('ready', text)
    } else {
      socket.broadcast.emit('player ready', text)
    }
  })



  socket.emit("hello", 'socket connected');
});

