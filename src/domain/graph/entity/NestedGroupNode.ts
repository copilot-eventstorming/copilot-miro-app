import _ from "lodash";
import {GroupedNode} from "./GroupedNode";
import {calculateDistance, MatrixNode} from "./MatrixNode";
import {Geometry} from "./Geometry";


class MatchContext {
    overlapped: boolean;
    distance: number;
    nearestSubGroup: NestedGroupNode;

    constructor(overlapped: boolean, distance: number, nearestSubGroup: NestedGroupNode) {
        this.overlapped = overlapped;
        this.distance = distance;
        this.nearestSubGroup = nearestSubGroup;
    }
}

export function matchContext(elementGroup: NestedGroupNode, potentialOwningGroup: NestedGroupNode): MatchContext {
    return potentialOwningGroup.calculateBestMatch(elementGroup)
}

export function compareMatchness(a: MatchContext, b: MatchContext): number {
    const {overlapped: aOverlapped, distance: aDistance} = a;
    const {overlapped: bOverlapped, distance: bDistance} = b;

    if (aOverlapped && bOverlapped) {
        return aDistance - bDistance;
    } else if (aOverlapped) {
        return -1;
    } else if (bOverlapped) {
        return 1;
    } else {
        return aDistance - bDistance;
    }
}

export class NestedGroupNode extends GroupedNode {
    parent: NestedGroupNode | null = null;
    subordinates: NestedGroupNode[] = [];
    level: number;

    constructor(centralCard: MatrixNode, subordinates: NestedGroupNode[], level: number, ignoreSatelliteNodes: boolean = false) {
        super(centralCard, subordinates, ignoreSatelliteNodes);
        this.subordinates = subordinates;
        this.subordinates.forEach(subordinate => subordinate.parent = this);
        this.level = level;
    }

    addSubordinate(subordinate: NestedGroupNode): void {
        if (!this.subordinates.includes(subordinate)) {
            subordinate.parent = this;
            this.subordinates.push(subordinate);
            if (!this.satelliteNodes.includes(subordinate)) {
                this.satelliteNodes.push(subordinate);
            }
            this.invalidateGeometry();
        }
    }

    prettyLayoutDeeply(overlapFactor: number = 0.3, padding: number = 10): void {
        if (this.subordinates.length > -1) {
            this.subordinates.forEach(subordinate => {
                subordinate.prettyLayoutDeeply(overlapFactor, padding);
            })
        }
        this.prettyLayout(overlapFactor, padding);
    }

