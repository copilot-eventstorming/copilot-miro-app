import {OnlineUserInfo} from "@mirohq/websdk-types";
import {WorkshopBoardSPI, WorkshopCard} from "../../../../../application/spi/WorkshopBoardSPI";
import {Broadcaster} from "../../../../../application/messaging/Broadcaster";
import {CopilotSession} from "../../../../../application/CopilotSession";
import {
    EventFeedback,
    EventSessionVoteRepository,
    ItemFeedback,
    ParticipantFeedback
} from "../../../repository/EventSessionVoteRepository";
import {
    EntropyCalculationRequest,
    EntropyCalculationResult,
    EntropyCalculationService,
    KnowledgeReaction,
    Participant,
    ParticipantKnowledgeReaction,
    Reaction
} from "../../../../../domain/information/alignment/service/EntropyCalculationService";
import React, {useEffect, useState} from "react";
import {VoteItem} from "../../../types/VoteItem";
import {EventSessionVoteResultHandler} from "../../../broadcast/handler/EventSessionVoteResultHandler";
import {messageRegistry} from "../../../../../utils/MessagingBroadcastingInitializer";
import {EventSessionVoteResult} from "../../../broadcast/message/EventSessionVoteResult";
import {cleanHtmlTag} from "../../../../../application/service/utils/utils";
import {StartEventSessionVote} from "../../../broadcast/message/StartEventSessionVote";
import {v4 as uuidv4} from "uuid";
import {miroProxy} from "../../../../../api/MiroProxy";

type EventVoteProp = {
    onlineUsers: OnlineUserInfo[]
    cards: WorkshopCard[]
    boardSPI: WorkshopBoardSPI
    broadcaster: Broadcaster
    copilotSession: CopilotSession
}

function mapReactions(items: ItemFeedback[]): Reaction[] {
    return items.map(item => new Reaction(item.item, item.feedback));
}

function mapKnowledgeReactions(feedbacks: EventFeedback[]): KnowledgeReaction[] {
    return feedbacks.map(feedback => {
        return new KnowledgeReaction(feedback.eventName, mapReactions(feedback.items))
    });
}

function mapParticipantFeedbacks(participantFeedbacks: ParticipantFeedback[]): ParticipantKnowledgeReaction[] {
    return participantFeedbacks.map(feedback =>
        new ParticipantKnowledgeReaction(
            new Participant(feedback.participantId, feedback.participantName),
            mapKnowledgeReactions(feedback.feedback)
        ));
}

