import _ from 'lodash';
import {calculateDistance, MatrixNode} from "../entity/MatrixNode";

type CardDistance = {
    satelliteCardId: string;
    centralCardId: string;
    distance: number;
    commandName: string;
    domainName: string;
};

export function calculateNearestDomainCards(satelliteCards: MatrixNode[], centralCards: MatrixNode[], factor: number = 1): CardDistance[] {
    return satelliteCards.map(satelliteCard => {
        const nearestCentralCard = centralCards.reduce((nearestCard, domainCard) => {
            const distance = calculateDistance(satelliteCard, domainCard, factor);
            return distance < calculateDistance(satelliteCard, nearestCard, factor) ? domainCard : nearestCard;
        });

        return {
            satelliteCardId: satelliteCard.id,
            centralCardId: nearestCentralCard.id,
            distance: calculateDistance(satelliteCard, nearestCentralCard, factor),
            commandName: satelliteCard.name,
            domainName: nearestCentralCard.name
        };
    });
}

export function calculateFuzzyCards(satelliteCards: MatrixNode[], centralCards: MatrixNode[], deltaDistanceThreshold: number, factor: number = 1): CardDistance[][] {
    if (centralCards.length <= 1) return [];
    const distances: CardDistance[] = measureTop2NearestDistancesPerSatelliteCard(satelliteCards, centralCards, factor);
    const filteredDistances: CardDistance[] = groupByKey(distances, 'satelliteCardId', (commandCardTop2Distances: CardDistance[], satelliteCardId: string) => {
        const top2Distances: number[] = commandCardTop2Distances.map(item => item.distance);
        const minDistance: number = Math.min(...top2Distances);
        const maxDistance: number = Math.max(...top2Distances);
        if (maxDistance - minDistance <= deltaDistanceThreshold) {
            return commandCardTop2Distances;
        }
        return [];
    });
    const filteredGroup: Record<string, CardDistance[]> = _.groupBy(filteredDistances, 'satelliteCardId');
    const filteredValues: CardDistance[][] = Object.values(filteredGroup);
    return filteredValues.sort((a, b) => Math.abs(a[0].distance - a[1].distance) - Math.abs(b[0].distance - b[1].distance));
}

export type CardDistanceStatistics = {
    minDistance: CardDistanceDelta,
    quartile25Distance: CardDistanceDelta,
    medianDistance: CardDistanceDelta,
    quartile75Distance: CardDistanceDelta,
    maxDistance: CardDistanceDelta
}

export function calculateDistancesStatistics(satelliteCards: MatrixNode[], centralCards: MatrixNode[], factor: number = 1): CardDistanceStatistics {
    const distances: CardDistance[] = measureTop2NearestDistancesPerSatelliteCard(satelliteCards, centralCards, factor);
    const distanceDelta: CardDistanceDelta[] = differentiateByTop2DistanceDelta(distances);
    const sortedDistances: CardDistanceDelta[] = distanceDelta.sort((a, b) => a.delta - b.delta);
    const minDistance: CardDistanceDelta = sortedDistances[0];
    const maxDistance: CardDistanceDelta = sortedDistances[sortedDistances.length - 1];
    const medianDistance: CardDistanceDelta = calculateMedian(sortedDistances);
    const quartile25Distance: CardDistanceDelta = calculateQuartile25(sortedDistances);
    const quartile75Distance: CardDistanceDelta = calculateQuartile75(sortedDistances);
    return {
        minDistance: minDistance,
        quartile25Distance: quartile25Distance,
        medianDistance: medianDistance,
        quartile75Distance: quartile75Distance,
        maxDistance: maxDistance
    };
}

function measureTop2NearestDistancesPerSatelliteCard(satelliteCards: MatrixNode[], centralCards: MatrixNode[], factor: number): CardDistance[] {
    const distances: CardDistance[] = [];
    for (const satelliteCard of satelliteCards) {
        const nearestCentralCards: MatrixNode[] = top2NearestCentralCards(centralCards, satelliteCard, factor);
        for (const nearestCentralCard of nearestCentralCards) {
            const distance: number = calculateDistance(satelliteCard, nearestCentralCard, factor);
            distances.push(mkCardDistance(satelliteCard, nearestCentralCard, distance));
        }
    }
    return distances;
}

function groupByKey<T>(xs: CardDistance[], key: string, ListGen: (valueList: CardDistance[], k: string) => T[]): T[] {
    const grouped = _.groupBy(xs, key);
    return Object.entries(grouped).flatMap(([k, valueList]) => {
        return ListGen(valueList, k);
    });
}

function top2NearestCentralCards(centralCards: MatrixNode[], satelliteCard: MatrixNode, factor: number): MatrixNode[] {
    return centralCards
        .sort((centerA, centerB) => {
            const distanceA = calculateDistance(satelliteCard, centerA, factor);
            const distanceB = calculateDistance(satelliteCard, centerB, factor);
            return distanceA - distanceB;
        })
        .slice(0, 2);
}

type CardDistanceDelta = {
    delta: number;
    satelliteCardId: string;
    commandName: string;
    domainName: string;
};

function differentiateByTop2DistanceDelta(distances: CardDistance[]): CardDistanceDelta[] {
    return groupByKey(distances, 'satelliteCardId', (valueList: CardDistance[], satelliteCardId: string) => {
        const top2Distances = valueList.map(item => item.distance);
        const minDistance = Math.min(...top2Distances);
        const maxDistance = Math.max(...top2Distances);
        return [{
            delta: maxDistance - minDistance,
            satelliteCardId: satelliteCardId,
            commandName: valueList[0].commandName,
            domainName: valueList[0].domainName
        }];
    });
}

function mkCardDistance(satelliteCard: MatrixNode, centralCard: MatrixNode, distance: number): CardDistance {
    return {
        satelliteCardId: satelliteCard.id,
        centralCardId: centralCard.id,
        distance: distance,
        commandName: satelliteCard.name,
        domainName: centralCard.name
    };
}

function calculateMedian(numbers: CardDistanceDelta[]): CardDistanceDelta {
    const middleIndex = Math.floor(numbers.length / 2);
    return numbers[middleIndex];
}

function calculateQuartile25(numbers: CardDistanceDelta[]): CardDistanceDelta {
    const index = Math.floor(numbers.length / 4);
    return numbers[index];
}

function calculateQuartile75(numbers: CardDistanceDelta[]): CardDistanceDelta {
    const index = Math.floor(numbers.length * 3 / 4);
    return numbers[index];
}
