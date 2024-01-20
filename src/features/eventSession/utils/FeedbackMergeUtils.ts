import {EventFeedback, ParticipantFeedback} from "../repository/EventSessionVoteRepository";
export interface IncrementalFeedback {
    incrementalFeedback: EventFeedback;
    participantId: string;
}

function mergeEventFeedBack(targetFeedback: ParticipantFeedback, incrementalFeedback: EventFeedback): ParticipantFeedback {
    const otherEventFeedbacks = targetFeedback.feedback.filter(feedback => feedback.eventName !== incrementalFeedback.eventName)
    const originalEventFeedback = targetFeedback.feedback.find(feedback => feedback.eventName === incrementalFeedback.eventName)
    const incrementMetrics: Set<string> = new Set(incrementalFeedback.items.map(item => item.item))
    if (originalEventFeedback) {
        const otherItems = originalEventFeedback.items.filter(item => !incrementMetrics.has(item.item))
        const mergedItems = [...otherItems, ...incrementalFeedback.items]
        const mergedEventFeedback: EventFeedback = {
            eventName: incrementalFeedback.eventName,
            items: mergedItems
        }
        return {
            ...targetFeedback,
            feedback: [...otherEventFeedbacks, mergedEventFeedback]
        }
    }
    return {
        ...targetFeedback,
        feedback: [...otherEventFeedbacks, incrementalFeedback]
    };
}

export function updateFeedbacks(incrementalFeedback: IncrementalFeedback, feedbacks: ParticipantFeedback[], setFeedbacks: (value: ParticipantFeedback[]) => void) {
    //merge specific EventFeedback items from specific participant
    const toMergeParticipantId = incrementalFeedback.participantId
    const targetFeedback = feedbacks.find(feedback => feedback.participantId === toMergeParticipantId)
    if (!targetFeedback) {
        setFeedbacks([...feedbacks, {
            participantId: toMergeParticipantId,
            participantName: '',
            feedback: [incrementalFeedback.incrementalFeedback]
        }])
    } else {
        const mergedFeedback: ParticipantFeedback = mergeEventFeedBack(targetFeedback, incrementalFeedback.incrementalFeedback)
        const newFeedbacks = [...feedbacks.filter(feedback => feedback.participantId !== toMergeParticipantId), mergedFeedback];
        setFeedbacks(newFeedbacks)
    }
}