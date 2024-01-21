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
import {CSSTransition} from 'react-transition-group';
import Switch from "react-switch";
import {cleanHtmlTag} from "../../../application/service/utils/utils";
import {MetricMetadata} from "../types/MetricMetadata";
import {numerical} from "../utils/IgnoreLowValueCardsUtils";
import {Broadcaster} from "../../../application/messaging/Broadcaster";
import {v4 as uuidv4} from 'uuid';
import {IncrementalFeedback, updateFeedbacks} from "../utils/FeedbackMergeUtils";

const boardSPI: WorkshopBoardSPI = new WorkshopBoardService(miroProxy);
const broadcaster: Broadcaster = new Broadcaster(miroProxy);




const ParticipantFeedbackAdjustmentPanel: React.FC = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const sender = urlParams.get('sender') ?? "facilitator";
    const senderName = urlParams.get('senderName') ?? "facilitator";

    const [followingFacilitator, setFollowingFacilitator] = useState(true);

    const [copilotSession, setCopilotSession] = useState(copilotSession$.value as CopilotSession);
    const [cards, setCards] = useState([] as WorkshopCard[])

    // Assert feedbacks is only for one event
    const [feedbacks, setFeedbacks] = React.useState<ParticipantFeedback[]>(JSON.parse(urlParams.get('feedbacks') ?? "[]"));
    const [metricsMetadata, setMetricsMetadata] = React.useState<MetricMetadata[]>(JSON.parse(urlParams.get('metricsMetadata') ?? "[]"));
    const [incrementalFeedback, setIncrementalFeedback] = React.useState<IncrementalFeedback | null>(null);
    const requestCallback: (participantFeedbacks: ParticipantFeedback[], metricMetadata: MetricMetadata[]) => void = (value, metricMetadata) => {
        setFeedbacks(value)
        setMetricsMetadata(metricMetadata)
    }
    const requestHandler: ParticipantSwitchFeedbackHandler = new ParticipantSwitchFeedbackHandler(requestCallback)
    const responseHandler: IMessageHandler<ParticipantFeedbackAdjustmentResponse> = new ParticipantFeedbackAdjustmentResponseHandler(setIncrementalFeedback)
    const [eventName, setEventName] = useState(feedbacks[0].feedback[0].eventName);
    const [groupedItems, setGroupedItems] = useState<Record<string, Record<string, number>>>({})

    const [showAnimation, setShowAnimation] = useState(false);
    const [animationKey, setAnimationKey] = useState(eventName);
    const [myFeedback, setMyFeedback] = useState<ParticipantFeedback | null>(null);

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
            console.log("incrementalFeedback", incrementalFeedback)
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

        const mFeedback = feedbacks.find(feedback => feedback.participantId === copilotSession?.miroUserId)
        if (mFeedback) {
            setMyFeedback(mFeedback)
        }
    }, [feedbacks]);

    useEffect(() => {
        // 根据需要的条件来更新 showAnimation 的值
        const intervalId = setInterval(() => {
            setShowAnimation(true);  // 或者 false，具体根据您的逻辑
        }, 200)
        setShowAnimation(false);  // 或者 false，具体根据您的逻辑
        setAnimationKey(eventName);

        // 清理函数，确保在组件卸载时取消订阅或做其他清理工作
        return () => {
            // setShowAnimation(false); // 确保在组件卸载时重置状态
            clearInterval(intervalId);  // 清除定时器
        };
    }, [eventName]);  // 监听 eventName 或其他状态变量的变化

    useEffect(() => {
        const eventCardId = cards.find(card => cleanHtmlTag(card.content) === eventName)?.id
        if (eventCardId && followingFacilitator) boardSPI.zoomToCard(eventCardId)
    }, [eventName, cards, followingFacilitator])


    useEffect(() => {
        if (copilotSession && myFeedback) {
            setFeedbacks(([
                ...(feedbacks.filter(feedback => feedback.participantId !== copilotSession.miroUserId)),
                myFeedback
            ]))
        }
    }, [myFeedback, copilotSession]);

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
                {metricsMetadata.map((metadata, index) => {
                    console.log(metadata)
                    // Convert values object to a format that recharts can accept
                    const data = metadata.metricOptions.map(metricOption => ({
                        name: metricOption.value.toString(),
                        count: groupedItems[metadata.metricName] ? groupedItems[metadata.metricName][metricOption.value.toString()] : -1
                    }));

                    return (
                        <div className="flex flex-col w-full" key={metadata.metricName}>
                            <div className="sub-title sub-title">{metadata.metricName + " Distribution"}</div>

                            <BarChart width={200} height={150} data={data} className="font-lato">
                                <CartesianGrid strokeDasharray="3 3"/>
                                <XAxis dataKey="name"/>
                                <YAxis/>
                                <Tooltip/>
                                <Bar dataKey="count" fill="#82ca9d"/>
                            </BarChart>
                            {options(eventName, metadata.metricName, metricsMetadata, myFeedback, setMyFeedback)}
                        </div>
                    );
                })}
                {/*{Object.entries(groupedItems).map(([item, values], index) => {*/}
                {/*    // 将 values 对象转换为 recharts 可以接受的数据格式*/}
                {/*    const data = Object.entries(values).map(([feedback, count]) => ({*/}
                {/*        name: feedback,*/}
                {/*        count: count*/}
                {/*    }));*/}

                {/*    return (*/}
                {/*        <div className="flex flex-col w-full" key={item}>*/}
                {/*            <div className="sub-title sub-title">{item + " Distribution"}</div>*/}

                {/*            <BarChart width={200} height={150} data={data} className="font-lato">*/}
                {/*                <CartesianGrid strokeDasharray="3 3"/>*/}
                {/*                <XAxis dataKey="name"/>*/}
                {/*                <YAxis/>*/}
                {/*                <Tooltip/>*/}
                {/*                <Bar dataKey="count" fill="#82ca9d"/>*/}
                {/*            </BarChart>*/}
                {/*            {options(eventName, item, metricsMetadata, myFeedback, setMyFeedback)}*/}
                {/*        </div>*/}
                {/*    );*/}
                {/*})}*/}
            </div>

        </CSSTransition>)
}

