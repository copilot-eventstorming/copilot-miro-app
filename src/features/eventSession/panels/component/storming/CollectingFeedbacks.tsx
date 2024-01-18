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
import {Tab, TabList, TabPanel, Tabs} from "react-tabs";
import {RadarData} from "../../../../../component/RadarChart";
import {Radar} from "../../../../../component/RadarChartComponent";
import {prepareDataByParticipant, prepareDataByProperty} from "../../../../../utils/RadarDataFactory";

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

// 生成测试数据
const generateTestData = (): ParticipantFeedback[] => {
    const participants: ParticipantFeedback[] = [];

    for (let i = 1; i <= 10; i++) {
        const participantId = `participant_${i}`;
        const participantName = `Participant ${i}`;

        const feedback: EventFeedback[] = [];

        for (let j = 1; j <= 30; j++) {
            const eventName = `Event_${j}`;
            const items: ItemFeedback[] = [];

            // 生成随机的熟悉度数据（假设范围是0到3）
            const familiar = Math.floor(Math.random() * 4);
            const pastTense = Math.random() > 0.5;
            const specific = Math.random() > 0.5;
            const independent = Math.random() > 0.5;
            const impact = Math.floor(Math.random() * 4);
            const interest = Math.floor(Math.random() * 4);

            items.push(new ItemFeedback('Familiar', familiar.toString()));
            items.push(new ItemFeedback('PastTense', pastTense.toString()));
            items.push(new ItemFeedback('Specific', specific.toString()));
            items.push(new ItemFeedback('Independent', independent.toString()));
            items.push(new ItemFeedback('Impact', impact.toString()));
            items.push(new ItemFeedback('Interest', interest.toString()));

            feedback.push(new EventFeedback(eventName, items));
        }

        participants.push(new ParticipantFeedback(participantId, participantName, feedback));
    }

    return participants;
};

