import {EventFeedback, ParticipantFeedback} from "../repository/EventSessionVoteRepository";
import {Familiarity, Impact, Interest} from "../types/EventFeedbackMetricNames";
import {EventScore} from "../types/EventScore";

export function convertToEventScore(feedbacks: ParticipantFeedback[]): EventScore[] {
    return feedbacks.reduce((acc: EventScore[], feedback: ParticipantFeedback) => {
        const eventScore: EventScore[] = feedback.feedback.map((eventFeedback: EventFeedback) => {
            console.log('convertToEventScore0', eventFeedback.items.find(item => item.item === Interest))
            console.log('convertToEventScore1', eventFeedback.items.find(item => item.item === Interest)?.feedback)
            console.log(numerical(eventFeedback.items.find(item => item.item === Interest)?.feedback, 0))

            return {
                eventName: eventFeedback.eventName,
                importanceScore: numerical(eventFeedback.items.find(item => item.item === Impact)?.feedback, 0),
                interestScore: numerical(eventFeedback.items.find(item => item.item === Interest)?.feedback, 0),
                familiarScore: numerical(eventFeedback.items.find(item => item.item === Familiarity)?.feedback, 0),
            }
        })

        //merge eventScore with same eventName by summing up the score
        eventScore.forEach((score: EventScore) => {
            const existingScore = acc.find((existingScore: EventScore) => existingScore.eventName === score.eventName)
            if (existingScore) {
                existingScore.importanceScore += score.importanceScore || 0
                existingScore.interestScore += score.interestScore || 0
                existingScore.familiarScore += score.familiarScore || 0
            } else {
                acc.push({
                    eventName: score.eventName,
                    importanceScore: score.importanceScore || 0,
                    interestScore: score.interestScore || 0,
                    familiarScore: score.familiarScore || 0,
                })
            }
        })
        return acc
    }, []).sort((a: EventScore, b: EventScore) => {
        const deltaImpact = a.importanceScore - b.importanceScore
        const deltaInterest = a.interestScore - b.interestScore
        const deltaFamiliarity = a.familiarScore - b.familiarScore
        if (deltaImpact !== 0) {
            return deltaImpact
        } else if (deltaInterest !== 0) {
            return -deltaInterest
        } else {
            return -deltaFamiliarity
        }
    }).map((eventScore: EventScore) => {
        return {
            eventName: eventScore.eventName,
            importanceScore: eventScore.importanceScore/feedbacks.length,
            interestScore: eventScore.interestScore/feedbacks.length,
            familiarScore: eventScore.familiarScore/feedbacks.length
        }
    })
}

export function numerical(value: string | undefined | null, defaultValue: number): number {

    return (value === undefined || value === null) ? defaultValue : value === 'true' ? 1 : value === 'false' ? 0 : parseInt(value)
}