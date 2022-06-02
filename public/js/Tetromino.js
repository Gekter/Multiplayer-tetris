
export default class Tetromino {
  constructor(matrix, color) {
    this.matrix = matrix;
    this.color = color;
    this.row = 0;
    this.col = 0;
  }

  rotateRight() {
    const N = this.matrix.length - 1;
    this.matrix = this.matrix.map((row, i) =>
      row.map((val, j) => this.matrix[N - j][i])
    );
  }

  rotateLeft() {
    const N = this.matrix.length - 1;
    this.matrix = this.matrix.map((row, i) =>
      row.map((val, j) => this.matrix[j][N - i])
    );
  }
}