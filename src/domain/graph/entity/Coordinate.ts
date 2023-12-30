class Coordinate {
    x: number;
    y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    static from(x: number, y: number): Coordinate {
        return new Coordinate(x, y);
    }
}

export {Coordinate};