export const CollectingEventFeedbacks: React.FC<EventVoteProp> = ({onlineUsers, cards, boardSPI, broadcaster, copilotSession}) => {
    const [voteItems, setVoteItems] = useState([] as VoteItem[])
    const [participantFeedbacks, setParticipantFeedbacks] = useState([] as ParticipantFeedback[])
    const voteRepository = copilotSession ? new EventSessionVoteRepository(copilotSession.miroBoardId) : null
    const [entropyCalculationResult, setEntropyCalculationResult] = useState<EntropyCalculationResult | null>(null)
    const callback = (feedbacks: ParticipantFeedback[]) => {
        setParticipantFeedbacks(feedbacks)
    }
    const voteResultHandler = voteRepository ? new EventSessionVoteResultHandler(voteRepository, callback) : null

    useEffect(() => {
        if (!voteResultHandler) return

        messageRegistry.registerHandler(EventSessionVoteResult.MESSAGE_TYPE,
            voteResultHandler)

        return () => {
            messageRegistry.unregisterHandler(EventSessionVoteResult.MESSAGE_TYPE,
                voteResultHandler)
        }
    }, []);

    console.log(copilotSession?.miroUserId)

    const entropyCalculationService = new EntropyCalculationService()

    return (
        <div className="w-full">
            <div className="w-full centered my-2 flex flex-row justify-center space-x-4 px-1.5">
                <button className="btn btn-primary btn-primary-panel px-2 mx-2"
                        onClick={async () => {
                            boardSPI.fetchEventCards()
                                .then(cards => cards.map(card => new VoteItem(cleanHtmlTag(card.content))))
                                .then(voteItems => {
                                    broadcaster.broadcast(
                                        new StartEventSessionVote(
                                            uuidv4(), null,
                                            copilotSession?.miroUserId,
                                            copilotSession?.miroUsername ?? "",
                                            copilotSession?.miroUserId ?? null,
                                            voteItems
                                        ))
                                })
                            console.log(miroProxy.getApiCallsInLastMinute())
                        }}
                >Start Voting
                </button>

                <button className="btn btn-primary btn-primary-panel px-2 mx-2"
                        disabled={participantFeedbacks.length <= 0}
                        onClick={() => {
                            const result = entropyCalculationService.calculateEntropy(
                                new EntropyCalculationRequest(
                                    cards.map(card => cleanHtmlTag(card.content)),
                                    ["Familiar", "PastTense", "Specific", "Independent", "Impact"],
                                    mapParticipantFeedbacks(participantFeedbacks)
                                ))
                            setEntropyCalculationResult(result)
                        }}
                >
                    Vote Analysis
                </button>
            </div>
            <div className="w-full">
                <div className="w-full sub-title sub-title-panel">Vote Records</div>
                <table className="w-full">
                    <thead>
                    <tr>
                        <th className="header header-panel">
                            Participant Name
                        </th>
                        <th className="header header-panel">
                            Voted
                        </th>
                    </tr>
                    </thead>
                    <tbody>
                    {
                        onlineUsers.map((user, index) => (
                            <tr key={index} className={index % 2 === 0 ? 'odd_row' : 'even_row'}>
                                <td className="text-cell text-cell-panel">
                                    {user.name}
                                </td>
                                <td className="text-cell text-cell-panel">
                                    {
                                        participantFeedbacks.find(feedback => feedback.participantId === user.id) ?
                                            "Yes" : "No"
                                    }
                                </td>
                            </tr>
                        ))
                    }
                    </tbody>
                </table>
            </div>
            <div className="w-full divider"/>
            <div className="w-full">
                <div className="sub-title sub-title-panel">Alignment Entropy Analysis</div>
                <table className="w-full">
                    <thead>
                    <tr>
                        <th className="header header-panel">Event Name</th>
                        <th className="header header-panel">Total</th>
                        <th className="header header-panel">Familiarity</th>
                        <th className="header header-panel">Past</th>
                        <th className="header header-panel">Impact</th>
                        <th className="header header-panel">Specific</th>
                        <th className="header header-panel">Independent</th>
                    </tr>
                    </thead>
                    <tbody>
                    {entropyCalculationResult?.entropyPerKnowledge.map((item, index) => {
                        return (<tr key={item.knowledge} className={`${index % 2 === 0 ? "even_row" : "odd_row"}`}>
                            <td className="text-cell text-cell-panel">{item.knowledge}</td>
                            <td className="number-cell number-cell-panel">{item.entropy.toFixed(2)}</td>
                            <td className="number-cell number-cell-panel">{item.entropyPerKnowledgeItem.find(i => i.item === 'Familiar')?.entropy.toFixed(2)}</td>
                            <td className="number-cell number-cell-panel">{item.entropyPerKnowledgeItem.find(i => i.item === 'PastTense')?.entropy.toFixed(2)}</td>
                            <td className="number-cell number-cell-panel">{item.entropyPerKnowledgeItem.find(i => i.item === 'Impact')?.entropy.toFixed(2)}</td>
                            <td className="number-cell number-cell-panel">{item.entropyPerKnowledgeItem.find(i => i.item === 'Specific')?.entropy.toFixed(2)}</td>
                            <td className="number-cell number-cell-panel">{item.entropyPerKnowledgeItem.find(i => i.item === 'Independent')?.entropy.toFixed(2)}</td>
                        </tr>)
                    })}
                    </tbody>
                </table>
            </div>
        </div>
    )
}