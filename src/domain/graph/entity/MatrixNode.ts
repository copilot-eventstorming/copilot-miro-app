import {Geometry} from "./Geometry";
import {Coordinate} from "./Coordinate";
import {MatrixIndex} from "./MatrixIndex";
import {Node} from './Node';

export class MatrixNode extends Node {
    id: string;
    name: string;
    category: string;
    geometry: Geometry;
    coordinate: Coordinate;
    matrixIndex: MatrixIndex;
    style: Record<string, any> = {};
    shape: string;

    constructor(id: string, name: string, category: string, geometry: Geometry, coordinate: Coordinate, matrixIndex: MatrixIndex, shape: string = 'rectangle', style: Record<string, any> = {}) {
        super(id, name);
        this.id = id;
        this.name = name;
        this.category = category;
        this.geometry = geometry;
        this.coordinate = coordinate;
        this.matrixIndex = matrixIndex;
        this.shape = shape;
    }

    setMatrixIndex(x: number, y: number): void {
        this.matrixIndex = MatrixIndex.from(x, y);
    }

    getCoordinate(): Coordinate {
        return Coordinate.from(this.coordinate.x, this.coordinate.y);
    }

    setCoordinate(coordinate: Coordinate): void {
        this.coordinate = Coordinate.from(coordinate.x, coordinate.y);
    }

    invalidateSizing(): { x: number, y: number, width: number, height: number } {
        return {x: this.coordinate.x, y: this.coordinate.y, width: this.geometry.width, height: this.geometry.height};
    }

    static from(id: string, name: string, geometry: Geometry, coordinate: Coordinate): MatrixNode {
        return new MatrixNode(id, name, 'unknown', geometry, coordinate, MatrixIndex.from(0, 0));
    }
}

export function calculateDistance(card1: MatrixNode, card2: MatrixNode, factor: number = 1): number {
    const distance = Math.sqrt(Math.pow(card1.invalidateSizing().x - card2.invalidateSizing().x, 2) + Math.pow(card1.invalidateSizing().y - card2.invalidateSizing().y, 2));
    const minWidth = Math.min(card1.invalidateSizing().width, card2.invalidateSizing().width);
    const refined = distance / (minWidth * factor)
    return parseFloat(refined.toFixed(2));
}