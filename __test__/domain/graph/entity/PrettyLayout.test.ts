import {Geometry, MatrixIndex, MatrixNode, NestedGroupNode} from "../../../../src/domain/graph";


test('square center: 1 node only on top left corner', () => {
    const ys = NestedGroupNode.cardsOnSquarePositions(1)
    expect(ys[0]).toEqual(1)
    expect(ys[1]).toEqual(0)
    expect(ys[2]).toEqual(0)
    expect(ys[3]).toEqual(0)
    expect(ys[4]).toEqual(0)
    expect(ys[5]).toEqual(0)
    expect(ys[6]).toEqual(0)
    expect(ys[7]).toEqual(0)
})
test('square center: 2 node on top left corner and top right corner', () => {
    const ys = NestedGroupNode.cardsOnSquarePositions(2)
    expect(ys[0]).toEqual(1)
    expect(ys[1]).toEqual(1)
    expect(ys[2]).toEqual(0)
    expect(ys[3]).toEqual(0)
    expect(ys[4]).toEqual(0)
    expect(ys[5]).toEqual(0)
    expect(ys[6]).toEqual(0)
    expect(ys[7]).toEqual(0)
})
test('square center: 3 node on top left corner, top right corner, and right bottom corner', () => {
    const ys = NestedGroupNode.cardsOnSquarePositions(3)
    expect(ys[0]).toEqual(1)
    expect(ys[1]).toEqual(1)
    expect(ys[2]).toEqual(1)
    expect(ys[3]).toEqual(0)
    expect(ys[4]).toEqual(0)
    expect(ys[5]).toEqual(0)
    expect(ys[6]).toEqual(0)
    expect(ys[7]).toEqual(0)
})
test('square center: 4 node on each corner', () => {
    const ys = NestedGroupNode.cardsOnSquarePositions(4)
    expect(ys[0]).toEqual(1)
    expect(ys[1]).toEqual(1)
    expect(ys[2]).toEqual(1)
    expect(ys[3]).toEqual(1)
    expect(ys[4]).toEqual(0)
    expect(ys[5]).toEqual(0)
    expect(ys[6]).toEqual(0)
    expect(ys[7]).toEqual(0)
})

