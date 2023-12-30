import {MatrixNode} from "./MatrixNode";
import {Geometry} from "./Geometry";
import {Coordinate} from "./Coordinate";

type Rectangle = {
    x: number,
    y: number,
    width: number,
    height: number
};

export class GroupedNode extends MatrixNode {
    ignoredWhenSizing: boolean;
    centralNode: MatrixNode;
    satelliteNodes: GroupedNode[];

    constructor(centralNode: MatrixNode, satelliteNodes: GroupedNode[], ignoredWhenSizing: boolean = false) {
        let {x, y, width, height} = GroupedNode.sizingRectangle(centralNode, satelliteNodes);
        super(centralNode.id, centralNode.name, centralNode.category, Geometry.fromSize(width, height), Coordinate.from(x, y), centralNode.matrixIndex);
        this.centralNode = centralNode;
        this.satelliteNodes = satelliteNodes;
        this.ignoredWhenSizing = ignoredWhenSizing;
    }

    static sizingRectangle(centralNode: MatrixNode, satelliteNodes: GroupedNode[]): Rectangle {
        let coordinateGeometry = centralNode.invalidateSizing();
        let left = coordinateGeometry.x - coordinateGeometry.width / 2;
        let top = coordinateGeometry.y - coordinateGeometry.height / 2;
        let right = coordinateGeometry.x + coordinateGeometry.width / 2;
        let bottom = coordinateGeometry.y + coordinateGeometry.height / 2;

        let leftMost = GroupedNode.sizingSatellites(satelliteNodes).map(node => {
            let nodeCG = node.invalidateSizing();
            return nodeCG.x - nodeCG.width / 2;
        })
            .reduce((acc, cur) => Math.min(acc, cur), left);

        let topMost = GroupedNode.sizingSatellites(satelliteNodes).map(node => {
            let nodeCG = node.invalidateSizing();
            return nodeCG.y - nodeCG.height / 2;
        })
            .reduce((acc, cur) => Math.min(acc, cur), top);

        let rightMost = GroupedNode.sizingSatellites(satelliteNodes).map(node => {
            let nodeCG = node.invalidateSizing();
            return nodeCG.x + nodeCG.width / 2;
        })
            .reduce((acc, cur) => Math.max(acc, cur), right);

        let bottomMost = GroupedNode.sizingSatellites(satelliteNodes).map(node => {
            let nodeCG = node.invalidateSizing();
            return nodeCG.y + nodeCG.height / 2;
        })
            .reduce((acc, cur) => Math.max(acc, cur), bottom);

        return {
            x: (rightMost + leftMost) / 2,
            y: (topMost + bottomMost) / 2,
            width: rightMost - leftMost,
            height: -topMost + bottomMost
        };
    }

    invalidateSizing(): Rectangle {
        return GroupedNode.sizingRectangle(this.centralNode, this.satelliteNodes);
    }

    static sizingSatellites(satelliteNodes: GroupedNode[]): MatrixNode[] {
        return satelliteNodes.filter(node => !node.ignoredWhenSizing);
    }

    setCoordinate(coordinate: Coordinate): void {
        let {x, y, width, height} = GroupedNode.sizingRectangle(this.centralNode, this.satelliteNodes);
        let centerX = x;
        let centerY = y;
        let deltaX = coordinate.x - centerX;
        let deltaY = coordinate.y - centerY;
        this.setGroupCoordinateOnly(coordinate);
        this.centralNode.coordinate.x += deltaX;
        this.centralNode.coordinate.y += deltaY;
        for (const satelliteNode of this.satelliteNodes) {
            const cg = satelliteNode.invalidateSizing();
            satelliteNode.setCoordinate({
                x: cg.x + deltaX, y: cg.y + deltaY
            });
        }
    }

    setGroupCoordinateOnly(coordinate: Coordinate): void {
        this.coordinate = coordinate;
    }
}