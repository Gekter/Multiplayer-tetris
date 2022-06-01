import Game from "./Game.js"


let playfield = [];
    
for (let row = -2; row < 20; row++) {
  playfield[row] = [];

  for (let col = 0; col < 10; col++) {
    playfield[row][col] = 0;
  }
}

let gameClient = new Game(playfield, document.querySelector('#game'))


document.addEventListener('keydown', function(e) {
  gameClient.pressedKeys[e.code] = 1;
});

document.addEventListener('keyup', function(e) {
  delete gameClient.pressedKeys[e.code];
});

document.getElementById('start').addEventListener('click', ()=>{
  requestAnimationFrame(gameClient.play);
  document.querySelector('button').disabled = true; 
});