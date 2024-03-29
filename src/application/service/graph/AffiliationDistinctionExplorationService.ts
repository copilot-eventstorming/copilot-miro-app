import {calculateDistancesStatistics, CardDistanceStatistics, NestedGroupNode} from "../../../domain/graph";
import {cleanHtmlTag} from "../utils/utils";
import {TClusterAnalysisResult} from "../../../features/eventSession/types/ExploreAnalysisResultTableTypes";

export class AffiliationDistinctionExplorationService {

    perform(satelliteCards: NestedGroupNode[], centralCards: NestedGroupNode[]): TClusterAnalysisResult[] {
        if (satelliteCards.length <= 0 || centralCards.length <= 0) {
            return this.emptyResult();
        }
        const stats: CardDistanceStatistics = calculateDistancesStatistics(satelliteCards, centralCards);
        return this.mkClusterAnalysisResults(stats);
    }

    private emptyResult(): TClusterAnalysisResult[] {
        return [
            {
                percentileName: 'min',
                distance: 'N/A',
                itemName: 'N/A',
                itemId: 'N/A'
            },
            {
                percentileName: '25',
                distance: 'N/A',
                itemName: 'N/A',
                itemId: 'N/A'
            },
            {
                percentileName: '50',
                distance: 'N/A',
                itemName: 'N/A',
                itemId: 'N/A'
            },
            {
                percentileName: '75',
                distance: 'N/A',
                itemName: 'N/A',
                itemId: 'N/A'
            },
            {
                percentileName: 'max',
                distance: 'N/A',
                itemName: 'N/A',
                itemId: 'N/A'
            }];
    }

    private mkClusterAnalysisResults(stats: CardDistanceStatistics) {
        return [
            {
                percentileName: 'min',
                distance: stats.minDistance.delta.toFixed(3),
                itemName: cleanHtmlTag(stats.minDistance.commandName),
                itemId: stats.minDistance.satelliteCardId
            },
            {
                percentileName: '25',
                distance: stats.quartile25Distance.delta.toFixed(3),
                itemName: cleanHtmlTag(stats.quartile25Distance.commandName),
                itemId: stats.quartile25Distance.satelliteCardId
            },
            {
                percentileName: '50',
                distance: stats.medianDistance.delta.toFixed(3),
                itemName: cleanHtmlTag(stats.minDistance.commandName),
                itemId: stats.medianDistance.satelliteCardId
            },
            {
                percentileName: '75',
                distance: stats.quartile75Distance.delta.toFixed(3),
                itemName: cleanHtmlTag(stats.quartile75Distance.commandName),
                itemId: stats.quartile75Distance.satelliteCardId
            },
            {
                percentileName: 'max',
                distance: stats.maxDistance.delta.toFixed(3),
                itemName: cleanHtmlTag(stats.maxDistance.commandName),
                itemId: stats.maxDistance.satelliteCardId
            }
        ];
    }
}