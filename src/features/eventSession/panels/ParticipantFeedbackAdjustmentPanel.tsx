import ReactDOM from "react-dom/client";
import * as React from "react";
import {useEffect, useState} from "react";
import {messageRegistry} from "../../../utils/MessagingBroadcastingInitializer";
import {ParticipantFeedbackAdjustmentRequest} from "../broadcast/message/ParticipantFeedbackAdjustmentRequest";
import {IMessageHandler} from "../../../application/messaging/IMessageHandler";
import {ParticipantFeedbackAdjustmentResponse} from "../broadcast/message/ParticipantFeedbackAdjustmentResponse";
import {
    ParticipantFeedbackAdjustmentResponseHandler
} from "../broadcast/handler/ParticipantFeedbackAdjustmentResponseHandler";
import {ParticipantSwitchFeedbackHandler} from "../broadcast/handler/ParticipantSwitchFeedbackHandler";
import {EventFeedback, ParticipantFeedback} from "../repository/EventSessionVoteRepository";
import {CopilotSession, copilotSession$} from "../../../application/CopilotSession";
import {initialize} from "../../../utils/AppInitializer";
import {WorkshopBoardSPI, WorkshopCard} from "../../../application/spi/WorkshopBoardSPI";
import {WorkshopBoardService} from "../../../api/WorkshopBoardService";
import {miroProxy} from "../../../api/MiroProxy";
import {Bar, BarChart, CartesianGrid, Tooltip, XAxis, YAxis} from 'recharts';
import {Familiarity, Impact, Independent, Interest, PastTense, Specific} from "../types/EventFeedbackMetricNames";
import {CSSTransition} from 'react-transition-group';
import Switch from "react-switch";
import {cleanHtmlTag} from "../../../application/service/utils/utils";

const boardSPI: WorkshopBoardSPI = new WorkshopBoardService(miroProxy);

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

