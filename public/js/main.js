import Game from "./Game.js"
const socket = io()

document.querySelectorAll('canvas').forEach((item) => {
  item.width = 320
  item.height = 640
})


let gameClient = {}
let gameEnemy = {}

let allowedKeys = {'ArrowDown': 1, 'ArrowUp': 1, 'ArrowRight': 1, 'ArrowLeft': 1}


document.addEventListener('keydown', function(e) {
  if (e.code in allowedKeys) {
    gameClient.pressedKeys[e.code] = true;
  }
});

document.addEventListener('keyup', function(e) {
  if (e.code in allowedKeys) {
    delete gameClient.pressedKeys[e.code];
  }
});

document.getElementById('start').addEventListener('click', ()=>{
  socket.emit('player ready', 'Enemy is ready')
  document.querySelector('#start').disabled = true; 
});


socket.on("player ready", (text) => {
  document.querySelector('h2').innerText = text
});


socket.on("ready", (seed) => {
  gameClient = new Game(20, 10, document.querySelector('#gameClient'), seed, socket)
  gameEnemy = new Game(20, 10, document.querySelector('#gameEnemy'), seed)

  document.querySelector('h1').innerText = '';
  document.querySelector('h2').innerText = '';
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