export const CollectingEventFeedbacks: React.FC<EventVoteProp> = ({
                                                                      onlineUsers,
                                                                      cards,
                                                                      boardSPI,
                                                                      broadcaster,
                                                                      copilotSession
                                                                  }) => {
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
            <div className="w-full justify-center my-2 flex flex-row space-x-4 px-1.5">
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
                >Start Feedback
                </button>
                <button className="btn btn-primary btn-primary-panel px-2 mx-2"
                        //disabled={participantFeedbacks.length <= 0}
                        onClick={() => {
                            setParticipantFeedbacks(generateTestData())
                            // const result = entropyCalculationService.calculateEntropy(
                            //     new EntropyCalculationRequest(
                            //         cards.map(card => cleanHtmlTag(card.content)),
                            //         ["Familiar", "PastTense", "Specific", "Independent", "Impact"],
                            //         mapParticipantFeedbacks(participantFeedbacks)
                            //     ))
                            // setEntropyCalculationResult(result)
                        }}
                >
                    Mock Feedbacks
                </button>
            </div>
            <div className="w-full">
                <div className="w-full sub-title sub-title-panel">Feedback Records</div>
                <table className="w-full">
                    <thead>
                    <tr>
                        <th className="header header-panel">
                            Participant Name
                        </th>
                        <th className="header header-panel">
                            Finished
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
            <Tabs>
                <TabList>
                    <Tab>
                        <div className="text-cell text-cell-panel font-bold">Importance Analysis</div>
                    </Tab>
                    <Tab>
                        <div className="text-cell text-cell-panel font-bold">Semantics Analysis</div>
                    </Tab>
                    {/*<Tab>*/}
                    {/*    <div className="text-cell text-cell-panel font-bold">Alignment</div>*/}
                    {/*</Tab>*/}
                </TabList>
                <TabPanel>
                    <Radar id="radar-chart-container"
                           title="Event Familiarity Radar Chart"
                           data={prepareDataByProperty(participantFeedbacks, 'Familiar')}
                           maxValue={3}
                           levels={4}
                           valueLabelF={value => {
                               switch(value) {
                                   case 0: return 'Never heard of it';
                                   case 1: return 'Heard of it, but don\'t know what it is';
                                   case 2: return 'Know what it is, but never used it';
                                   case 3: return 'Used it, and know it well';
                                   default: return '';
                               }
                           }}
                    />
                    <Radar id="radar-chart-container3"
                           title="Participant Familiarity Radar Chart"
                           data={prepareDataByParticipant(participantFeedbacks, 'Familiar')}
                           maxValue={3}
                           levels={4}
                           valueLabelF={value => {
                               switch(value) {
                                   case 0: return 'Never heard of it';
                                   case 1: return 'Heard of it, but don\'t know what it is';
                                   case 2: return 'Know what it is, but never used it';
                                   case 3: return 'Used it, and know it well';
                                   default: return '';
                               }
                           }}
                    />
                    <Radar id="radar-chart-container2" title="Event Impact Radar Chart"
                           data={prepareDataByProperty(participantFeedbacks, 'Impact')}
                           levels={4}
                           maxValue={3}
                           valueLabelF={value => {
                               switch(value) {
                                   case 0: return 'No impact or value';
                                   case 1: return 'Low impact or value';
                                   case 2: return 'Medium impact or value';
                                   case 3: return 'High impact or value';
                                   default: return '';
                               }
                           }}
                    ></Radar>
                    <Radar id="radar-chart-container4" title="Participant Impact Radar Chart"
                           data={prepareDataByParticipant(participantFeedbacks, 'Impact')}
                           levels={4}
                           maxValue={3}
                           valueLabelF={value => {
                               switch(value) {
                                   case 0: return 'No impact or value';
                                   case 1: return 'Low impact or value';
                                   case 2: return 'Medium impact or value';
                                   case 3: return 'High impact or value';
                                   default: return '';
                               }
                           }}
                    ></Radar>
                </TabPanel>
                <TabPanel>
                    <Radar id="radar-chart-container3" title="Past Tense" showAverage={true} showMaximum={false}
                           showMinimum={false}
                           data={prepareDataByProperty(participantFeedbacks, 'PastTense')} levels={2}
                           maxValue={1}
                           valueLabelF={value => {
                               switch(value) {
                                   case 0: return 'No, it is not past tense';
                                   case 1: return 'Yes, it is past tense';
                                   default: return '';
                               }
                           }}
                    ></Radar>
                    <Radar id="radar-chart-container4" title="Specific Meaning" showAverage={true} showMaximum={false}
                           showMinimum={false}
                           data={prepareDataByProperty(participantFeedbacks, 'Specific')} levels={2}
                           maxValue={1}
                           valueLabelF={value => {
                               switch(value) {
                                   case 0: return 'No, it is very blurry or vague';
                                   case 1: return 'Yes, it is specific';
                                   default: return '';
                               }
                           }}
                    ></Radar>
                    <Radar id="radar-chart-container5" title="Independent" showAverage={true} showMaximum={false}
                           showMinimum={false}
                           data={prepareDataByProperty(participantFeedbacks, 'Independent')} levels={2}
                           maxValue={1}
                           valueLabelF={value => {
                               switch(value) {
                                   case 0: return 'No, it contains other events';
                                   case 1: return 'Yes, it is independent';
                                   default: return '';
                               }
                           }}
                    ></Radar>
                </TabPanel>
                {/*<TabPanel>*/}
                    {/*<div className="w-full">*/}
                    {/*    <div className="sub-title sub-title-panel">Alignment Entropy Analysis</div>*/}
                    {/*    <table className="w-full">*/}
                    {/*        <thead>*/}
                    {/*        <tr>*/}
                    {/*            <th className="header header-panel">Event Name</th>*/}
                    {/*            <th className="header header-panel">Total</th>*/}
                    {/*            <th className="header header-panel">Familiarity</th>*/}
                    {/*            <th className="header header-panel">Past</th>*/}
                    {/*            <th className="header header-panel">Impact</th>*/}
                    {/*            <th className="header header-panel">Specific</th>*/}
                    {/*            <th className="header header-panel">Independent</th>*/}
                    {/*        </tr>*/}
                    {/*        </thead>*/}
                    {/*        <tbody>*/}
                    {/*        {entropyCalculationResult?.entropyPerKnowledge.map((item, index) => {*/}
                    {/*            return (<tr key={item.knowledge} className={`${index % 2 === 0 ? "even_row" : "odd_row"}`}>*/}
                    {/*                <td className="text-cell text-cell-panel">{item.knowledge}</td>*/}
                    {/*                <td className="number-cell number-cell-panel">{item.entropy.toFixed(2)}</td>*/}
                    {/*                <td className="number-cell number-cell-panel">{item.entropyPerKnowledgeItem.find(i => i.item === 'Familiar')?.entropy.toFixed(2)}</td>*/}
                    {/*                <td className="number-cell number-cell-panel">{item.entropyPerKnowledgeItem.find(i => i.item === 'PastTense')?.entropy.toFixed(2)}</td>*/}
                    {/*                <td className="number-cell number-cell-panel">{item.entropyPerKnowledgeItem.find(i => i.item === 'Impact')?.entropy.toFixed(2)}</td>*/}
                    {/*                <td className="number-cell number-cell-panel">{item.entropyPerKnowledgeItem.find(i => i.item === 'Specific')?.entropy.toFixed(2)}</td>*/}
                    {/*                <td className="number-cell number-cell-panel">{item.entropyPerKnowledgeItem.find(i => i.item === 'Independent')?.entropy.toFixed(2)}</td>*/}
                    {/*            </tr>)*/}
                    {/*        })}*/}
                    {/*        </tbody>*/}
                    {/*    </table>*/}
                    {/*</div>*/}
                {/*</TabPanel>*/}
            </Tabs>

        </div>
    )
}