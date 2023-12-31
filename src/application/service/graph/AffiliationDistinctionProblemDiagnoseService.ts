import {MatrixNode} from "../../../domain/graph/entity/MatrixNode";
import {calculateFuzzyCards, calculateNearestDomainCards} from "../../../domain/graph";
import {calculateAverage, cleanHtmlTag} from "../utils/utils";

export class ProblematicCard {
    category: string;
    satelliteCardId: string;
    satelliteCardName: string;
    candidateCentralOne: {
        id: string;
        name: string;
    };
    candidateCentralOther: {
        id: string;
        name: string;
    } | null;
    diff: string;

    constructor(category: string, satelliteCardId: string, satelliteCardName: string, candidateCentralOne: {
        id: string,
        name: string
    }, candidateCentralOther: { id: string, name: string } | null, diff: string) {
        this.category = category;
        this.satelliteCardId = satelliteCardId;
        this.satelliteCardName = satelliteCardName;
        this.candidateCentralOne = candidateCentralOne;
        this.candidateCentralOther = candidateCentralOther;
        this.diff = diff;
    }
}

export class AffiliationDistinctionProblemDiagnoseService {
    constructor() {
    }

    perform(ambiguousDistanceThreshold: number, satelliteCards: MatrixNode[], centralCards: MatrixNode[]): [ProblematicCard[], ProblematicCard[]] {
        if (satelliteCards.length <= 0 || centralCards.length <= 0) {
            return [[], []];
        }
        const cardsOwnership = calculateNearestDomainCards(satelliteCards, centralCards);
        const avgMiniDistance = calculateAverage(cardsOwnership.map(x => x.distance));
        const ownershipAmbiguousCards = calculateFuzzyCards(satelliteCards, centralCards, ambiguousDistanceThreshold);
        const abnormalFarCards = cardsOwnership.filter(x => x.distance > avgMiniDistance * 1.5);
        const idNameMap = new Map<string, string>();
        satelliteCards.concat(centralCards).forEach(x => idNameMap.set(x.id, cleanHtmlTag(x.name)));
        const xs = ownershipAmbiguousCards.map(x => {
            return {
                category: "Ambiguous",
                satelliteCardId: x[0].satelliteCardId,
                satelliteCardName: cleanHtmlTag(x[0].commandName),
                candidateCentralOne: {
                    id: x[0].centralCardId,
                    name: cleanHtmlTag(x[0].domainName)
                },
                candidateCentralOther: {
                    id: x[1].centralCardId,
                    name: cleanHtmlTag(x[1].domainName)
                },
                diff: Math.abs(x[0].distance - x[1].distance).toFixed(3)
            } as ProblematicCard;
        });
        const ys = abnormalFarCards.map(x => {
            return {
                category: "Too Far",
                satelliteCardId: x.satelliteCardId,
                satelliteCardName: cleanHtmlTag(x.commandName),
                candidateCentralOne: {
                    id: x.centralCardId,
                    name: cleanHtmlTag(x.domainName)
                },
                candidateCentralOther: null,
                diff: x.distance.toFixed(3)
            } as ProblematicCard;
        });
        return [xs, ys]
    }
}