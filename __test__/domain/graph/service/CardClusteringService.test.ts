import {NestedGroupNode} from "../../../../src/domain/graph/entity/NestedGroupNode";
import {MatrixNode} from "../../../../src/domain/graph/entity/MatrixNode";
import {Geometry} from "../../../../src/domain/graph/entity/Geometry";
import {Coordinate} from "../../../../src/domain/graph/entity/Coordinate";
import {MatrixIndex} from "../../../../src/domain/graph/entity/MatrixIndex";
import {groupCards} from "../../../../src/domain/graph";


test('嵌入式分组, grouped = [], cardGroupList = []，返回 []', () => {
    // Given
    const grouped: NestedGroupNode[] = [];
    const cardGroupList: NestedGroupNode[][] = [];

    // When
    const result = groupCards(grouped, cardGroupList);

    // Then
    expect(result).toEqual([]);
})
test('嵌入式分组, grouped = [], cardGroupList = [[{domainEvent}]]，返回 [ {domainEvent} ]', () => {
    // Given
    const grouped: NestedGroupNode[] = [];
    let singleDomainEventGroup = new NestedGroupNode(new MatrixNode('1', 'domain event', 'domain event',
            Geometry.fromSize(100, 100), Coordinate.from(0, 0), MatrixIndex.from(0, 0)),
        [], 1);
    const cardGroupList = [[singleDomainEventGroup]];

    // When
    const result = groupCards(grouped, cardGroupList);

    // Then
    expect(result).toEqual([singleDomainEventGroup]);
})
test('嵌入式分组, grouped = [{domainEvent}], cardGroupList = [[{command}]]，返回 [ {domainEvent[{command}]} ]', () => {

    // Given
    let singleDomainEventGroup = new NestedGroupNode(
        new MatrixNode('1', 'domain event', 'domain event',
            Geometry.fromSize(100, 100),
            Coordinate.from(0, 0),
            MatrixIndex.from(0, 0)),
        [], 1);
    const grouped = [singleDomainEventGroup];

    let singleCommandGroup = new NestedGroupNode(
        new MatrixNode('2', 'command', 'command',
            Geometry.fromSize(100, 100),
            Coordinate.from(60, 60),
            MatrixIndex.from(0, 0)), [], 2);

    const cardGroupList = [[singleCommandGroup]];

    // When
    const result = groupCards(grouped, cardGroupList, false);

    // Then
    expect(result).toEqual([
        new NestedGroupNode(new MatrixNode('1', 'domain event', 'domain event',
            Geometry.fromSize(100, 100),
            Coordinate.from(0, 0),
            MatrixIndex.from(0, 0)), [
            new NestedGroupNode(new MatrixNode('2', 'command', 'command',
                Geometry.fromSize(100, 100),
                Coordinate.from(60, 60),
                MatrixIndex.from(0, 0)), [], 2)
        ], 1)
    ]);
})