test('square center: 5 nodes:  each node on each corner, 1 on top edge', () => {
    const ys = NestedGroupNode.cardsOnSquarePositions(5)
    expect(ys[0]).toEqual(1)
    expect(ys[1]).toEqual(1)
    expect(ys[2]).toEqual(1)
    expect(ys[3]).toEqual(1)
    expect(ys[4]).toEqual(1)
    expect(ys[5]).toEqual(0)
    expect(ys[6]).toEqual(0)
    expect(ys[7]).toEqual(0)
})
test('square center: 6 nodes:  each node on each corner, 1 on top edge, 1 on right edge', () => {
    const ys = NestedGroupNode.cardsOnSquarePositions(6)
    expect(ys[0]).toEqual(1)
    expect(ys[1]).toEqual(1)
    expect(ys[2]).toEqual(1)
    expect(ys[3]).toEqual(1)
    expect(ys[4]).toEqual(1)
    expect(ys[5]).toEqual(1)
    expect(ys[6]).toEqual(0)
    expect(ys[7]).toEqual(0)
})
test('square center: 7 nodes:  each node on each corner, 1 on top edge, 1 on right edge, 1 on bottom edge', () => {
    const ys = NestedGroupNode.cardsOnSquarePositions(7)
    expect(ys[0]).toEqual(1)
    expect(ys[1]).toEqual(1)
    expect(ys[2]).toEqual(1)
    expect(ys[3]).toEqual(1)
    expect(ys[4]).toEqual(1)
    expect(ys[5]).toEqual(1)
    expect(ys[6]).toEqual(1)
    expect(ys[7]).toEqual(0)
})
test('square center: 8 nodes:  each node on each corner, 1 on top edge, 1 on right edge, 1 on bottom edge, 1 on left', () => {
    const ys = NestedGroupNode.cardsOnSquarePositions(8)
    expect(ys[0]).toEqual(1)
    expect(ys[1]).toEqual(1)
    expect(ys[2]).toEqual(1)
    expect(ys[3]).toEqual(1)
    expect(ys[4]).toEqual(1)
    expect(ys[5]).toEqual(1)
    expect(ys[6]).toEqual(1)
    expect(ys[7]).toEqual(1)
})
test('square center: 9 nodes:  each node on each corner, 2 on top edge, 1 on right edge, 1 on bottom edge, 1 on left', () => {
    const ys = NestedGroupNode.cardsOnSquarePositions(9)
    expect(ys[0]).toEqual(1)
    expect(ys[1]).toEqual(1)
    expect(ys[2]).toEqual(1)
    expect(ys[3]).toEqual(1)
    expect(ys[4]).toEqual(2)
    expect(ys[5]).toEqual(1)
    expect(ys[6]).toEqual(1)
    expect(ys[7]).toEqual(1)
})
test('square center: 10 nodes:  each node on each corner, 2 on top edge, 2 on right edge, 1 on bottom edge, 1 on left', () => {
    const ys = NestedGroupNode.cardsOnSquarePositions(10)
    expect(ys[0]).toEqual(1)
    expect(ys[1]).toEqual(1)
    expect(ys[2]).toEqual(1)
    expect(ys[3]).toEqual(1)
    expect(ys[4]).toEqual(2)
    expect(ys[5]).toEqual(2)
    expect(ys[6]).toEqual(1)
    expect(ys[7]).toEqual(1)
})
test('square center: 11 nodes:  each node on each corner, 2 on top edge, 2 on right edge, 2 on bottom edge, 1 on left', () => {
    const ys = NestedGroupNode.cardsOnSquarePositions(11)
    expect(ys[0]).toEqual(1)
    expect(ys[1]).toEqual(1)
    expect(ys[2]).toEqual(1)
    expect(ys[3]).toEqual(1)
    expect(ys[4]).toEqual(2)
    expect(ys[5]).toEqual(2)
    expect(ys[6]).toEqual(2)
    expect(ys[7]).toEqual(1)
})
test('square center: 12 nodes:  each node on each corner, 2 on top edge, 2 on right edge, 2 on bottom edge, 2 on left', () => {
    const ys = NestedGroupNode.cardsOnSquarePositions(12)
    expect(ys[0]).toEqual(1)
    expect(ys[1]).toEqual(1)
    expect(ys[2]).toEqual(1)
    expect(ys[3]).toEqual(1)
    expect(ys[4]).toEqual(2)
    expect(ys[5]).toEqual(2)
    expect(ys[6]).toEqual(2)
    expect(ys[7]).toEqual(2)
})

test('pretty layout algorithm should process 1 event and 1 command on event top left corner with 1% overlap', () => {
    // Given
    const event = new NestedGroupNode(new MatrixNode('1', 'domain event', 'event', new Geometry(100, 100, 'square'), {
        x: 0, y: 0
    }, MatrixIndex.from(0, 0), 'square'), [], 0, false)
    const command = new NestedGroupNode(new MatrixNode('10', 'c1', 'command', new Geometry(100, 100, 'square'), {
        x: 100, y: 100
    }, MatrixIndex.from(0, 0), 'square'), [], 1, false)

    event.addSubordinate(command)

    // When
    event.prettyLayoutDeeply(0.1, 10)

    const groupCenter = event.getCoordinate()
    const eventCenter = event.centralNode.getCoordinate()
    const commandCenter = command.getCoordinate()

    // Then
    expect(groupCenter).toEqual({x: -45, y: -45});
    expect(eventCenter).toEqual({x: 0, y: 0});
    expect(commandCenter).toEqual({x: -90, y: -90});
})
test('pretty layout algorithm should process 1 event and 2 command on event top left and top right corners with 1% overlap', () => {
    // Given
    const event = new NestedGroupNode(new MatrixNode('1', 'domain event', 'event', new Geometry(100, 100, 'square'), {
        x: 0, y: 0
    }, MatrixIndex.from(0, 0), 'square'), [], 0, false)
    const command = new NestedGroupNode(new MatrixNode('10', 'c1', 'command', new Geometry(100, 100, 'square'), {
        x: 100, y: 100
    }, MatrixIndex.from(0, 0), 'square'), [], 1, false)
    const command2 = new NestedGroupNode(new MatrixNode('11', 'c2', 'command', new Geometry(100, 100, 'square'), {
        x: 200, y: 100
    }, MatrixIndex.from(0, 0), 'square'), [], 1, false)

    event.addSubordinate(command)
    event.addSubordinate(command2)
    // When
    event.prettyLayoutDeeply(0.1, 10)

    const groupCenter = event.getCoordinate()
    const eventCenter = event.centralNode.getCoordinate()
    const commandCenter = command.getCoordinate()
    const command2Center = command2.getCoordinate()

    const groupWidth = 280
    const groupHeight = 190

    // Then
    expect(groupCenter).toEqual({x: 0, y: -45});
    expect(eventCenter).toEqual({x: 0, y: 0});
    expect(commandCenter).toEqual({x: -90, y: -90});
    expect(command2Center).toEqual({x: 90, y: -90})
    expect(event.geometry.width).toEqual(groupWidth)
    expect(event.geometry.height).toEqual(groupHeight)
})

