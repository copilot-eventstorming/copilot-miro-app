import {Edge} from "./Edge";
import {IGraph} from "./IGraph";
import {Node} from "./Node";

export class GroupedGraph implements IGraph {
    private graph: IGraph;
    private node2GroupMapping: Map<string, string>;
    private group2NodeMapping: Map<string, string[]>;

    constructor(graph: IGraph, group2NodeMapping: Map<string, string[]>) {
        this.graph = graph;
        this.group2NodeMapping = group2NodeMapping;
        this.node2GroupMapping = this.reverseIndexing(group2NodeMapping);
    }

    getNodes(): Node[] {
        return this.graph.getNodes();
    }
    getEdges(): Edge[] {
        return this.graph.getEdges();
    }

    private reverseIndexing = (group2NodeMapping: Map<string, string[]>): Map<string, string> => {
        return Array.from(group2NodeMapping.entries()).reduce((acc: Map<string, string>, [group, nodes]) => {
            nodes.forEach(node => acc.set(node, group));
            return acc;
        }, new Map<string, string>());
    }

    public isConnected = (startGroupId: string, endGroupId: string): boolean => {
        const startGroupNodeIds = this.group2NodeMapping.get(startGroupId) || [];
        const endGroupNodeIds = this.group2NodeMapping.get(endGroupId) || [];
        for (const startNodeId of startGroupNodeIds) {
            for (const endNodeId of endGroupNodeIds) {
                if (this.graph.isConnected(startNodeId, endNodeId)) {
                    return true;
                }
            }
        }
        return false;
    }

    public nodes = (): string[] => {

        return Array.from(this.group2NodeMapping.keys());
    }
}