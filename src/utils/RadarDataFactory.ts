import {ParticipantFeedback} from "../features/eventSession/repository/EventSessionVoteRepository";
import {RadarData} from "../component/RadarChart";

export function prepareDataByProperty(testData: ParticipantFeedback[], propertyName: string): RadarData[][] {
    const groupedByEvent = testData.flatMap(participantFeedback =>
        participantFeedback
            .feedback
            .map(eventFeedback => ({
                eventName: eventFeedback.eventName,
                property: eventFeedback
                    .items
                    .find(itemFeedback => itemFeedback.item === propertyName)?.feedback
            }))
    ).reduce((acc, curr) => {
        acc[curr.eventName] = [...(acc[curr.eventName] || []), curr.property === 'true'
            ? 1 : curr.property === 'false'
                ? 0 : parseFloat(curr.property || '0')];
        return acc;
    }, {} as Record<string, number[]>);

    console.log(groupedByEvent)

    const minProperty: RadarData[] = Object.entries(groupedByEvent)
        .map(([eventName, properties]) => ({
            axis: eventName,
            value: Math.min(...properties)
        }));

    const avgProperty: RadarData[] = Object.entries(groupedByEvent)
        .map(([eventName, properties]) => ({
            axis: eventName,
            value: properties.reduce((acc, curr) => acc + curr, 0) / properties.length
        }));

    const maxProperty: RadarData[] = Object.entries(groupedByEvent)
        .map(([eventName, properties]) => ({
            axis: eventName,
            value: Math.max(...properties)
        }));

    return [minProperty, avgProperty, maxProperty]
}