import {ParticipantFeedback} from "../../../repository/EventSessionVoteRepository";
import {WorkshopBoardSPI, WorkshopCard} from "../../../../../application/spi/WorkshopBoardSPI";
import React, {useEffect, useState} from "react";
import {contentWithoutSpace} from "../../../../../utils/WorkshopCardUtils";
import {convertToEventScore} from "../../../utils/IgnoreLowValueCardsUtils";
import {EventScore} from "../../../types/EventScore";
import {Broadcaster} from "../../../../../application/messaging/Broadcaster";
import {miroProxy} from "../../../../../api/MiroProxy";
import {ParticipantFeedbackAdjustmentRequest} from "../../../broadcast/message/ParticipantFeedbackAdjustmentRequest";
import {v4 as uuidv4} from "uuid";
import {CopilotSession} from "../../../../../application/CopilotSession";
import {OnlineUserInfo} from "@mirohq/websdk-types";
import {Familiarity, Impact, Interest} from "../../../types/EventFeedbackMetricNames";

type IgnoreLowValueCardsProps = {
    boardSPI: WorkshopBoardSPI
    feedbacks: ParticipantFeedback[]
    cards: WorkshopCard[]
    copilotSession: CopilotSession
    onlineUsers: OnlineUserInfo[]
}


function filterParticipantFeedbacks(feedbacks: ParticipantFeedback[], eventName: string, metrics: string[]): ParticipantFeedback[] {
    return feedbacks.map(feedback => ({
        ...feedback,
        feedback: feedback.feedback
            .filter(eventFeedback => eventFeedback.eventName === eventName)
            .map(eventFeedback => ({
                ...eventFeedback,
                items: eventFeedback.items.filter(item => metrics.includes(item.item))
            }))
    }))
}

export const IgnoreLowValueCards: React.FC<IgnoreLowValueCardsProps> = ({
                                                                            boardSPI,
                                                                            feedbacks,
                                                                            cards,
                                                                            copilotSession,
                                                                            onlineUsers
                                                                        }) => {
    const [eventScores, setEventScores] = useState<EventScore[]>([])
    const eventOwnerByEventName = (eventName: string) => {
        const card = cards.find(card => contentWithoutSpace(card.content) === contentWithoutSpace(eventName))
        if (card) {
            const onlineUser = onlineUsers.find(user => user.id === card.createdBy)
            if (onlineUser) {
                return onlineUser.name
            } else {
                return "Unknown"
            }
        } else {
            return "Unknown"
        }
    }
    useEffect(() => {
        setEventScores(convertToEventScore(feedbacks, eventOwnerByEventName))
    }, [feedbacks])
    const broadcaster = new Broadcaster(miroProxy);

    return (<div className="w-full">
        <table className="w-full">
            <thead>
            <tr>
                <td className="header header-panel w-[40%]">Event Name</td>
                <td className="header header-panel w-[20%]">Owner</td>
                <td className="header header-panel w-[30%] ">Score
                    <li className=" p0 m0 font-thin list-none">- Impact</li>
                    <li className=" p0 m0 font-thin list-none">- Interest</li>
                    <li className=" p0 m0 font-thin list-none">- Familiar</li>
                </td>
                <td className="header header-panel  w-[10%]">Action</td>
            </tr>
            </thead>
            <tbody>
            {eventScores.map((eventScore, index) => {
                return (<tr key={index} className={`${index % 2 === 0 ? "even_row" : "odd_row"} w-full `}>
                    <td className="text-cell text-cell-panel clickable-label" onClick={
                        () => {
                            const card = cards.find(card => contentWithoutSpace(card.content) === contentWithoutSpace(eventScore.eventName))
                            if (card) {
                                boardSPI.zoomToCard(card.id)
                            }
                        }
                    }>{eventScore.eventName}</td>
                    <td className="text-cell number-cell-panel">{eventScore.eventOwner}</td>
                    <td className="text-cell number-cell-panel">
                        <li className={eventScore.importanceScore === 0 ? "text-red-500" : eventScore.importanceScore === 1 ? "text-yellow-500" : "text-black"}>
                            {eventScore.importanceScore.toFixed(2)}
                        </li>
                        <li className={eventScore.interestScore === 3 ? "text-red-500" : eventScore.interestScore === 2 ? "text-yellow-500" : "text-black"}>
                            {eventScore.interestScore.toFixed(2)}
                        </li>
                        <li className={eventScore.familiarScore === 0 ? "text-red-500" : eventScore.familiarScore === 1 ? "text-yellow-500" : "text-black"}>
                            {eventScore.familiarScore.toFixed(2)}
                        </li>
                    </td>
                    <td>
                        <button className="btn btn-secondary btn-secondary-panel mx-2" onClick={() => {
                            broadcaster.broadcast(new ParticipantFeedbackAdjustmentRequest(
                                uuidv4(),
                                null,
                                copilotSession.miroUserId,
                                copilotSession.miroUserId,
                                copilotSession.miroUsername,
                                filterParticipantFeedbacks(feedbacks, eventScore.eventName, [Impact, Interest, Familiarity])
                            ))
                        }}>Call
                        </button>
                    </td>
                </tr>)
            })}
            </tbody>
        </table>
    </div>)
}