test('嵌入式分组, grouped = [{event1}, {event2}], cardGroupList = [[{command1}, {command2}]]，返回 [ {event1[{command1}]}, {event2[{command2}]} ]', () => {
    // Given
    let event1Group = new NestedGroupNode(
        new MatrixNode('1', 'event1', 'domain event',
            Geometry.fromSize(100, 100),
            Coordinate.from(0, 0),
            MatrixIndex.from(0, 0)),
        [], 1);
    let event2Group = new NestedGroupNode(
        new MatrixNode('2', 'event2', 'domain event',
            Geometry.fromSize(100, 100),
            Coordinate.from(200, 0),
            MatrixIndex.from(0, 0)),
        [], 1);

    const grouped = [event1Group, event2Group];

    let command1Group = new NestedGroupNode(
        new MatrixNode('10', 'command1', 'command',
            Geometry.fromSize(100, 100),
            Coordinate.from(-60, 60),
            MatrixIndex.from(0, 0)), [], 2);

    let command2Group = new NestedGroupNode(
        new MatrixNode('20', 'command2', 'command',
            Geometry.fromSize(100, 100),
            Coordinate.from(160, 60),
            MatrixIndex.from(0, 0)), [], 2);

    const cardGroupList = [[command1Group, command2Group]];

    // When
    const result = groupCards(grouped, cardGroupList, false);

    // Then
    expect(result).toEqual([
        new NestedGroupNode(new MatrixNode('1', 'event1', 'domain event',
            Geometry.fromSize(100, 100),
            Coordinate.from(0, 0),
            MatrixIndex.from(0, 0)), [
            new NestedGroupNode(new MatrixNode('10', 'command1', 'command',
                Geometry.fromSize(100, 100),
                Coordinate.from(-60, 60),
                MatrixIndex.from(0, 0)), [], 2)
        ], 1),

        new NestedGroupNode(new MatrixNode('2', 'event2', 'domain event',
            Geometry.fromSize(100, 100),
            Coordinate.from(200, 0),
            MatrixIndex.from(0, 0)), [
            new NestedGroupNode(new MatrixNode('20', 'command2', 'command',
                Geometry.fromSize(100, 100),
                Coordinate.from(160, 60),
                MatrixIndex.from(0, 0)), [], 2)
        ], 1),
    ]);
})
test('嵌入式分组, grouped = [{domainEvent}], cardGroupList = [[{command}], [{role}]]，返回 [ {domainEvent[{command[{role}]}]} ]', () => {
    // Given
    let eventGroup = new NestedGroupNode(
        new MatrixNode('1', 'event1', 'domain event',
            Geometry.fromSize(100, 100),
            Coordinate.from(0, 0),
            MatrixIndex.from(0, 0)),
        [], 1);
    const grouped = [eventGroup];

    let commandGroup = new NestedGroupNode(
        new MatrixNode('10', 'command1', 'command',
            Geometry.fromSize(100, 100),
            Coordinate.from(-50, 50),
            MatrixIndex.from(0, 0)), [], 2);

    let roleGroup = new NestedGroupNode(
        new MatrixNode('100', 'role1', 'role',
            Geometry.fromSize(100, 100),
            Coordinate.from(-100, 100),
            MatrixIndex.from(0, 0)), [], 3);

    const cardGroupList = [[commandGroup], [roleGroup]];

    // When
    const result = groupCards(grouped, cardGroupList, false);

    // Then
    const expected = new NestedGroupNode(new MatrixNode('1', 'event1', 'domain event',
        Geometry.fromSize(100, 100),
        Coordinate.from(0, 0),
        MatrixIndex.from(0, 0)), [
        new NestedGroupNode(new MatrixNode('10', 'command1', 'command',
            Geometry.fromSize(100, 100),
            Coordinate.from(-50, 50),
            MatrixIndex.from(0, 0)), [
            new NestedGroupNode(new MatrixNode('100', 'role1', 'role',
                Geometry.fromSize(100, 100),
                Coordinate.from(-100, 100),
                MatrixIndex.from(0, 0)), [], 3)
        ], 2)
    ], 1);

    expect(result).toEqual([expected]);
})

