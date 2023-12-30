export class MatrixIndex {
    row: number;
    col: number;

    constructor(row: number, col: number) {
        this.row = row;
        this.col = col;
    }

    static from(row: number, col: number): MatrixIndex {
        return new MatrixIndex(row, col);
    }
}