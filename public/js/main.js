import Game from "./Game.js"
const socket = io()

const col = 10
const row = 20
const grid = 32

document.querySelectorAll('canvas').forEach((item) => {
  item.width = grid * col
  item.height = grid * row
})


let gameClient = {}
let gameEnemy = {}

let allowedKeys = {'ArrowDown': true, 'ArrowUp': true, 'ArrowRight': true, 'ArrowLeft': true}
let ArrowUPdown = false

document.addEventListener('keydown', function(e) {
  if (e.code in allowedKeys) {
    gameClient.pressedKeys[e.code] = true;
    if (e.code == 'ArrowUp' && !ArrowUPdown) {
      ArrowUPdown = true
      gameClient.test = true
    }
  }
});

document.addEventListener('keyup', function(e) {
  if (e.code in allowedKeys) {
    delete gameClient.pressedKeys[e.code];
    if (e.code == 'ArrowUp') {
      ArrowUPdown = false
    }
  }
});

document.getElementById('start').addEventListener('click', ()=>{
  socket.emit('player ready', 'Enemy is ready')
  document.querySelector('#start').disabled = true; 
});


socket.on("player ready", (text) => {
  document.querySelector('h2').innerText = text
});

socket.on("place tetr", (tetr) => {
  gameEnemy.playfield.placeTetromino(tetr)
});


socket.on("ready", (seed) => {
  gameClient = new Game(row, col, grid, document.querySelector('#gameClient'), seed, allowedKeys, socket)
  gameEnemy = new Game(row, col, grid, document.querySelector('#gameEnemy'), seed, allowedKeys)

  document.querySelector('h1').innerText = '';
  document.querySelector('h2').innerText = '';
  gameClient.startAnimating(20)
  gameEnemy.startAnimating(20)
});

socket.on("hello", (arg) => {
  console.log(arg); 
});

socket.on("socket is busy", (reason) => {
  console.log(reason)
  alert(reason)
});


socket.on("tetromino move", (moves) => {
  gameEnemy.pressedKeys = moves
});

socket.on("win", (text) => {
  document.querySelector('h1').innerText = text
  document.querySelector('#start').disabled = false
  document.querySelector('#start').innerText = 'Restart'
});

socket.on("pause", () => {
  gameClient.pause()
  gameEnemy.pause()
})

socket.on("add row enemy", (arr) => {
  gameEnemy.addRow(arr)
})

socket.on("add row me", (arr) => {
  gameClient.addRow(arr)
})

socket.on("enemy crash", (text) => {
  console.log(text)
  let recon = false
  try {
    gameClient.pause()
    gameEnemy.pause()
  } catch (err) {
    recon = true
    console.log('Enemy reconnecting')
  }
  if (!recon) {
    document.querySelector('h1').innerText = text
    document.querySelector('h2').innerText = 'technical victory'
    document.querySelector('#start').disabled = false
    document.querySelector('#start').innerText = 'Restart'
    alert(text)
  }
})

