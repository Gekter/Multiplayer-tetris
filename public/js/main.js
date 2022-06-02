import Game from "./Game.js"
const socket = io()

let playfield = [];
    
for (let row = -2; row < 20; row++) {
  playfield[row] = [];

  for (let col = 0; col < 10; col++) {
    playfield[row][col] = 0;
  }
}

let playfield2 = [];
    
for (let row = -2; row < 20; row++) {
  playfield2[row] = [];

  for (let col = 0; col < 10; col++) {
    playfield2[row][col] = 0;
  }
}

let gameClient = new Game(playfield, document.querySelector('#gameClient'), socket)
let gameEnemy = new Game(playfield2, document.querySelector('#gameEnemy'))

document.addEventListener('keydown', function(e) {
  gameClient.pressedKeys[e.code] = true;
});

document.addEventListener('keyup', function(e) {
  delete gameClient.pressedKeys[e.code];
});

document.getElementById('start').addEventListener('click', ()=>{
  socket.emit('player ready', 'Enemy is ready')
  document.querySelector('button').disabled = true; 
});


socket.on("player ready", (text) => {
  document.querySelector('h1').innerText = text
});


socket.on("ready", (text) => {
  console.log('Тут должна начаться игра');
  document.querySelector('h1').remove();
  requestAnimationFrame(gameClient.play);
  requestAnimationFrame(gameEnemy.play);
});

socket.on("hello", (arg) => {
  console.log(arg); 
});

socket.on("socket is busy", (reason) => {
  console.log(reason)
  alert(reason)
});

socket.on("tetromino move", (moves) => {
  console.log(moves); 
  gameEnemy.pressedKeys = moves
});