    prettyLayout(overlapFactor: number = 0.1, padding: number = 10): void {
        let total: number = this.subordinates.length;
        if (total === 0) return;
        let subMaxWidth: number = Math.max(...this.subordinates.filter(n => !n.ignoredWhenSizing).map(subordinate => subordinate.invalidateSizing().width));
        let subMaxHeight: number = Math.max(...this.subordinates.filter(n => !n.ignoredWhenSizing).map(subordinate => subordinate.invalidateSizing().height));
        const originalCentralWidth: number = this.centralNode.geometry.width;
        const originalCentralHeight: number = this.centralNode.geometry.height;

        let counts: number[] = [];
        if (this.centralNode.shape === 'square') {
            counts = NestedGroupNode.cardsOnSquarePositions(total);
        } else {
            counts = NestedGroupNode.cardsOnRectanglePositions(total);
        }

        let topCount: number = counts[0] + counts[1] + counts[4];
        let rightCount: number = counts[1] + counts[2] + counts[5];
        let bottomCount: number = counts[2] + counts[3] + counts[6];
        let leftCount: number = counts[0] + counts[3] + counts[7];

        let maxHorizontalCount: number = Math.max(topCount, bottomCount);
        let maxVerticalCount: number = Math.max(leftCount, rightCount);

        let compatWidth: number = maxHorizontalCount * subMaxWidth + (maxHorizontalCount - 1) * padding;
        let looseWidth: number = originalCentralWidth * (1 - (counts[0] + counts[1]) * overlapFactor) + subMaxWidth * (counts[0] + counts[1]);
        let finalWidth: number = Math.max(compatWidth, looseWidth);
        let minCentralWidth: number = finalWidth - (counts[0] + counts[1]) * subMaxWidth + (counts[0] + counts[1]) * overlapFactor * subMaxWidth;

        let compatHeight: number = maxVerticalCount * subMaxHeight + (maxVerticalCount - 1) * padding;
        let looseHeight: number = originalCentralHeight * (1 - (counts[1] + counts[2]) * overlapFactor) + subMaxHeight * (counts[1] + counts[2]);
        let finalHeight: number = Math.max(compatHeight, looseHeight);
        let minCentralHeight: number = finalHeight - (counts[1] + counts[2]) * subMaxHeight + (counts[1] + counts[2]) * overlapFactor * subMaxHeight;
        let ratio: number = originalCentralWidth / originalCentralHeight;

        this.geometry.width = finalWidth;
        this.geometry.height = finalHeight;

        let newCentralWidth: number;
        let newCentralHeight: number;
        if (minCentralHeight * ratio < minCentralWidth) {
            newCentralHeight = minCentralWidth / ratio;
            newCentralWidth = minCentralWidth;
        } else {
            newCentralWidth = minCentralHeight * ratio;
            newCentralHeight = minCentralHeight;
        }
        if (newCentralWidth > originalCentralWidth) {
            this.centralNode.geometry.width = newCentralWidth;
        }
        if (newCentralHeight > originalCentralHeight) {
            this.centralNode.geometry.height = newCentralHeight;
        }

        const scan: number[] = [counts[0], counts[4], counts[1], counts[5], counts[2], counts[6], counts[3], counts[7]].reduce((acc:number[], curr: number) => [...acc, acc.length > 0 ? acc[acc.length - 1] + curr : curr], []);

        this.subordinates.forEach((subordinate, index) => {
            const position: number = scan.findIndex(scanAcc => scanAcc > index);
            const offset: number = index - scan[position - 1];
            let subCoordinateGeometry = subordinate.invalidateSizing();
            let minWidth: number = Math.min(this.centralNode.geometry.width, subCoordinateGeometry.width);
            let minHeight: number = Math.min(this.centralNode.geometry.height, subCoordinateGeometry.height);

            let rightMostCardX: number = this.centralNode.coordinate.x + this.centralNode.geometry.width / 2 - minWidth * overlapFactor + subCoordinateGeometry.width / 2;
            let leftMostCardX: number = this.centralNode.coordinate.x - this.centralNode.geometry.width / 2 + minWidth * overlapFactor - subCoordinateGeometry.width / 2;
            let topMostCardY: number = this.centralNode.coordinate.y - this.centralNode.geometry.height / 2 + minHeight * overlapFactor - subCoordinateGeometry.height / 2;
            let bottomMostCardY: number = this.centralNode.coordinate.y + this.centralNode.geometry.height / 2 - minHeight * overlapFactor + subCoordinateGeometry.height / 2;

            switch (position) {
                case 0: // top left
                    subordinate.setCoordinate({x: leftMostCardX, y: topMostCardY});
                    break;
                case 1: // top middle
                    let positionTopMiddleOffsetX: number = this.centralNode.coordinate.x - (counts[4] * (subMaxWidth) + (counts[4] - 1) * padding) / 2;
                    let cardOffsetTopMiddleX: number = offset * (subMaxWidth + padding) + positionTopMiddleOffsetX;
                    let xTopMiddle: number = cardOffsetTopMiddleX + subCoordinateGeometry.width / 2;

                    subordinate.setCoordinate({
                        x: xTopMiddle, y: topMostCardY
                    });
                    break;
                case 2: // top right
                    subordinate.setCoordinate({
                        x: rightMostCardX, y: topMostCardY
                    });
                    break;
                case 3: // right middle
                    let positionOffsetRightMiddleY: number = this.centralNode.coordinate.y - (counts[5] * (subMaxHeight) + (counts[5] - 1) * padding) / 2;
                    let cardOffsetRightMiddleY: number = offset * (subMaxHeight + padding) + positionOffsetRightMiddleY;
                    let yRightMiddle: number = cardOffsetRightMiddleY + subCoordinateGeometry.height / 2;

                    subordinate.setCoordinate({
                        x: rightMostCardX, y: yRightMiddle
                    });
                    break;
                case 4: // bottom right
                    subordinate.setCoordinate({
                        x: rightMostCardX, y: bottomMostCardY
                    });
                    break;
                case 5: // bottom middle
                    let positionBottomMiddleOffsetX: number = this.centralNode.coordinate.x + (counts[6] * (subMaxWidth) + (counts[6] - 1) * padding) / 2;
                    let cardOffsetBottomMiddleX: number = -offset * (subMaxWidth + padding) + positionBottomMiddleOffsetX;
                    let xBottomMiddle: number = cardOffsetBottomMiddleX - subCoordinateGeometry.width / 2;
                    subordinate.setCoordinate({
                        x: xBottomMiddle, y: bottomMostCardY
                    });
                    break;
                case 6: // bottom left
                    subordinate.setCoordinate({
                        x: leftMostCardX, y: bottomMostCardY
                    });
                    break;
                case 7: // left middle
                    let positionOffsetLeftMiddleY: number = this.centralNode.coordinate.y + (counts[7] * (subMaxHeight) + (counts[7] - 1) * padding) / 2;
                    let cardOffsetLeftMiddleY: number = -offset * (subMaxHeight + padding) + positionOffsetLeftMiddleY;
                    let yLeftMiddle: number = cardOffsetLeftMiddleY - subCoordinateGeometry.height / 2;
                    subordinate.setCoordinate({
                        x: leftMostCardX, y: yLeftMiddle
                    });
                    break;
            }
        });
    }

