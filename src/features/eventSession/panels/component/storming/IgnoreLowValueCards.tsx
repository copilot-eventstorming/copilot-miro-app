import {EventSessionVoteRepository, ParticipantFeedback} from "../../../repository/EventSessionVoteRepository";
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
import {MetricMetadata, MetricOption} from "../../../types/MetricMetadata";
import {
    ParticipantFeedbackAdjustmentResponseHandler
} from "../../../broadcast/handler/ParticipantFeedbackAdjustmentResponseHandler";
import {IncrementalFeedback, updateFeedbacks} from "../../../utils/FeedbackMergeUtils";
import {messageRegistry} from "../../../../../utils/MessagingBroadcastingInitializer";
import {ParticipantFeedbackAdjustmentResponse} from "../../../broadcast/message/ParticipantFeedbackAdjustmentResponse";

type IgnoreLowValueCardsProps = {
    boardSPI: WorkshopBoardSPI
    voteRepository: EventSessionVoteRepository | null
    feedbacks: ParticipantFeedback[]
    setFeedbacks: (feedbacks: ParticipantFeedback[]) => void
    cards: WorkshopCard[]
    copilotSession: CopilotSession
    onlineUsers: OnlineUserInfo[]
}

const ImpactFeedbackMetrics: MetricMetadata[] = [
    new MetricMetadata('Familiarity', [
        new MetricOption('Never heard of it', 0),
        new MetricOption('Heard of it, but don\'t know what it is', 1),
        new MetricOption('Know what it is, but never used it', 2),
        new MetricOption('Used it, and know it well', 3),
    ]),
    new MetricMetadata('Impact', [
        new MetricOption('No impact or value or irrelevant for/with workshop goal.', 0),
        new MetricOption('Low impact or value for workshop goal.', 1),
        new MetricOption('Medium impact or value for workshop goal.', 2),
        new MetricOption('High impact or value for workshop goal.', 3),
    ]),
    new MetricMetadata('Interest', [
        new MetricOption('Not interested at all', 0),
        new MetricOption('Slightly interested', 1),
        new MetricOption('Moderately interested', 2),
        new MetricOption('Very interested', 3),
    ]),

]

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
                                                                            voteRepository,
                                                                            feedbacks,
                                                                            setFeedbacks,
                                                                            cards,
                                                                            copilotSession,
                                                                            onlineUsers
                                                                        }) => {

    const [eventScores, setEventScores] = useState<EventScore[]>([])
    const previousEventScores = React.useRef<EventScore[]>(eventScores)
    useEffect(() => {
        previousEventScores.current = eventScores;
    }, [eventScores]);

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
        if (feedbacks && feedbacks.length > 0 && voteRepository){
            voteRepository.saveVotes(feedbacks)
        }
    }, [feedbacks])

    const [incrementalFeedback, setIncrementalFeedback] = React.useState<IncrementalFeedback | null>(null);

    useEffect(() => {
        if (incrementalFeedback) {
            updateFeedbacks(incrementalFeedback, feedbacks, setFeedbacks);
        }
    }, [incrementalFeedback]);

    const adjustmentResponseHandler = new ParticipantFeedbackAdjustmentResponseHandler(setIncrementalFeedback)

    useEffect(() => {
        messageRegistry.registerHandler(
            ParticipantFeedbackAdjustmentResponse.MESSAGE_TYPE,
            adjustmentResponseHandler
        )
        return () => {
            messageRegistry.unregisterHandler(
                ParticipantFeedbackAdjustmentResponse.MESSAGE_TYPE,
                adjustmentResponseHandler
            )
        }
    }, []);

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
                        <li className={`
                                ${eventScore.importanceScore !== previousEventScores.current.find(previousEventScore => previousEventScore.eventName === eventScore.eventName)?.importanceScore ? "cell-change" : ""}
                                ${eventScore.importanceScore === 0 ? "text-red-500" : eventScore.importanceScore === 1 ? "text-yellow-500" : "text-black"}
                                `
                        }>
                            {eventScore.importanceScore.toFixed(2)}
                        </li>
                        <li className={`
                                ${eventScore.interestScore !== previousEventScores.current.find(previousEventScore => previousEventScore.eventName === eventScore.eventName)?.interestScore ? "cell-change" : ""}
                                ${eventScore.interestScore === 3 ? "text-red-500" : eventScore.interestScore === 2 ? "text-yellow-500" : "text-black"}
                        `}
                        >
                            {eventScore.interestScore.toFixed(2)}
                        </li>
                        <li className={`
                                ${eventScore.familiarScore !== previousEventScores.current.find(previousEventScore => previousEventScore.eventName === eventScore.eventName)?.familiarScore ? "cell-change" : ""}
                                ${eventScore.familiarScore === 0 ? "text-red-500" : eventScore.familiarScore === 1 ? "text-yellow-500" : "text-black"}
                                `
                        }
                        >
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
                                filterParticipantFeedbacks(feedbacks, eventScore.eventName, [Impact, Interest, Familiarity]),
                                ImpactFeedbackMetrics,
                                eventScore.eventName,
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