test('pretty layout algorithm should process 1 event and 3 command on event top left and top right and bottom right corners with 1% overlap', () => {
    // Given
    const event = new NestedGroupNode(new MatrixNode('1', 'domain event', 'event', new Geometry(100, 100, 'square'), {
        x: 0, y: 0
    }, MatrixIndex.from(0, 0), 'square'), [], 0, false)
    const command = new NestedGroupNode(new MatrixNode('10', 'c1', 'command', new Geometry(100, 100, 'square'), {
        x: 100, y: 100
    }, MatrixIndex.from(0, 0), 'square'), [], 1, false)
    const command2 = new NestedGroupNode(new MatrixNode('11', 'c2', 'command', new Geometry(100, 100, 'square'), {
        x: 200, y: 100
    }, MatrixIndex.from(0, 0), 'square'), [], 1, false)
    const command3 = new NestedGroupNode(new MatrixNode('12', 'c3', 'command', new Geometry(100, 100, 'square'), {
        x: 200, y: 200
    }, MatrixIndex.from(0, 0), 'square'), [], 1, false)

    event.addSubordinate(command)
    event.addSubordinate(command2)
    event.addSubordinate(command3)

    // When
    event.prettyLayoutDeeply(0.1, 10)

    const groupCenter = event.getCoordinate()
    const eventCenter = event.centralNode.getCoordinate()
    const commandCenter = command.getCoordinate()
    const command2Center = command2.getCoordinate()
    const command3Center = command3.getCoordinate()

    // Then
    expect(groupCenter).toEqual({x: 0, y: 0});
    expect(eventCenter).toEqual({x: 0, y: 0});
    expect(commandCenter).toEqual({x: -90, y: -90});
    expect(command2.getCoordinate()).toEqual({x: 90, y: -90})
    expect(event.invalidateSizing().width).toEqual(280)
    expect(event.invalidateSizing().height).toEqual(280)
    expect(command3.getCoordinate()).toEqual({x: 90, y: 90})
})
test('pretty layout algorithm should process 1 event and 4 command on every corner with 1% overlap', () => {
    // Given
    const event = new NestedGroupNode(new MatrixNode('1', 'domain event', 'event', new Geometry(100, 100, 'square'), {
        x: 0, y: 0
    }, MatrixIndex.from(0, 0), 'square'), [], 0, false)
    const command = new NestedGroupNode(new MatrixNode('10', 'c1', 'command', new Geometry(100, 100, 'square'), {
        x: 100, y: 100
    }, MatrixIndex.from(0, 0), 'square'), [], 1, false)
    const command2 = new NestedGroupNode(new MatrixNode('11', 'c2', 'command', new Geometry(100, 100, 'square'), {
        x: 200, y: 100
    }, MatrixIndex.from(0, 0), 'square'), [], 1, false)
    const command3 = new NestedGroupNode(new MatrixNode('12', 'c3', 'command', new Geometry(100, 100, 'square'), {
        x: 200, y: 200
    }, MatrixIndex.from(0, 0), 'square'), [], 1, false)
    const command4 = new NestedGroupNode(new MatrixNode('13', 'c4', 'command', new Geometry(100, 100, 'square'), {
        x: 100, y: 200
    }, MatrixIndex.from(0, 0), 'square'), [], 1, false)

    event.addSubordinate(command)
    event.addSubordinate(command2)
    event.addSubordinate(command3)
    event.addSubordinate(command4)

    // When
    event.prettyLayoutDeeply(0.1, 10)

    const groupCenter = event.getCoordinate()
    const eventCenter = event.centralNode.getCoordinate()
    const commandCenter = command.getCoordinate()
    const command2Center = command2.getCoordinate()
    const command3Center = command3.getCoordinate()
    const command4Center = command4.getCoordinate()

    // Then
    expect(event.invalidateSizing().width).toEqual(280)
    expect(event.invalidateSizing().height).toEqual(280)
    expect(groupCenter).toEqual({x: 0, y: 0});
    expect(eventCenter).toEqual({x: 0, y: 0});
    expect(commandCenter).toEqual({x: -90, y: -90});
    expect(command2Center).toEqual({x: 90, y: -90})
    expect(command3Center).toEqual({x: 90, y: 90})
    expect(command4Center).toEqual({x: -90, y: 90})
})
test('pretty layout algorithm should process 1 event and 5 command on top middle', () => {
    // Given
    const event = new NestedGroupNode(new MatrixNode('1', 'domain event', 'event', new Geometry(100, 100, 'square'), {
        x: 0, y: 0
    }, MatrixIndex.from(0, 0), 'square'), [], 0, false)
    const command = new NestedGroupNode(new MatrixNode('10', 'c1', 'command', new Geometry(100, 100, 'square'), {
        x: 100, y: 100
    }, MatrixIndex.from(0, 0), 'square'), [], 1, false)
    const command2 = new NestedGroupNode(new MatrixNode('11', 'c2', 'command', new Geometry(100, 100, 'square'), {
        x: 200, y: 100
    }, MatrixIndex.from(0, 0), 'square'), [], 1, false)
    const command3 = new NestedGroupNode(new MatrixNode('12', 'c3', 'command', new Geometry(100, 100, 'square'), {
        x: 200, y: 200
    }, MatrixIndex.from(0, 0), 'square'), [], 1, false)
    const command4 = new NestedGroupNode(new MatrixNode('13', 'c4', 'command', new Geometry(100, 100, 'square'), {
        x: 100, y: 200
    }, MatrixIndex.from(0, 0), 'square'), [], 1, false)
    const command5 = new NestedGroupNode(new MatrixNode('14', 'c5', 'command', new Geometry(100, 100, 'square'), {
        x: 100, y: 200
    }, MatrixIndex.from(0, 0), 'square'), [], 1, false)
    // When
    event.addSubordinate(command)
    event.addSubordinate(command2)
    event.addSubordinate(command3)
    event.addSubordinate(command4)
    event.addSubordinate(command5)

    // When
    event.prettyLayoutDeeply(0.1, 10)

    const groupCenter = event.getCoordinate()
    const eventCenter = event.centralNode.getCoordinate()
    const commandCenter = command.getCoordinate()
    const command2Center = command2.getCoordinate()
    const command3Center = command3.getCoordinate()
    const command4Center = command4.getCoordinate()
    const command5Center = command5.getCoordinate()

    // Then
    expect(event.invalidateSizing().width).toEqual(320)
    expect(event.invalidateSizing().height).toEqual(320)
    expect(groupCenter).toEqual({x: 0, y: 0});
    expect(eventCenter).toEqual({x: 0, y: 0});
    expect(commandCenter).toEqual({x: -110, y: -110});
    expect(command2Center).toEqual({x: 0, y: -110})
    expect(command3Center).toEqual({x: 110, y: -110})
    expect(command4Center).toEqual({x: 110, y: 110})
    expect(command5Center).toEqual({x: -110, y: 110})
})

