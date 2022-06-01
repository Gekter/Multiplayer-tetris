import Playfield from "./Playfield.js"
import Tetromino from "./Tetromino.js"


export default class Game {
  constructor(playfield, canvas) {
    this.tetrominoes = this.initTetrominoes();
    this.playfield = new Playfield(playfield)
    this.canvas = canvas
    this.context = canvas.getContext('2d')
    this.sequence = []
    this.curTetromino = this.getNextTetromino()

    this.pressedKeys = {}

    this.idAnimation = null
    this.grid = 32
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


  sequenceGen(seed) {
    let len = this.tetrominoes.length
    for (let i = 0; i < 250; i++){
        this.sequence.push(Math.trunc(Math.abs(seed*(666/len)-len*seed+seed/100)%len))
        seed = Math.trunc((seed*seed+(73159*len+seed)-(seed*8))%4596378315)
    }
  }

  getNextTetromino() {
    if (this.sequence.length === 0) {
      this.sequenceGen(37131); // прикрутить получение seed с сервера
    }
    let index = this.sequence.pop()
    let tetromino = this.tetrominoes[index]
    tetromino.row = -2
    tetromino.col = this.playfield.matrix[0].length / 2 - Math.ceil(tetromino.matrix[0].length / 2)
    return tetromino
  }

  play() {
    this.idAnimation = requestAnimationFrame(this.play)
    this.context.clearRect(0,0,this.canvas.width,this.canvas.height);
    for (let row = 0; row < 20; row++) {
      for (let col = 0; col < 10; col++) {
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

    if (this.pressedKeys['ArrowUp']) {
      this.curTetromino.rotateRight()
      if (!this.playfield.isValidMove(this.curTetromino)) {
        this.curTetromino.rotateLeft()
      }
    }

    if(this.pressedKeys['ArrowDown']) {
      this.curTetromino.row++;
      if (!this.playfield.isValidMove(this.curTetromino)) {
        this.curTetromino.row--;
        if (!this.playfield.placeTetromino(this.curTetromino)) {
          this.showGameOver()
        }
        this.curTetromino = this.getNextTetromino()
      } 
      
    }
    

    

    if (this.curTetromino) {

      if (++this.curFPS > 35) {
        this.curTetromino.row++;
        this.curFPS = 0;
  
        if (!this.playfield.isValidMove(this.curTetromino)) {
          this.curTetromino.row--;
          if (!this.playfield.placeTetromino(this.curTetromino)) {
            this.showGameOver()
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


  showGameOver() {
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


  



}