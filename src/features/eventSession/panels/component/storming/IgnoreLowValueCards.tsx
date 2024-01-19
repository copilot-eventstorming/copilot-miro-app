import {EventFeedback, ParticipantFeedback} from "../../../repository/EventSessionVoteRepository";
import {WorkshopBoardSPI} from "../../../../../application/spi/WorkshopBoardSPI";
import React, {useState} from "react";

type IgnoreLowValueCardsProps = {
    boardSPI: WorkshopBoardSPI
    feedbacks: ParticipantFeedback[]
}

type EventScore = {
    eventName: string,
    importanceScore: number,
    interestScore: number,
    familiarScore: number
}
const IgnoreLowValueCards: React.FC<IgnoreLowValueCardsProps> = ({boardSPI, feedbacks}) => {
    const [eventScores, setEventScores] = useState<EventScore[]>([])

    return (<div className="w-full">
        <table className="w-full">
            <thead>
            <tr>
                <td>Event Name</td>
                <td>Importance Score</td>
                <td>Interest Score</td>
                <td>Familiar Score</td>
                <td>Action</td>
            </tr>
            </thead>
            <tbody>
            {eventScores.map((eventScore, index) => {
                return (<tr key={index}>
                    <td>{eventScore.eventName}</td>
                    <td>{eventScore.importanceScore}</td>
                    <td>{eventScore.interestScore}</td>
                    <td>{eventScore.familiarScore}</td>
                    <td>
                        <button>Keep</button>
                        <button>Ignore</button>
                    </td>
                </tr>)
            })}
            </tbody>
        </table>
    </div>)
}

function convertToEventScore(feedbacks: ParticipantFeedback[]): EventScore[] {
    return feedbacks.reduce((acc: EventScore[], feedback: ParticipantFeedback) => {
        const eventFeedbacks: EventFeedback[] = feedback.feedback
        const eventScore: EventScore[] = eventFeedbacks.map((eventFeedback: EventFeedback) => {
            return {
                eventName: eventFeedback.eventName,
                importanceScore: numerical(eventFeedback.items.find(item => item.item === "importance")?.feedback, 0),
                interestScore: numerical(eventFeedback.items.find(item => item.item === "interest")?.feedback, 0),
                familiarScore: numerical(eventFeedback.items.find(item => item.item === "familiar")?.feedback, 0),
            }
        })
        return acc
    }, [])
}

function numerical(value: string | undefined | null, defaultValue: number): number {
    return (value === undefined || value === null) ? defaultValue : value === 'true' ? 1 : value === 'false' ? 0 : parseInt(value)
}