test('嵌入式分组, grouped = [{event1}, {event2}], cardGroupList = [[{command11}, {command12}, {command21},{command22}], [{role111},{role112}, {role121}, {role122}, {role211}, {role221}]]，' +
    '返回 [ {event1[{command11[{role111},{role112}]}, {command12[{role121}{role122}]}]}, {event2[{command21[{role211}]}, command22[{role221}]]} ]', () => {

    // Given
    let event1 = new NestedGroupNode(
        new MatrixNode('1', 'event1', 'domain event',
            Geometry.fromSize(100, 100),
            Coordinate.from(0, 0),
            MatrixIndex.from(0, 0)),
        [], 1);
    let event2 = new NestedGroupNode(
        new MatrixNode('2', 'event2', 'domain event',
            Geometry.fromSize(100, 100),
            Coordinate.from(300, 0),
            MatrixIndex.from(0, 0)),
        [], 1);
    const grouped = [event1, event2];

    let command11 = new NestedGroupNode(
        new MatrixNode('11', 'command11', 'command',
            Geometry.fromSize(100, 100),
            Coordinate.from(-80, 80),
            MatrixIndex.from(0, 0)), [], 2);
    let command12 = new NestedGroupNode(
        new MatrixNode('12', 'command12', 'command',
            Geometry.fromSize(100, 100),
            Coordinate.from(80, 80),
            MatrixIndex.from(0, 0)), [], 2);
    let command21 = new NestedGroupNode(
        new MatrixNode('21', 'command21', 'command',
            Geometry.fromSize(100, 100),
            Coordinate.from(280, 80),
            MatrixIndex.from(0, 0)), [], 2);
    let command22 = new NestedGroupNode(
        new MatrixNode('22', 'command22', 'command',
            Geometry.fromSize(100, 100),
            Coordinate.from(380, -80),
            MatrixIndex.from(0, 0)), [], 2);

    let role111 = new NestedGroupNode(
        new MatrixNode('111', 'role111', 'role',
            Geometry.fromSize(100, 100),
            Coordinate.from(-120, 0),
            MatrixIndex.from(0, 0)), [], 3);
    let role112 = new NestedGroupNode(
        new MatrixNode('112', 'role112', 'role',
            Geometry.fromSize(100, 100),
            Coordinate.from(-120, 160),
            MatrixIndex.from(0, 0)), [], 3);
    let role121 = new NestedGroupNode(
        new MatrixNode('121', 'role121', 'role',
            Geometry.fromSize(100, 100),
            Coordinate.from(40, 160),
            MatrixIndex.from(0, 0)), [], 3);
    let role122 = new NestedGroupNode(
        new MatrixNode('122', 'role122', 'role',
            Geometry.fromSize(100, 100),
            Coordinate.from(160, 0),
            MatrixIndex.from(0, 0)), [], 3);
    let role211 = new NestedGroupNode(
        new MatrixNode('211', 'role211', 'role',
            Geometry.fromSize(100, 100),
            Coordinate.from(200, 160),
            MatrixIndex.from(0, 0)), [], 3);
    let role221 = new NestedGroupNode(
        new MatrixNode('221', 'role221', 'role',
            Geometry.fromSize(100, 100),
            Coordinate.from(460, -160),
            MatrixIndex.from(0, 0)), [], 3);

    const cardGroupList = [[command11, command12, command21, command22], [role111, role112, role121, role122, role211, role221]];

    // When
    const result = groupCards(grouped, cardGroupList, false);

    // Then
    let expected =
        [new NestedGroupNode(new MatrixNode('1', 'event1', 'domain event',
            Geometry.fromSize(100, 100),
            Coordinate.from(0, 0),
            MatrixIndex.from(0, 0)), [
            new NestedGroupNode(new MatrixNode('11', 'command11', 'command',
                Geometry.fromSize(100, 100),
                Coordinate.from(-80, 80),
                MatrixIndex.from(0, 0)), [
                new NestedGroupNode(new MatrixNode('111', 'role111', 'role',
                    Geometry.fromSize(100, 100),
                    Coordinate.from(-120, 0),
                    MatrixIndex.from(0, 0)), [], 3),
                new NestedGroupNode(new MatrixNode('112', 'role112', 'role',
                    Geometry.fromSize(100, 100),
                    Coordinate.from(-120, 160),
                    MatrixIndex.from(0, 0)), [], 3)
            ], 2),
            new NestedGroupNode(new MatrixNode('12', 'command12', 'command',
                Geometry.fromSize(100, 100),
                Coordinate.from(80, 80),
                MatrixIndex.from(0, 0)), [
                new NestedGroupNode(new MatrixNode('121', 'role121', 'role',
                    Geometry.fromSize(100, 100),
                    Coordinate.from(40, 160),
                    MatrixIndex.from(0, 0)), [], 3),
                new NestedGroupNode(new MatrixNode('122', 'role122', 'role',
                    Geometry.fromSize(100, 100),
                    Coordinate.from(160, 0),
                    MatrixIndex.from(0, 0)), [], 3)
            ], 2)
        ], 1),
            new NestedGroupNode(new MatrixNode('2', 'event2', 'domain event',
                Geometry.fromSize(100, 100),
                Coordinate.from(300, 0),
                MatrixIndex.from(0, 0)), [
                new NestedGroupNode(new MatrixNode('21', 'command21', 'command',
                    Geometry.fromSize(100, 100),
                    Coordinate.from(280, 80),
                    MatrixIndex.from(0, 0)), [
                    new NestedGroupNode(new MatrixNode('211', 'role211', 'role',
                        Geometry.fromSize(100, 100),
                        Coordinate.from(200, 160),
                        MatrixIndex.from(0, 0)), [], 3)
                ], 2),
                new NestedGroupNode(new MatrixNode('22', 'command22', 'command',
                    Geometry.fromSize(100, 100),
                    Coordinate.from(380, -80),
                    MatrixIndex.from(0, 0)), [
                    new NestedGroupNode(new MatrixNode('221', 'role221', 'role',
                        Geometry.fromSize(100, 100),
                        Coordinate.from(460, -160),
                        MatrixIndex.from(0, 0)), [], 3)
                ], 2)
            ], 1)];

    expect(result).toEqual(expected);
})
