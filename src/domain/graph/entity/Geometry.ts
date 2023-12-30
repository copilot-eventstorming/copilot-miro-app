class Geometry {
    static Rectangle = 'rectangle';
    static Circle = 'circle';
    static Diamond = 'diamond';

    width: number;
    height: number;
    shape: string;

    constructor(width: number, height: number, shape: string) {
        this.width = width;
        this.height = height;
        this.shape = shape;
    }

    static fromSize(width: number, height: number, shape: string = 'rectangle'): Geometry {
        return new Geometry(width, height, shape);
    }
}

export {Geometry};