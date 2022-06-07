import Playfield from "./Playfield.js"
import Tetromino from "./Tetromino.js"




export default class Game {
  constructor(rowPlayfield, colPlayfield, grid, canvas, seed, allowedKeys, socket = false) {
    this.tetrominoes = this.initTetrominoes();
    this.playfield = new Playfield(this.playfieldInit(rowPlayfield, colPlayfield), socket)
    this.canvas = canvas 
    this.context = canvas.getContext('2d')
    this.seed = seed
    this.allowedKeys = allowedKeys
    this.keyUPdown = false
    this.socket = socket
    this.pressedKeys = {}
    this.prePressedKeys = {}

    // fps lock
    this.fpsInterval = 1000 / 30;
    this.then = Date.now();
    this.startTime = this.then;

    
    this.curTetromino = this.getNextTetromino()
    this.idAnimation = null
    this.grid = grid
    this.curFPS = 0
    this.play = this.play.bind(this)
  }

  initTetrominoes() {
    let tetrominoes = []
    // I
    tetrominoes.push(new Tetromino(
      [[0,0,0,0],
       [1,1,1,1],
       [0,0,0,0],
       [0,0,0,0]],
      'cyan'
    ))

    // O
    tetrominoes.push(new Tetromino(
      [[1,1],
       [1,1]],
      'yellow'
    ))

    // T
    tetrominoes.push(new Tetromino(
      [[0,1,0],
       [1,1,1],
       [0,0,0]],
      'purple'
    ))

    // S
    tetrominoes.push(new Tetromino(
      [[0,1,1],
       [1,1,0],
       [0,0,0]],
      'green'
    ))

    // Z
    tetrominoes.push(new Tetromino(
      [[1,1,0],
       [0,1,1],
       [0,0,0]],
      'red'
    ))

    // J
    tetrominoes.push(new Tetromino(
      [[1,0,0],
       [1,1,1],
       [0,0,0]],
      'blue'
    ))

    // L
    tetrominoes.push(new Tetromino(
      [[0,0,1],
       [1,1,1],
       [0,0,0]],
      'orange'
    ))

    return tetrominoes
  }


  getNextTetromino() {
    let len = this.tetrominoes.length
    let index = Math.trunc(Math.abs(this.seed*(666/len)-len*this.seed+this.seed/100)%len)
    this.seed = Math.trunc((this.seed*this.seed+(73159*len+this.seed)-(this.seed*8))%1000000000)

    let tetromino = this.tetrominoes[index]
    tetromino.row = -2
    tetromino.col = this.playfield.matrix[0].length / 2 - Math.ceil(tetromino.matrix[0].length / 2)
    return tetromino
  }

  play() {
    this.idAnimation = requestAnimationFrame(this.play)

    let now = Date.now();
    let elapsed = now - this.then;

    if (elapsed > this.fpsInterval) {

      this.then = now - (elapsed % this.fpsInterval);

      this.context.clearRect(0,0,this.canvas.width,this.canvas.height);
      for (let row = 0; row < this.playfield.matrix.length; row++) {
        for (let col = 0; col < this.playfield.matrix[row].length; col++) {
          if (this.playfield.matrix[row][col]) {
            this.context.fillStyle = this.playfield.matrix[row][col]

            this.context.fillRect(col * this.grid, row * this.grid, this.grid-1, this.grid-1);
          }
        }
      }

      if (this.pressedKeys['ArrowLeft']) {
        this.curTetromino.col--
        if (!this.playfield.isValidMove(this.curTetromino)) {
          this.curTetromino.col++
        }
      }

      if (this.pressedKeys['ArrowRight']) {
        this.curTetromino.col++
        if (!this.playfield.isValidMove(this.curTetromino)) {
          this.curTetromino.col--
        }
      }

      if (this.pressedKeys['ArrowUp'] && this.keyUPdown) {
        this.keyUPdown = false
        this.curTetromino.rotateRight()
        if (!this.playfield.isValidMove(this.curTetromino)) {
          this.curTetromino.rotateLeft()
        }
        
      }

      if(this.pressedKeys['ArrowDown']) {
        this.curTetromino.row++;
        if (!this.playfield.isValidMove(this.curTetromino)) {
          this.curTetromino.row--;
          if(this.socket) {
            if (!this.playfield.placeTetromino(this.curTetromino)) {
              this.showGameOver()
            }
          }
          this.curTetromino = this.getNextTetromino()
        } 
        
      }

      if(this.socket) {
        if (this.isPressedKeysChanges()) {
          
          if (Object.keys(this.pressedKeys).length != 0) {
            this.socket.emit('tetromino move', this.pressedKeys)
          } else {
            this.socket.emit('tetromino move', {})
          }
          this.prePressedKeys = {}
          for (let key in this.pressedKeys) {
            this.prePressedKeys[key] = this.pressedKeys[key];
          }
        }
      }
      

      

      if (this.curTetromino) {

        if (++this.curFPS > 10) {
          this.curTetromino.row++;
          this.curFPS = 0;
    
          if (!this.playfield.isValidMove(this.curTetromino)) {
            this.curTetromino.row--;
            if(this.socket) {
              if (!this.playfield.placeTetromino(this.curTetromino)) {
                this.showGameOver()
              }
            }
            this.curTetromino = this.getNextTetromino()
          }
        }
    
        this.context.fillStyle = this.curTetromino.color;
    
        for (let row = 0; row < this.curTetromino.matrix.length; row++) {
          for (let col = 0; col < this.curTetromino.matrix[row].length; col++) {
            if (this.curTetromino.matrix[row][col]) {

              this.context.fillRect((this.curTetromino.col + col) * this.grid, (this.curTetromino.row + row) * this.grid, this.grid-1, this.grid-1);
            }
          }
        }
      }
    }  
  }


  isPressedKeysChanges() {
    let check = false
    for (let key in this.allowedKeys) {
      check |= (this.prePressedKeys[key] != this.pressedKeys[key])
    }
    return check
  }

  startAnimating(fps) {
    this.fpsInterval = 1000 / fps;
    this.then = Date.now();
    this.startTime = this.then;
    this.play();
  }


  showGameOver() {
    if (this.socket) {
      document.querySelector('#start').disabled = false
      document.querySelector('#start').innerText = 'Restart'
      document.querySelector('h1').innerText = 'You lose'
      this.socket.emit('win', 'You won!')
      this.socket.emit('pause')
    }


    cancelAnimationFrame(this.idAnimation);
    this.context.fillStyle = 'black';
    this.context.globalAlpha = 0.75;
    this.context.fillRect(0, this.canvas.height / 2 - 30, this.canvas.width, 60);
    this.context.globalAlpha = 1;
    this.context.fillStyle = 'white';
    this.context.font = '36px monospace';
    this.context.textAlign = 'center';
    this.context.textBaseline = 'middle';
    this.context.fillText('GAME OVER!', this.canvas.width / 2, this.canvas.height / 2);
  }

  pause() {
    cancelAnimationFrame(this.idAnimation);
  }

  resume() {
    this.idAnimation = requestAnimationFrame(this.play)
  }

  playfieldInit(rowP, colP) {
    let playfield = [];
    
    for (let row = -2; row < rowP; row++) {
      playfield[row] = [];

      for (let col = 0; col < colP; col++) {
        playfield[row][col] = 0;
      }
    }

    return playfield
  }

  addRow(arr) {
    this.curTetromino.row--
    if (!this.playfield.addRow(arr)) {
      this.showGameOver()
    }
  }

}