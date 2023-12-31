import {OptimizeResult, WorkshopBoardSPI} from "../../spi/WorkshopBoardSPI";
import {EdgeKey, GraphFactory} from "../../../domain/graph/entity/Graph";
import {groupingLayout} from "../../../domain/graph";
import {Connector} from "@mirohq/websdk-types";
import {NestedGroupNode} from "../../../domain/graph/entity/NestedGroupNode";
import {Coordinate} from "../../../domain/graph/entity/Coordinate";
import {Geometry} from "../../../domain/graph/entity/Geometry";

export class PrettifyLayoutService {
    private boardSPI: WorkshopBoardSPI;

    constructor(boardSPI: WorkshopBoardSPI) {
        this.boardSPI = boardSPI;
    }

    async perform(
        groupSequence: NestedGroupNode[][],
        widthPadding: number,
        heightPadding: number,
        hOverlapThreshold: number,
        vOverlapThreshold: number
    ): Promise<OptimizeResult> {
        const connectors = await this.boardSPI.fetchConnectors();
        const edges = connectors
            .filter(edge => edge.start !== undefined && edge.end !== undefined && edge.start.item !== undefined && edge.end.item !== undefined)
            .map(convertConnectorToEdgeKey);
        const graph = GraphFactory.create(groupSequence.flat(), edges);

        const coordinates: [string, Coordinate, Geometry][] = groupingLayout(groupSequence, graph, widthPadding, heightPadding, vOverlapThreshold, hOverlapThreshold);

        const prettyCoordinates = coordinates.map(node => ({id: node[0], x: node[1].x, y: node[1].y}));

        return await this.boardSPI.moveCards2(prettyCoordinates);
    }
}

function convertConnectorToEdgeKey(edge: Connector): EdgeKey {
    let start = edge!.start;
    let end = edge!.end;
    if (edge.style.startStrokeCap === 'none' && edge.style.endStrokeCap === 'none') {
    } else if (edge.style.startStrokeCap !== 'none' && edge.style.endStrokeCap !== 'none') {
    } else if (edge.style.startStrokeCap !== 'none') {
        start = edge.end;
        end = edge.start;
    }
    let weight;
    if (edge.style.strokeStyle === 'normal') {
        weight = 1;
    } else if (edge.style.strokeStyle === 'dotted') {
        weight = 0.1;
    } else {// if (edge.style.strokeStyle == 'dashed') {
        weight = 0.5;
    }
    return new EdgeKey(start!.item, end!.item, weight);
}