    static cardsOnSquarePositions(total: number): number[] {
        function f(i: number): (n: number) => number {
            return (n) => n > i ? 1 : 0;
        }

        const ys: number[] = Array(8).fill(0);
        _.range(0, 4).forEach(i => ys[i] = f(i)(total));
        if (total >= 4) {
            _.range(4, 8).forEach(i => ys[i] = Math.floor((total - 4) / 4) + f(i - 4)((total - 4) % 4));
        }

        return ys;
    }

    static cardsOnRectanglePositions(total: number): number[] {
        function f(i: number): (n: number) => number {
            return (n) => n > i ? 1 : 0;
        }

        const ys: number[] = Array(8).fill(0);
        _.range(0, 4).forEach(i => ys[i] = f(i)(total));
        if (total >= 4) {
            ys[4] += 2 * Math.floor((total - 4) / 6) + f(0)((total - 4) % 6) + f(1)((total - 4) % 6);
            ys[5] += Math.floor((total - 4) / 6) + f(2)((total - 4) % 6);
            ys[6] += Math.floor((total - 4) / 6) + f(3)((total - 4) % 6) + f(4)((total - 4) % 6);
            ys[7] += Math.floor((total - 4) / 6) + f(5)((total - 4) % 6);
        }
        return ys;
    }

    overlap(one: MatrixNode, other: MatrixNode): boolean {
        let oneCG = one.invalidateSizing()
        let otherCG = other.invalidateSizing()
        let horizontalOverlap = Math.abs(oneCG.x - otherCG.x) < (oneCG.width + otherCG.width) / 2;
        let verticalOverlap = Math.abs(oneCG.y - otherCG.y) < (oneCG.height + otherCG.height) / 2;

        return horizontalOverlap && verticalOverlap;
    }

    calculateBestMatch(element: any): MatchContext {
        let targetLevel = element.level - 1;
        if (this.level === targetLevel) {
            return new MatchContext(this.overlap(this.centralNode, element), calculateDistance(this.centralNode, element), this)
        } else {
            if (this.level < targetLevel && this.subordinates.length > 0) {
                return this.subordinates.map(subordinate => subordinate.calculateBestMatch(element)).sort(compareMatchness)[0];
            } else {
                return new MatchContext(this.overlap(this.centralNode, element), calculateDistance(this.centralNode, element), this)
            }
        }
    }

    invalidateGeometry(): void {
        let {x, y, width, height} = GroupedNode.sizingRectangle(this.centralNode, this.subordinates);
        this.geometry = Geometry.fromSize(width, height);
        this.setGroupCoordinateOnly({x, y});
        if (this.parent) {
            this.parent.invalidateGeometry();
        }
    }

    setCoordinate(coordinate: any): void {
        super.setCoordinate(coordinate);
        this.invalidateGeometry();
    }
}

