import {EdgeKey, GraphFactory, Node} from '../../../../src/domain/graph';

test('return true when 2 nodes have direct connection', () => {

    let a = new Node('A', 'Node A')
    let b = new Node('B', 'Node B' )
    let c = new Node('C', 'Node C' )
    let d = new Node('D', 'Node D' )
    let e = new Node('E', 'Node E' )
    let f = new Node('F', 'Node F' )
    const nodes = [
        a, b, c, d
    ];

    const edgeKeys = [
        new EdgeKey(a.id, b.id, 1),
        new EdgeKey(b.id, c.id, 2),
        new EdgeKey(c.id, d.id, 3),
        new EdgeKey(d.id, a.id, 4),
    ];

    const graph = GraphFactory.create(nodes, edgeKeys);

    // 测试 isConnected 方法
    expect(graph.isConnected(a.id, b.id)).toBe(true);
    expect(graph.isConnected(a.id, c.id)).toBe(true);
    expect(graph.isConnected(a.id, d.id)).toBe(true);
    expect(graph.isConnected(b.id, c.id)).toBe(true);
    expect(graph.isConnected(b.id, d.id)).toBe(true);
    expect(graph.isConnected(c.id, d.id)).toBe(true);
    expect(graph.isConnected(a.id, e.id)).toBe(false);

});