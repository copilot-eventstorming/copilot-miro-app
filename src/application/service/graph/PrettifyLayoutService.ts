import {OptimizeResult, WorkshopBoardSPI} from "../../spi/WorkshopBoardSPI";
import {Coordinate, Geometry, GraphFactory, groupingLayout, NestedGroupNode} from "../../../domain/graph";
import {convertConnectorToEdgeKey} from "../utils/utils";

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

