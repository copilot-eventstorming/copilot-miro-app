import {Edge} from "./Edge";
import {Node} from "./Node";

export interface IGraph {
    isConnected(startNodeId: string, endNodeId: string): boolean;
    getNodes(): Node[]
    getEdges(): Edge[]
}