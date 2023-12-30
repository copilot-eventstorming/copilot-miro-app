import {IGraph} from "./IGraph";
import {Node} from "./Node";
import {Edge} from "./Edge";

export class Graph implements IGraph {
    nodes: Map<string, Node>;
    edges: Edge[];

    constructor(nodes: Node[], edges: EdgeKey[]) {
        this.nodes = new Map(nodes.map(node => [node.id, node]));
        this.edges = [];

        edges.forEach(edgeKey => {
            if (this.nodes.has(edgeKey.sourceId) && this.nodes.has(edgeKey.targetId)) {
                const sourceNode = this.nodes.get(edgeKey.sourceId);
                const targetNode = this.nodes.get(edgeKey.targetId);
                if (sourceNode !== undefined && targetNode !== undefined) {
                    const edge = EdgeFactory.create(sourceNode, targetNode, edgeKey.weight);
                    this.edges.push(edge);
                    sourceNode.addEdge(edge);
                }
            }
        });
    }

    getNodes(): Node[] {
        return Array.from(this.nodes.values());
    }

    getEdges(): Edge[] {
        return this.edges;
    }

    isConnected(startNodeId: string, targetNodeId: string): boolean {
        return this.dfs(this.nodes.get(startNodeId), this.nodes.get(targetNodeId), new Set<Node>());
    }

    private dfs = (current: Node | undefined, target: Node | undefined, visited: Set<Node>): boolean => {
        if (!current || !target || !current.edges) return false;
        if (current === target) return true;
        visited.add(current);
        return current.edges.some(edge => !visited.has(edge.target) && this.dfs(edge.target, target, visited));
    }
}

export class EdgeKey {
    constructor(public sourceId: string, public targetId: string, public weight: number) {
    }
}

export class EdgeFactory {
    static create = (source: Node, target: Node, weight: number): Edge => new Edge(source, target, weight);
}

export class GraphFactory {
    static create = (nodes: Node[], edges: EdgeKey[]): Graph => new Graph(nodes, edges);
    static empty = (): Graph => new Graph([], []);
}