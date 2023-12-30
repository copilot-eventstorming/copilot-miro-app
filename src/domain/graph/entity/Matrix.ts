import {MatrixNode} from "./MatrixNode";

type KeyFunction = (node: MatrixNode) => string;
type WidthFunction = (node: MatrixNode) => number;
type HeightFunction = (node: MatrixNode) => number;

// a grid layout with several columns and rows, just like a matrix
export class Matrix {
    keyF: KeyFunction;
    widthF: WidthFunction;
    heightF: HeightFunction;
    rowMap: Record<string, number>;
    colMap: Record<string, number>;
    data: MatrixNode[];
    heightPadding: number;
    widthPadding: number;
    maxColumn: number;
    maxRow: number;
    columnWidthMap: Record<string, number>;
    rowHeightMap: Record<string, number>;
    indexMap: Record<string, any>;
    idMap: Record<string, [number, number]>;
    rows: number;
    cols: number;

    constructor(keyF: KeyFunction, widthF: WidthFunction, heightF: HeightFunction,
                rowMap: Record<string, number> = {},
                colMap: Record<string, number> = {},
                data: MatrixNode[] = [], heightPadding: number = 0.0, widthPadding: number = 0.0) {
        this.keyF = keyF;
        this.widthF = widthF;
        this.heightF = heightF;
        this.rowMap = Object.fromEntries(Object.entries(rowMap));
        this.colMap = Object.fromEntries(Object.entries(colMap));
        this.data = data;
        this.heightPadding = heightPadding;
        this.widthPadding = widthPadding;
        if (Object.keys(colMap).length <= 0) {
            this.maxColumn = -1
        } else {
            this.maxColumn = Math.max(...Object.values(this.colMap));
        }
        if (Object.keys(rowMap).length <= 0) {
            this.maxRow = -1
        } else {
            this.maxRow = Math.max(...Object.values(this.rowMap));
        }
        this.columnWidthMap = this.maxLength(this.data, this.keyF, this.widthF, this.colMap);
        this.rowHeightMap = this.maxLength(this.data, this.keyF, this.heightF, this.rowMap);

        this.indexMap = this.getIndexMap();
        this.idMap = this.getIDMap();

        this.rows = this.maxRow + 1;
        this.cols = this.maxColumn + 1;
    }

    maxLength(nodes: any[], keyF: KeyFunction, lengthF: WidthFunction | HeightFunction, indexMap: Record<string, number>): Record<string, number> {
        return Object.entries(indexMap).reduce((acc: Record<string, number>, [id, columnIndex]) => {
            const node = nodes.find((n) => keyF(n) === id);
            const width = node ? lengthF(node) : 0.0;
            const maxWidth = acc[columnIndex] || 0.0;
            acc[columnIndex] = Math.max(width, maxWidth);
            return acc;
        }, {});
    }

    getIndexMap(): Record<string, any> {
        const indexMap: Record<string, any> = {};
        for (const node of this.data) {
            const row = this.rowMap[this.keyF(node)];
            const column = this.colMap[this.keyF(node)];
            indexMap[`${row},${column}`] = node;
        }
        return indexMap;
    }

    getIDMap(): Record<string, [number, number]> {
        const idMap: Record<string, [number, number]> = {};
        for (const node of this.data) {
            const row = this.rowMap[this.keyF(node)];
            const column = this.colMap[this.keyF(node)];
            idMap[this.keyF(node)] = [row, column];
        }
        return idMap;
    }

    getElement(i: number, j: number): any {
        return this.indexMap[`${i},${j}`] || null;
    }

    getElementMatrixIndex(id: string): [number, number] | null {
        return this.idMap[id] || null;
    }

    getElementCoordinate(id: string): [number, number] | null {
        const matrixIndex = this.idMap[id];
        if (matrixIndex) {
            const [i, j] = matrixIndex;
            const y = Array.from({length: i}, (_, row) => this.rowHeightMap[row]).reduce((sum, height) => sum + height, 0) + 2 * i * this.heightPadding;
            const x = Array.from({length: j}, (_, column) => this.columnWidthMap[column]).reduce((sum, width) => sum + width, 0) + 2 * j * this.widthPadding;
            return [x + this.widthPadding, y + this.heightPadding];
        }
        return null;
    }
}

