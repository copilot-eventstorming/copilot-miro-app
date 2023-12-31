import {WorkshopBoardSPI} from "../../spi/WorkshopBoardSPI";
import {GraphFactory, GroupedGraph, groupGraph, NestedGroupNode} from "../../../domain/graph";
import {cleanHtmlTag, convertConnectorToEdgeKey} from "../utils/utils";

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
            .map(convertConnectorToEdgeKey);


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

}