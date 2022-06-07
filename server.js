const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

app.use(express.static('public'));

server.listen(80, () => {
  console.log('listening on *:80');
});

let ready = 0;
let pause = 0;
let gameEnd = false;

io.on("connection", (socket) => {
  if (io.engine.clientsCount > 2) {
    socket.emit("socket is busy", 'socket is already busy');
    socket.disconnect()
  }

  socket.on('disconnect', () => {
    socket.broadcast.emit('enemy crash', gameEnd)
  })

  socket.on('tetromino move', (moves) => {
    socket.broadcast.emit('tetromino move', moves)
  })


  socket.on('add row', (obj) => {
    for (let i = 0; i < obj.count-1; i++) {
      let arr = genRow(obj.len)
      socket.emit('add row enemy', arr)
      socket.broadcast.emit('add row me', arr)
    }
  })
  
  socket.on('player ready', (text) => {
    ready++
    if (ready >= 2) {
      gameEnd = false;
      io.sockets.emit('ready', Math.trunc(Math.random()*100000000))
      ready = 0
    } else {
      socket.broadcast.emit('player ready', text)
    }
  })

  socket.on('win', (text) => {
    gameEnd = true;
    socket.broadcast.emit('win', text)
  })

  socket.on('visibility pause', () => {
    pause++
    if (pause >= 1 && !gameEnd) {
      io.sockets.emit('visibility pause', 'Game pause')
    }
  })


  socket.on('visibility resume', () => {
    pause--
    if (pause == 0 && !gameEnd) {
      io.sockets.emit('visibility resume', 'Game resume')
    }
  })

  socket.on('pause', () => {
    io.sockets.emit('pause')
  })

  socket.on('place tetr', (tetr) => {
    socket.broadcast.emit('place tetr', tetr)
  })


  if (io.engine.clientsCount == 2) {
    io.sockets.emit('enemy con', 'Enemy is connected')
  }
});



function genRow(len) {
  let arr = []
  for (let i = 0; i < len; i++) {
    arr[i] = 0
  }
  arr.fill('#BDB76B', 0, getRandomArbitrary(len-len/2+1,len))
  return shuffle(arr)
}

function getRandomArbitrary(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min);
}

function shuffle(array) {
  let currentIndex = array.length,  randomIndex;

  while (currentIndex != 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }

  return array;
}