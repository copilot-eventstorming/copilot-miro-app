import {ParticipantFeedback} from "../features/eventSession/repository/EventSessionVoteRepository";
import {RadarData} from "../component/RadarChart";

export function prepareDataByProperty(feedbacksData: ParticipantFeedback[], propertyName: string): RadarData[][] {
    const groupedByEvent = feedbacksData.flatMap(participantFeedback =>
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

export function prepareDataByParticipant(testData: ParticipantFeedback[], propertyName: string): RadarData[][] {
    const groupedByParticipant = testData.reduce((acc, curr) => {
        acc[curr.participantId] = [...(acc[curr.participantId] || []), ...curr.feedback.map(feedback =>
            feedback.items.find(item => item.item === propertyName)?.feedback)];
        return acc;
    }, {} as Record<string, (string | undefined)[]>);

    const minProperty: RadarData[] = Object.entries(groupedByParticipant)
        .map(([participantId, properties]) => ({
            axis: participantId,
            value: Math.min(...properties.map(property => property === 'true' ? 1 : property === 'false' ? 0 : parseFloat(property || '0')))
        }));

    const avgProperty: RadarData[] = Object.entries(groupedByParticipant)
        .map(([participantId, properties]) => ({
            axis: participantId,
            value: properties.reduce((acc, curr) => acc + (curr === 'true' ? 1 : curr === 'false' ? 0 : parseFloat(curr || '0')), 0) / properties.length
        }));

    const maxProperty: RadarData[] = Object.entries(groupedByParticipant)
        .map(([participantId, properties]) => ({
            axis: participantId,
            value: Math.max(...properties.map(property => property === 'true' ? 1 : property === 'false' ? 0 : parseFloat(property || '0')))
        }));

    return [minProperty, avgProperty, maxProperty]
}