function options(eventName: string, item: string, metricsMetadata: MetricMetadata[], myFeedback: ParticipantFeedback | null, setMyFeedback: (f: ParticipantFeedback) => void) {
    const metricMetadata = metricsMetadata.find(metricMetadata => metricMetadata.metricName === item)

    if (metricMetadata) {
        return (<div className="text-xs px-2 py-2 w-full" key={item}> {
            metricMetadata.metricOptions.sort((a, b) => a.value - b.value).map(metricOption => {
                const myChoice = numerical(myFeedback?.feedback[0]
                    ?.items
                    ?.find(item => item.item === metricMetadata.metricName)
                    ?.feedback, 0)
                return (
                    // <li>{metricOption.value}: {metricOption.title}</li>
                    <div key={`${item}-${metricOption.value}-radio`} className="flex flex-row justify-items-center">
                        <input
                            type="radio"
                            id={`${item}-${metricOption.value}`}
                            name={`${item}-group`}
                            value={myChoice}
                            checked={metricOption.value === myChoice}
                            onChange={(e) => {
                                broadcaster.broadcast(new ParticipantFeedbackAdjustmentResponse(
                                    uuidv4(), null,
                                    copilotSession$.value?.miroUserId ?? '',
                                    copilotSession$.value?.miroUsername ?? '',
                                    null,
                                    new EventFeedback(eventName, [{
                                        item: metricMetadata.metricName,
                                        feedback: metricOption.value.toString()
                                    }])))
                                // update my Feedback
                                if (myFeedback) {
                                    const newFeedback = {
                                        ...myFeedback,
                                        feedback: [{
                                            ...myFeedback.feedback[0],
                                            items: [
                                                ...myFeedback.feedback[0].items.filter(item => item.item !== metricMetadata.metricName),
                                                {
                                                    item: metricMetadata.metricName,
                                                    feedback: metricOption.value.toString()
                                                }]
                                        }]
                                    }

                                    setMyFeedback(newFeedback)
                                } else {
                                    const newFeedback = {
                                        participantId: copilotSession$.value?.miroUserId ?? '',
                                        participantName: copilotSession$.value?.miroUsername ?? '',
                                        feedback: [{
                                            eventName: eventName,
                                            items: [{
                                                item: metricMetadata.metricName,
                                                feedback: metricOption.value.toString()
                                            }]
                                        }]
                                    }
                                    setMyFeedback(newFeedback)
                                }
                            }}
                        />
                        <label htmlFor={`${item}-${metricOption.value}`}
                               className="text-sm font-lato"><span className="px-2">{metricOption.value}.</span>
                            <span>{metricOption.title}</span></label>
                    </div>
                )

            })}</div>)
    } else {
        return <div>{item}</div>
    }

}

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(<ParticipantFeedbackAdjustmentPanel/>);