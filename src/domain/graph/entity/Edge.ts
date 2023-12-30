import {Node} from "./Node";

export class Edge {
    constructor(public source: Node, public target: Node, public weight: number) {
    }
}