// element for one dimensional segmentation, a matrix segment is a place holder on matrix, it corresponds a row or a column, it corresponds one or more matrix nodes
export class MatrixSegment {
    id: string;
    position: number;
    length: number;
    name: string;

    constructor(id: string, position: number, length: number, name: string) {
        this.id = id;
        this.position = position;
        this.length = length;
        this.name = name;
    }

    static from(id: string, position: number, length: number, name: string = ''): MatrixSegment {
        return new MatrixSegment(id, position, length, name);
    }
}