test('pretty layout algorithm should process 1 event and 6 command on top middle', () => {
    // Given
    const event = new NestedGroupNode(new MatrixNode('1', 'domain event', 'event', new Geometry(100, 100, 'square'), {
        x: 0, y: 0
    }, MatrixIndex.from(0, 0), 'square'), [], 0, false)
    const command = new NestedGroupNode(new MatrixNode('10', 'c1', 'command', new Geometry(100, 100, 'square'), {
        x: 100, y: 100
    }, MatrixIndex.from(0, 0), 'square'), [], 1, false)
    const command2 = new NestedGroupNode(new MatrixNode('11', 'c2', 'command', new Geometry(100, 100, 'square'), {
        x: 200, y: 100
    }, MatrixIndex.from(0, 0), 'square'), [], 1, false)
    const command3 = new NestedGroupNode(new MatrixNode('12', 'c3', 'command', new Geometry(100, 100, 'square'), {
        x: 200, y: 200
    }, MatrixIndex.from(0, 0), 'square'), [], 1, false)
    const command4 = new NestedGroupNode(new MatrixNode('13', 'c4', 'command', new Geometry(100, 100, 'square'), {
        x: 100, y: 200
    }, MatrixIndex.from(0, 0), 'square'), [], 1, false)
    const command5 = new NestedGroupNode(new MatrixNode('14', 'c5', 'command', new Geometry(100, 100, 'square'), {
        x: 100, y: 200
    }, MatrixIndex.from(0, 0), 'square'), [], 1, false)
    const command6 = new NestedGroupNode(new MatrixNode('15', 'c6', 'command', new Geometry(100, 100, 'square'), {
        x: 100, y: 200
    }, MatrixIndex.from(0, 0), 'square'), [], 1, false)
    // When
    event.addSubordinate(command)
    event.addSubordinate(command2)
    event.addSubordinate(command3)
    event.addSubordinate(command4)
    event.addSubordinate(command5)
    event.addSubordinate(command6)

    // When
    event.prettyLayoutDeeply(0.1, 10)

    // Then
    const groupCenter = event.getCoordinate()
    const eventCenter = event.centralNode.getCoordinate()
    const commandCenter = command.getCoordinate()
    const command2Center = command2.getCoordinate()
    const command3Center = command3.getCoordinate()
    const command4Center = command4.getCoordinate()
    const command5Center = command5.getCoordinate()
    const command6Center = command6.getCoordinate()

    expect(event.invalidateSizing().width).toEqual(320)
    expect(event.invalidateSizing().height).toEqual(320)
    expect(groupCenter).toEqual({x: 0, y: 0});
    expect(eventCenter).toEqual({x: 0, y: 0});
    expect(commandCenter).toEqual({x: -110, y: -110});
    expect(command2Center).toEqual({x: 0, y: -110})
    expect(command3Center).toEqual({x: 110, y: -110})
    expect(command4Center).toEqual({x: 110, y: 0})
    expect(command5Center).toEqual({x: 110, y: 110})
    expect(command6Center).toEqual({x: -110, y: 110})
})
test('pretty layout algorithm should process 1 event and 8 command on top middle', () => {
    // Given
    const event = new NestedGroupNode(new MatrixNode('1', 'domain event', 'event', new Geometry(100, 100, 'square'), {
        x: 0, y: 0
    }, MatrixIndex.from(0, 0), 'square'), [], 0, false)
    const command = new NestedGroupNode(new MatrixNode('10', 'c1', 'command', new Geometry(100, 100, 'square'), {
        x: 100, y: 100
    }, MatrixIndex.from(0, 0), 'square'), [], 1, false)
    const command2 = new NestedGroupNode(new MatrixNode('11', 'c2', 'command', new Geometry(100, 100, 'square'), {
        x: 200, y: 100
    }, MatrixIndex.from(0, 0), 'square'), [], 1, false)
    const command3 = new NestedGroupNode(new MatrixNode('12', 'c3', 'command', new Geometry(100, 100, 'square'), {
        x: 200, y: 200
    }, MatrixIndex.from(0, 0), 'square'), [], 1, false)
    const command4 = new NestedGroupNode(new MatrixNode('13', 'c4', 'command', new Geometry(100, 100, 'square'), {
        x: 100, y: 200
    }, MatrixIndex.from(0, 0), 'square'), [], 1, false)
    const command5 = new NestedGroupNode(new MatrixNode('14', 'c5', 'command', new Geometry(100, 100, 'square'), {
        x: 100, y: 200
    }, MatrixIndex.from(0, 0), 'square'), [], 1, false)
    const command6 = new NestedGroupNode(new MatrixNode('15', 'c6', 'command', new Geometry(100, 100, 'square'), {
        x: 100, y: 200
    }, MatrixIndex.from(0, 0), 'square'), [], 1, false)
    const command7 = new NestedGroupNode(new MatrixNode('16', 'c7', 'command', new Geometry(100, 100, 'square'), {
        x: 100, y: 200
    }, MatrixIndex.from(0, 0), 'square'), [], 1, false)
    const command8 = new NestedGroupNode(new MatrixNode('17', 'c8', 'command', new Geometry(100, 100, 'square'), {
        x: 100, y: 200
    }, MatrixIndex.from(0, 0), 'square'), [], 1, false)

    event.addSubordinate(command)
    event.addSubordinate(command2)
    event.addSubordinate(command3)
    event.addSubordinate(command4)
    event.addSubordinate(command5)
    event.addSubordinate(command6)
    event.addSubordinate(command7)
    event.addSubordinate(command8)

    // When
    event.prettyLayoutDeeply(0.1, 10)

    const groupCenter = event.getCoordinate()
    const eventCenter = event.centralNode.getCoordinate()
    const commandCenter = command.getCoordinate()
    const command2Center = command2.getCoordinate()
    const command3Center = command3.getCoordinate()
    const command4Center = command4.getCoordinate()
    const command5Center = command5.getCoordinate()
    const command6Center = command6.getCoordinate()
    const command7Center = command7.getCoordinate()
    const command8Center = command8.getCoordinate()

    // Then
    expect(event.invalidateSizing().width).toEqual(320)
    expect(event.invalidateSizing().height).toEqual(320)
    expect(groupCenter).toEqual({x: 0, y: 0});
    expect(eventCenter).toEqual({x: 0, y: 0});
    expect(commandCenter).toEqual({x: -110, y: -110});
    expect(command2Center).toEqual({x: 0, y: -110})
    expect(command3Center).toEqual({x: 110, y: -110})
    expect(command4Center).toEqual({x: 110, y: 0})
    expect(command5Center).toEqual({x: 110, y: 110})
    expect(command6Center).toEqual({x: 0, y: 110})
    expect(command7Center).toEqual({x: -110, y: 110})
    expect(command8Center).toEqual({x: -110, y: 0})
})

