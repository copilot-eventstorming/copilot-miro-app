import {Edge} from "./Edge";

export class Node {
    constructor(public id: string, public name: string, public edges: Edge[] = []) {
    }

    addEdge(edge: Edge): void {
        this.edges.push(edge);
    }
}