function updateFeedbacks(incrementalFeedback: IncrementalFeedback, feedbacks: ParticipantFeedback[], setFeedbacks: (value: (((prevState: ParticipantFeedback[]) => ParticipantFeedback[]) | ParticipantFeedback[])) => void) {
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

const ParticipantFeedbackAdjustmentPanel: React.FC = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const sender = urlParams.get('sender') ?? "facilitator";
    const senderName = urlParams.get('senderName') ?? "facilitator";
    const [followingFacilitator, setFollowingFacilitator] = useState(true);

    const [copilotSession, setCopilotSession] = useState(copilotSession$.value as CopilotSession);
    const [cards, setCards] = useState([] as WorkshopCard[])

    // Assert feedbacks is only for one event
    const [feedbacks, setFeedbacks] = React.useState<ParticipantFeedback[]>(JSON.parse(urlParams.get('feedbacks') ?? "[]"));
    const [incrementalFeedback, setIncrementalFeedback] = React.useState<IncrementalFeedback | null>(null);

    const requestHandler: ParticipantSwitchFeedbackHandler = new ParticipantSwitchFeedbackHandler(setFeedbacks)
    const responseHandler: IMessageHandler<ParticipantFeedbackAdjustmentResponse> = new ParticipantFeedbackAdjustmentResponseHandler(setIncrementalFeedback)
    const [eventName, setEventName] = useState(feedbacks[0].feedback[0].eventName);
    const [groupedItems, setGroupedItems] = useState<Record<string, Record<string, number>>>({})

    const [showAnimation, setShowAnimation] = useState(false);
    const [animationKey, setAnimationKey] = useState(eventName);


    useEffect(() => {
        initialize()
    }, []);

    useEffect(() => {
        boardSPI.fetchWorkshopCards().then(setCards);
    }, []);

    useEffect(() => {
        const subscription = copilotSession$.subscribe(maybeCopilotSession => {
            if (maybeCopilotSession) {
                setCopilotSession(maybeCopilotSession);
            }
        })
        return () => {
            subscription.unsubscribe()
        }
    }, []);

    useEffect(() => {
        messageRegistry.registerHandler(
            ParticipantFeedbackAdjustmentRequest.MESSAGE_TYPE, requestHandler
        )
        messageRegistry.registerHandler(
            ParticipantFeedbackAdjustmentResponse.MESSAGE_TYPE, responseHandler
        )
        console.log(messageRegistry)
        return () => {
            messageRegistry.unregisterHandler(
                ParticipantFeedbackAdjustmentRequest.MESSAGE_TYPE, requestHandler
            )
            messageRegistry.unregisterHandler(
                ParticipantFeedbackAdjustmentResponse.MESSAGE_TYPE, responseHandler
            )
        }
    }, []);

    useEffect(() => {
        if (incrementalFeedback) {
            if (incrementalFeedback.incrementalFeedback.eventName === feedbacks[0].feedback[0].eventName) {
                updateFeedbacks(incrementalFeedback, feedbacks, setFeedbacks);
            }
        }
    }, [incrementalFeedback]);

    useEffect(() => {
        //group by item.item and item.value, count each (item.item,item.value), then create a barchart
        const allItems = feedbacks.flatMap(feedback => feedback.feedback[0].items);
        const result: Record<string, Record<string, number>> = allItems.reduce((acc, item) => {
            // 如果这个 item.item 还没有在 acc 中，我们就创建一个新的对象
            if (!acc[item.item]) {
                acc[item.item] = {};
            }

            // 如果这个 item.value 还没有在 acc[item.item] 中，我们就初始化它为 0
            if (!acc[item.item][item.feedback]) {
                acc[item.item][item.feedback] = 0;
            }

            // 然后，我们就可以增加这个 (item.item, item.value) 对的数量
            acc[item.item][item.feedback]++;

            // 最后，我们返回更新后的 acc
            return acc;
        }, {} as Record<string, Record<string, number>>);
        setGroupedItems(result)

        setEventName(feedbacks[0].feedback[0].eventName)
    }, [feedbacks]);

    useEffect(() => {
        // 根据需要的条件来更新 showAnimation 的值
        setInterval(() => {
            setShowAnimation(true);  // 或者 false，具体根据您的逻辑
        }, 200)
        setShowAnimation(false);  // 或者 false，具体根据您的逻辑
        setAnimationKey(eventName);

        // 清理函数，确保在组件卸载时取消订阅或做其他清理工作
        return () => {
            // setShowAnimation(false); // 确保在组件卸载时重置状态
        };
    }, [eventName]);  // 监听 eventName 或其他状态变量的变化

    useEffect(() => {
        const eventCardId = cards.find(card => cleanHtmlTag(card.content) === eventName)?.id
        if (eventCardId && followingFacilitator) boardSPI.zoomToCard(eventCardId)
    },[eventName, cards, followingFacilitator])

    return (
        <CSSTransition
            in={showAnimation}
            timeout={300}
            classNames="slide"
            unmountOnExit
            key={animationKey}
            // 在动画完成后重置 showAnimation 为 false
        >
            <div className="w-full">
                <div className="w-full">
                    <div className="w-full flex justify-end py-2 px-2">
                        <label className="font-lato text-sm font-bold">Following Event</label>
                        <div className="mx-2 centered">
                            <Switch checked={followingFacilitator} onChange={setFollowingFacilitator} height={20}
                                    width={40}
                                    onColor="#00CC00"
                                    offColor="#888888"/>
                        </div>
                    </div>
                </div>
                <div className="title title-panel">{eventName}</div>

                {Object.entries(groupedItems).map(([item, values], index) => {
                    // 将 values 对象转换为 recharts 可以接受的数据格式
                    const data = Object.entries(values).map(([feedback, count]) => ({
                        name: feedback,
                        count: count
                    }));

                    return (
                        <div className="flex flex-col w-full" key={item}>
                            <div className="sub-title sub-title">{item + " Distribution"}</div>

                            <BarChart width={200} height={150} data={data} key={index} title={item}
                                      className="font-lato">
                                <CartesianGrid strokeDasharray="3 3"/>
                                <XAxis dataKey="name"/>
                                <YAxis/>
                                <Tooltip/>
                                {data.map((entry, index) => (
                                    <Bar dataKey="count" fill="#82ca9d" key={index}/>
                                ))}
                            </BarChart>
                            {labels(item)}
                        </div>
                    );
                })}
            </div>

        </CSSTransition>)
}

function labels(item: string) {
    switch (item) {
        case Familiarity:
            return (<div className="text-xs px-2 py-2 w-full">
                <li>0: Never heard of it</li>
                <li>1: Heard of it, but don't know what it is</li>
                <li>2: Know what it is, but never used it</li>
                <li>3: Used it, and know it well</li>
            </div>)
        case Impact:
            return (<div className="text-xs px-2 w-full">
                <li>0: No impact or value or irrelevant for/with workshop goal.</li>
                <li>1: Low impact or value for workshop goal.</li>
                <li>2: Medium impact or value for workshop goal.</li>
                <li>3: High impact or value for workshop goal.</li>
            </div>)
        case Interest:
        case PastTense:
        case Specific:
        case Independent:
        default:
            return (<div></div>)

    }
}

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(<ParticipantFeedbackAdjustmentPanel/>);