test('pretty layout algorithm should process 1 event and 12 command on top middle', () => {
    // Given
    const event = new NestedGroupNode(new MatrixNode('1', 'domain event', 'event', new Geometry(100, 100, 'square'), {
        x: 0, y: 0
    }, MatrixIndex.from(0, 0), 'square'), [], 0, false)
    const command = new NestedGroupNode(new MatrixNode('10', 'c1', 'command', new Geometry(100, 100, 'square'), {
        x: 100, y: 100
    }, MatrixIndex.from(0, 0), 'square'), [], 1, false)
    const command2 = new NestedGroupNode(new MatrixNode('11', 'c2', 'command', new Geometry(100, 100, 'square'), {
        x: 200, y: 100
    }, MatrixIndex.from(0, 0), 'square'), [], 1, false)
    const command3 = new NestedGroupNode(new MatrixNode('12', 'c3', 'command', new Geometry(100, 100, 'square'), {
        x: 200, y: 200
    }, MatrixIndex.from(0, 0), 'square'), [], 1, false)
    const command4 = new NestedGroupNode(new MatrixNode('13', 'c4', 'command', new Geometry(100, 100, 'square'), {
        x: 100, y: 200
    }, MatrixIndex.from(0, 0), 'square'), [], 1, false)
    const command5 = new NestedGroupNode(new MatrixNode('14', 'c5', 'command', new Geometry(100, 100, 'square'), {
        x: 100, y: 200
    }, MatrixIndex.from(0, 0), 'square'), [], 1, false)
    const command6 = new NestedGroupNode(new MatrixNode('15', 'c6', 'command', new Geometry(100, 100, 'square'), {
        x: 100, y: 200
    }, MatrixIndex.from(0, 0), 'square'), [], 1, false)
    const command7 = new NestedGroupNode(new MatrixNode('16', 'c7', 'command', new Geometry(100, 100, 'square'), {
        x: 100, y: 200
    }, MatrixIndex.from(0, 0), 'square'), [], 1, false)
    const command8 = new NestedGroupNode(new MatrixNode('17', 'c8', 'command', new Geometry(100, 100, 'square'), {
        x: 100, y: 200
    }, MatrixIndex.from(0, 0), 'square'), [], 1, false)
    const command9 = new NestedGroupNode(new MatrixNode('18', 'c9', 'command', new Geometry(100, 100, 'square'), {
        x: 100, y: 200
    }, MatrixIndex.from(0, 0), 'square'), [], 1, false)
    const command10 = new NestedGroupNode(new MatrixNode('19', 'c10', 'command', new Geometry(100, 100, 'square'), {
        x: 100, y: 200
    }, MatrixIndex.from(0, 0), 'square'), [], 1, false)
    const command11 = new NestedGroupNode(new MatrixNode('20', 'c11', 'command', new Geometry(100, 100, 'square'), {
        x: 100, y: 200
    }, MatrixIndex.from(0, 0), 'square'), [], 1, false)
    const command12 = new NestedGroupNode(new MatrixNode('21', 'c12', 'command', new Geometry(100, 100, 'square'), {
        x: 100, y: 200
    }, MatrixIndex.from(0, 0), 'square'), [], 1, false)
    event.addSubordinate(command)
    event.addSubordinate(command2)
    event.addSubordinate(command3)
    event.addSubordinate(command4)
    event.addSubordinate(command5)
    event.addSubordinate(command6)
    event.addSubordinate(command7)
    event.addSubordinate(command8)
    event.addSubordinate(command9)
    event.addSubordinate(command10)
    event.addSubordinate(command11)
    event.addSubordinate(command12)

    // When
    event.prettyLayoutDeeply(0.1, 10)

    const groupCenter = event.getCoordinate()
    const eventCenter = event.getCoordinate()
    const commandCenter = command.getCoordinate()
    const command2Center = command2.getCoordinate()
    const command3Center = command3.getCoordinate()
    const command4Center = command4.getCoordinate()
    const command5Center = command5.getCoordinate()
    const command6Center = command6.getCoordinate()
    const command7Center = command7.getCoordinate()
    const command8Center = command8.getCoordinate()
    const command9Center = command9.getCoordinate()
    const command10Center = command10.getCoordinate()
    const command11Center = command11.getCoordinate()
    const command12Center = command12.getCoordinate()

    // Then
    expect(event.invalidateSizing().width).toEqual(430)
    expect(event.invalidateSizing().height).toEqual(430)
    expect(groupCenter).toEqual({x: 0, y: 0});
    expect(eventCenter).toEqual({x: 0, y: 0});
    expect(commandCenter).toEqual({x: -165, y: -165});
    expect(command2Center).toEqual({x: -55, y: -165})
    expect(command3Center).toEqual({x: 55, y: -165})
    expect(command4Center).toEqual({x: 165, y: -165})
    expect(command5Center).toEqual({x: 165, y: -55})
    expect(command6Center).toEqual({x: 165, y: 55})
    expect(command7Center).toEqual({x: 165, y: 165})
    expect(command8Center).toEqual({x: 55, y: 165})
    expect(command9Center).toEqual({x: -55, y: 165})
    expect(command10Center).toEqual({x: -165, y: 165})
    expect(command11Center).toEqual({x: -165, y: 55})
    expect(command12Center).toEqual({x: -165, y: -55})
})
