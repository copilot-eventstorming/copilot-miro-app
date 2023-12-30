import {describe, expect, it} from '@jest/globals';
import {MatrixBuilder} from "../../../../src/domain/graph/entity/MatrixBuilder";
import {MatrixNode} from "../../../../src/domain/graph/entity/MatrixNode";
import {EdgeKey, GraphFactory} from "../../../../src/domain/graph/entity/Graph";
import {NestedGroupNode} from "../../../../src/domain/graph/entity/NestedGroupNode";
import {Geometry} from "../../../../src/domain/graph/entity/Geometry";
import {Coordinate} from "../../../../src/domain/graph/entity/Coordinate";
import {MatrixIndex} from "../../../../src/domain/graph/entity/MatrixIndex";

describe('MatrixBuilder', () => {
    const builder = new MatrixBuilder();

    it('should return an empty matrix when build an empty node list', () => {
        const nodes: MatrixNode[] = [];
        const matrix = builder.build(nodes, GraphFactory.empty(), 0.5, 50, 50);
        expect(matrix.rows).toBe(0);
        expect(matrix.cols).toBe(0);
    });

    // ... 其他测试用例

    it('should return a ordered matrix with 4 nodes,3 edges in 4 row and 4 columns without circle, the last node is in column 2, real case on miro', () => {
        const segments: MatrixNode[] = [
            // ... 节点数据
            new MatrixNode("1", "1", '', new Geometry(50, 50, 'rectangle'), new Coordinate(0, 0), MatrixIndex.from(0, 0), 'rectangle'),
            new MatrixNode("2", "2", '', new Geometry(50, 50, 'rectangle'), new Coordinate(50, 50), MatrixIndex.from(0, 0), 'rectangle'),
            new MatrixNode("3", "3", '', new Geometry(50, 50, 'rectangle'), new Coordinate(100, 100), MatrixIndex.from(0, 0), 'rectangle'),
            new MatrixNode("4", "4", '', new Geometry(50, 50, 'rectangle'), new Coordinate(150, 150), MatrixIndex.from(0, 0), 'rectangle')
        ];

        const edges = new Set<EdgeKey>();
        edges.add(new EdgeKey("1", "2", 1));
        edges.add(new EdgeKey("2", "3", 1));
        edges.add(new EdgeKey("3", "4", 1));


        let nodes = segments.map(convertToNodeObject(false));
        const graph = GraphFactory.create(nodes, Array.from(edges));

        const matrix = builder.build(nodes, graph, 0.5, 0.5, 50);

        const xy1 = matrix.getElementMatrixIndex('1');
        const xy2 = matrix.getElementMatrixIndex('2');
        const xy3 = matrix.getElementMatrixIndex('3');
        const xy4 = matrix.getElementMatrixIndex('4');

        expect(xy1).toStrictEqual([0, 0]);
        expect(xy2).toStrictEqual([1, 1]);
        expect(xy3).toStrictEqual([2, 2]);
        expect(xy4).toStrictEqual([3, 3]);
        expect(matrix.rows).toStrictEqual(4);
        expect(matrix.cols).toStrictEqual(4);
    });
});

function convertToNodeObject(ignoredWhenSizing: boolean = false) {
    return (miroObject: any) => {
        let x = miroObject.coordinate.x;
        let y = miroObject.coordinate.y;
        const matrixIndex = MatrixIndex.from(0, 0);
        let r = new NestedGroupNode(new MatrixNode(miroObject.id, miroObject.name, '',
            new Geometry(miroObject.geometry.width, miroObject.geometry.height, miroObject.geometry.shape),
            new Coordinate(x, y),
            matrixIndex, miroObject.geometry.shape), [], 1, ignoredWhenSizing);
        r.style = miroObject.style;
        return r;
    }
}