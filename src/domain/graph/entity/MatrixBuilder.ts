// settle all nodes into a matrix, each node corresponds a matrix element, each matrix element corresponds a row and a column
import {GraphFactory} from "./Graph";
import {Matrix} from "./Matrix";
import {MatrixSegment} from "./MatrixSegment";
import {IGraph} from "./IGraph";
import {MatrixNode} from "./MatrixNode";

type SegmentAcc = [MatrixSegment[][], [MatrixSegment[], number, number] | null];

export class MatrixBuilder {
    build(nodes: MatrixNode[], graph: IGraph = GraphFactory.empty(),
          verticalOverlapThreshold: number = 0.5,
          widthPaddingFactor: number = 1.0,
          heightPaddingFactor: number = 1.0,
          horizontalOverlapThreshold: number = 0.5): Matrix {

        let averageWidth = 50;
        let averageHeight = 50;
        if (nodes.length !== 0) {
            averageWidth = nodes.reduce((acc, node) => acc + node.geometry.width, 0) / nodes.length;
            averageHeight = nodes.reduce((acc, node) => acc + node.geometry.height, 0) / nodes.length;
        }

        const columnMap = this.segmentMap(nodes, graph, horizontalOverlapThreshold, (node) => {
            const rectangle = node.invalidateSizing();
            return MatrixSegment.from(node.id, rectangle.x, rectangle.width, node.name)
        });
        const rowMap = this.segmentMap(nodes, GraphFactory.empty(), verticalOverlapThreshold, (node) => {
            const rectangle = node.invalidateSizing();
            return MatrixSegment.from(node.id, rectangle.y, rectangle.height, node.name)
        });

        return new Matrix(
            (node) => node.id,
            (node) => node.geometry.width,
            (node) => node.geometry.height,
            rowMap,
            columnMap,
            nodes, averageHeight * heightPaddingFactor, averageWidth * widthPaddingFactor
        );
    }

    segmentMap(nodes: any[], graph: IGraph, overlapThreshold: number, segmentMaker: (node: any) => MatrixSegment): Record<string, number> {
        const segments = this.mergeSegments(nodes.map(segmentMaker), graph, overlapThreshold);
        return this.buildIdPositionMap(segments);
    }

    buildIdPositionMap(segmentColumns: MatrixSegment[][]): Record<string, number> {
        if (!Array.isArray(segmentColumns)) {
            return {};
        }
        const yss: [string, number][] = segmentColumns.flatMap((segmentColumn, columnIndex) =>
            segmentColumn.map(segment => [segment.id, columnIndex] as [string, number])
        )
        return yss.reduce((acc: Record<string, number>, [id, columnIndex]: [string, number]): Record<string, number> => {
            acc[id] = columnIndex;
            return acc;
        }, {});
    }


    mergeSegments(segments: MatrixSegment[], graph: IGraph, overlapThreshold: number = 0.5): MatrixSegment[][] {
        const zero: SegmentAcc = [[], null];
        const sortedSegments: MatrixSegment[] = segments.sort((oneSegment: MatrixSegment, otherSegment: MatrixSegment) => this.compareTo(oneSegment, otherSegment, graph));
        const [segmentedSegments, incomplete] = sortedSegments.reduce<SegmentAcc>(this.groupSegmentsByOverlapping(overlapThreshold, graph).bind(this), zero);

        if (!incomplete) {
            return segmentedSegments
        } else {
            const segmented: MatrixSegment[][] = [...segmentedSegments]
            segmented.push(incomplete[0])
            return segmented
        }
    }

    compareTo(oneSegment: MatrixSegment, otherSegment: MatrixSegment, graph: IGraph): number {
        if (graph.isConnected(oneSegment.id, otherSegment.id)) {
            return -1;
        } else if (graph.isConnected(otherSegment.id, oneSegment.id)) {
            return 1;
        } else {
            return oneSegment.position - otherSegment.position;
        }
    }

    // 划分同一行或者划分同一列
    groupSegmentsByOverlapping(overlapThreshold: number, graph: IGraph): (acc: SegmentAcc, segment: MatrixSegment) => SegmentAcc {
        return (acc: SegmentAcc, segment: MatrixSegment): SegmentAcc => {
            const [segmentColumns, incompleteColumn] = acc;
            if (!incompleteColumn) {
                return [segmentColumns, [[segment], segment.position, segment.length]];
            } else {
                const [incompleteSegmentColumn, leftMostX, leftLength] = incompleteColumn;
                if (this.tooMuchOverlap(overlapThreshold)(leftMostX, leftLength, segment.position, segment.length)
                    && this.notConnected(incompleteSegmentColumn, segment, graph)) {
                    const tmp: MatrixSegment[] = incompleteSegmentColumn.slice();
                    tmp.push(segment);
                    return [segmentColumns, [tmp, leftMostX, leftLength]];
                } else {
                    return [segmentColumns.concat([incompleteSegmentColumn]), [[segment], segment.position, segment.length]];
                }
            }
        };
    }

    // 如果有箭头连线，说明不是同一行或者不是同一列
    notConnected(aColumnSegments: MatrixSegment[], segment: MatrixSegment, graph: IGraph): boolean {
        return aColumnSegments.every(x => !graph.isConnected(x.id, segment.id));
    }

    // 重合度超过阈值，则视为同一行或者统一列
    tooMuchOverlap(overlapThreshold: number): (x1: number, l1: number, x2: number, l2: number) => boolean {
        return (x1, l1, x2, l2) => {
            const minLength = Math.min(l1, l2);
            const overlapLength = Math.max(0, Math.min(x1 + l1 / 2, x2 + l2 / 2) - Math.max(x1 - l1 / 2, x2 - l2 / 2));
            return overlapLength > overlapThreshold * minLength;
        };
    }
}
