export default class Playfield {
  constructor(matrix, socket) {
    this.socket = socket;
    this.matrix = matrix;
  }



  isValidMove(tetromino) {
    for (let row = 0; row < tetromino.matrix.length; row++) {
      for (let col = 0; col < tetromino.matrix[row].length; col++) {
        if (tetromino.matrix[row][col] && (
            tetromino.col + col < 0 ||
            tetromino.col + col >= this.matrix[0].length ||
            tetromino.row + row >= this.matrix.length ||
            this.matrix[tetromino.row + row][tetromino.col + col])
          ) {
          return false;
        }
      }
    }
    return true;
  }

  placeTetromino(tetromino) {
    for (let row = 0; row < tetromino.matrix.length; row++) {
      for (let col = 0; col < tetromino.matrix[row].length; col++) {
        if (tetromino.matrix[row][col]) {

          if (tetromino.row + row < 0) {
            return false;
          }
          this.matrix[tetromino.row + row][tetromino.col + col] = tetromino.color;
        }
      } 
    }
    this.rowCheck()
    return true;
  }

  rowCheck() {
    let addRowCount = 0;
    for (let row = this.matrix.length - 1; row >= 0; ) {
      if (this.matrix[row].every(cell => !!cell)) {
        addRowCount++

        for (let r = row; r >= 0; r--) {
          for (let c = 0; c < this.matrix[r].length; c++) {
            this.matrix[r][c] = this.matrix[r-1][c];
          }
        }
      }
      else {
        row--;
      }
    }

    if (this.socket && addRowCount > 0) {
      this.socket.emit('add row', {"count": addRowCount, "len": this.matrix[0].length})
    }
  }

  addRow(arr) {
    let check = !this.matrix[0].some(cell => cell != 0)
    
    for(let row = 0; row < this.matrix.length-1; row++) {
      for (let col = 0; col < this.matrix[row].length; col++) {
        this.matrix[row][col] = this.matrix[row+1][col];
      }
    }
    this.matrix[this.matrix.length-1] = arr
    
    return check
  }

  // firstRowCheck() {
  //     if (this.matrix[row].some(cell => cell != 0)) {
  //       return false
  //     }
    
  //   return true
  // }

  // genRow() {
  //   let arr = []
  //   let len = this.matrix.length
  //   for (let i = 0; i < len; i++) {
  //     arr[i] = 0
  //   }
  //   arr.fill('#BDB76B', 0, this.getRandomArbitrary(len-len/2+1,len))
  //   return this.shuffle(arr)
  // }

  // getRandomArbitrary(min, max) {
  //   min = Math.ceil(min);
  //   max = Math.floor(max);
  //   return Math.floor(Math.random() * (max - min) + min);
  // }

  // shuffle(array) {
  //   let currentIndex = array.length,  randomIndex;
  
  //   while (currentIndex != 0) {
  //     randomIndex = Math.floor(Math.random() * currentIndex);
  //     currentIndex--;
  //     [array[currentIndex], array[randomIndex]] = [
  //       array[randomIndex], array[currentIndex]];
  //   }
  
  //   return array;
  // }

}