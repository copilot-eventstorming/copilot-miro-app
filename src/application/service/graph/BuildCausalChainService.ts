import {WorkshopBoardSPI} from "../../spi/WorkshopBoardSPI";
import {EdgeKey, GraphFactory} from "../../../domain/graph/entity/Graph";
import {groupGraph} from "../../../domain/graph/service/CardClusteringService";
import {NestedGroupNode} from "../../../domain/graph/entity/NestedGroupNode";
import {GroupedGraph} from "../../../domain/graph/entity/GroupedGraph";
import {cleanHtmlTag} from "../utils/utils";
import {Connector} from "@mirohq/websdk-types";

export class CauseChainResult {

    constructor(public nodeNames: [string, string][], public edges: string[][]) {
    }

}

export class BuildCausalChainService {
    private boardSPI: WorkshopBoardSPI;

    constructor(boardSPI: WorkshopBoardSPI) {
        this.boardSPI = boardSPI;
    }

    async perform(cardGroupSequence: NestedGroupNode[][]): Promise<CauseChainResult> {


        const connectors = await this.boardSPI.fetchConnectors();
        const edges = connectors
            .filter(edge => edge.start !== undefined && edge.end !== undefined && edge.start.item !== undefined && edge.end.item !== undefined)
            .map(this.convertConnectorToEdgeKey);


        const graph = GraphFactory.create(cardGroupSequence.flat(), edges);
        const groupedGraph = groupGraph(cardGroupSequence, graph);
        return this.getConnectedNodesAndEdges(cardGroupSequence.flat(), groupedGraph, groupedGraph.isConnected.bind(groupedGraph));
    }

    getConnectedNodesAndEdges(
        allCards: NestedGroupNode[],
        graph: GroupedGraph,
        isConnected: (nodeA: any, nodeB: any) => boolean
    ): CauseChainResult {
        function toName(): (id: string) => [string, string] {
            return (id: string) => {
                const card = allCards.find(card => card.id === id);
                if (card && card.name) return [id, cleanHtmlTag(card!.name)];
                else return [id, id];
            };
        }

        let nodeNames: [string, string][] = Array.from(graph.nodes())
            .map(toName());

        let edges: string[][] = [];

        for (let nodeA of graph.nodes()) {
            for (let nodeB of graph.nodes()) {
                if (nodeA !== nodeB && isConnected(nodeA, nodeB)) {
                    edges.push([toName()(nodeA)[1], toName()(nodeB)[1]]);
                }
            }
        }

        return new CauseChainResult(nodeNames, edges);
    }

    convertConnectorToEdgeKey(edge: Connector): EdgeKey {
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
}