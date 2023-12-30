import {GroupedGraph} from "../entity/GroupedGraph";
import {GroupedNode} from "../entity/GroupedNode";
import {compareMatchness, matchContext, NestedGroupNode} from "../entity/NestedGroupNode";
import {Graph, GraphFactory} from "../entity/Graph";
import {IGraph} from "../entity/IGraph";
import {Coordinate} from "../entity/Coordinate";
import {MatrixBuilder} from "../entity/MatrixBuilder";
import {Geometry} from "../entity/Geometry";

export function groupCards(grouped: NestedGroupNode[], cardGroupList: NestedGroupNode[][], pretty: boolean = true, overlap: number = 0.3): NestedGroupNode[] {
    if (cardGroupList.length === 0) {
        return grouped;
    } else {
        let headGroup = cardGroupList[0];
        if (grouped.length === 0) {
            return groupCards(headGroup, cardGroupList.slice(1), pretty, overlap);
        }
        for (const element of headGroup) {
            let groupSortedByMatchness = grouped.map(g => matchContext(element, g)).sort(compareMatchness)
            let bestGroup = groupSortedByMatchness[0];
            bestGroup.nearestSubGroup.addSubordinate(element);
        }
        return groupCards(grouped, cardGroupList.slice(1), pretty, overlap);
    }
}

const matrixBuild = new MatrixBuilder()

function layoutNodes(nodes: NestedGroupNode[], graph: IGraph = GraphFactory.empty(), widthPaddingFactor: number = 1, heightPaddingFactor: number = 1, verticalOverlapThreshold: number = 0.5, horizontalOverlapThreshold: number = 0.9): any[] {

    const matrix = matrixBuild.build(nodes, graph, verticalOverlapThreshold, widthPaddingFactor, heightPaddingFactor, horizontalOverlapThreshold);
    nodes.forEach((node) => {
        const matrixIndex = matrix.getElementMatrixIndex(node.id);
        if (matrixIndex !== null) {
            const [x, y] = matrixIndex;
            // 使用 x 和 y 的代码...
            node.setMatrixIndex(x, y);
        } else {
            // 处理 matrixIndex 为 null 的情况...
        }
    })
    nodes.forEach((node) => {
        const coordinate = matrix.getElementCoordinate(node.id);
        if (coordinate !== null) {
            const [x, y] = coordinate;
            node.setCoordinate(Coordinate.from(x, y));
        }
    })
    return nodes;
}

function groupingLayout(groupSequence: NestedGroupNode[][], graph: Graph,
                        widthPaddingFactor: number, heightPaddingFactor: number, verticalOverlapThreshold: number, horizontalOverlapThreshold: number): [string, Coordinate, Geometry][] {
    const groups: NestedGroupNode[] = groupCards([], groupSequence);
    groups.forEach(group => group.prettyLayoutDeeply(0.3, 10));
    let groupGraph = buildGroupGraph(groups, graph);
    layoutNodes(groups, groupGraph, widthPaddingFactor, heightPaddingFactor, verticalOverlapThreshold, horizontalOverlapThreshold);
    return groups.flatMap(extractGroupCoordinate);
}

function groupGraph(groupSequence: NestedGroupNode[][], graph: Graph): GroupedGraph {
    const groups: NestedGroupNode[] = groupCards([], groupSequence);
    return buildGroupGraph(groups, graph);
}

function extractGroupCoordinate(group: GroupedNode): [string, Coordinate, Geometry][] {
    let selfCoordinate:[string, Coordinate, Geometry][] = [[group.centralNode.id, group.centralNode.coordinate, group.centralNode.geometry]];
    if (group.satelliteNodes.length === 0) {
        return selfCoordinate
    } else {
        return group.satelliteNodes
            .flatMap(extractGroupCoordinate)
            .concat(selfCoordinate)
    }
}

function buildGroupGraph(groups: NestedGroupNode[], graph: Graph): GroupedGraph {
    let group2NodeMapping: Map<string, string[]> = groups.reduce((acc: Map<string, string[]>, group: NestedGroupNode) => {
        acc.set(group.id, group.satelliteNodes.map(x => x.id).concat([group.centralNode.id]));
        return acc;
    }, new Map<string, string[]>());
    return new GroupedGraph(graph, group2NodeMapping);
}

export {groupGraph};
export {groupingLayout};
export {layoutNodes};