import ReactDOM from "react-dom/client";
import * as React from "react";
import {useEffect, useState} from "react";
import {messageRegistry} from "../../utils/MessagingBroadcastingInitializer";
import {FeedbackAdjustmentRequest} from "../broadcast/message/FeedbackAdjustmentRequest";
import {IMessageHandler} from "../../application/messaging/IMessageHandler";
import {FeedbackAdjustmentResponse} from "../broadcast/message/FeedbackAdjustmentResponse";
import {
    ParticipantFeedbackAdjustmentResponseHandler
} from "../broadcast/handler/ParticipantFeedbackAdjustmentResponseHandler";
import {ParticipantSwitchFeedbackHandler} from "../broadcast/handler/ParticipantSwitchFeedbackHandler";
import {EventFeedback, ParticipantFeedback} from "../../features/eventSession/repository/EventSessionVoteRepository";
import {CopilotSession, copilotSession$} from "../../application/CopilotSession";
import {initialize} from "../../utils/AppInitializer";
import {WorkshopBoardSPI, WorkshopCard} from "../../application/spi/WorkshopBoardSPI";
import {WorkshopBoardService} from "../../api/WorkshopBoardService";
import {miroProxy} from "../../api/MiroProxy";
import {Bar, BarChart, CartesianGrid, Cell, Tooltip, XAxis, YAxis} from 'recharts';
import {CSSTransition} from 'react-transition-group';
import Switch from "react-switch";
import {cleanHtmlTag} from "../../application/service/utils/utils";
import {MetricMetadata, MetricOption} from "../../features/eventSession/types/MetricMetadata";
import {numerical} from "../../features/eventSession/utils/IgnoreLowValueCardsUtils";
import {Broadcaster} from "../../application/messaging/Broadcaster";
import {v4 as uuidv4} from 'uuid';
import {IncrementalFeedback, updateFeedbacks} from "../../features/eventSession/utils/FeedbackMergeUtils";


const boardSPI: WorkshopBoardSPI = new WorkshopBoardService(miroProxy);
const broadcaster: Broadcaster = new Broadcaster(miroProxy);

interface MetricOptionProps {
    item: string,
    metricMetadata: MetricMetadata,
    myFeedback: ParticipantFeedback | null,
    eventName: string,
    setMyFeedback: (f: ParticipantFeedback) => void
}

const MetricOptions: React.FC<MetricOptionProps> = ({item, metricMetadata, setMyFeedback, myFeedback, eventName}) => {
    return (<div className="text-xs px-2 py-2 w-full" key={item}> {
        metricMetadata.metricOptions.sort((a, b) => a.value - b.value).map(metricOption => {
            const myChoice = numerical(myFeedback?.feedback[0]
                ?.items
                ?.find(item => item.item === metricMetadata.metricName)
                ?.feedback, 0)
            return (
                <div key={`${item}-${metricOption.value}-radio`} className="flex flex-row justify-items-center">
                    <input
                        type="radio"
                        id={`${item}-${metricOption.value}`}
                        name={`${item}-group`}
                        value={myChoice}
                        checked={metricOption.value === myChoice}
                        onChange={onMyFeedbackChange(eventName, metricMetadata, metricOption, myFeedback, setMyFeedback)}
                    />
                    <label htmlFor={`${item}-${metricOption.value}`}
                           className="text-sm font-lato"><span className="px-2">{metricOption.value}.</span>
                        <span>{metricOption.title}</span></label>
                </div>
            )
        })}</div>);
}


interface FollowingFacilitatorSwitchProps {
    followingFacilitator: boolean,
    setFollowingFacilitator: (value: boolean) => void
}

const FollowingFacilitatorSwitch: React.FC<FollowingFacilitatorSwitchProps> = ({
                                                                                   followingFacilitator,
                                                                                   setFollowingFacilitator
                                                                               }) => {
    return <div className="w-full">
        <div className="w-full flex justify-end py-2 px-2">
            <label className="font-lato text-sm font-bold">Following Event</label>
            <div className="mx-2 centered">
                <Switch checked={followingFacilitator} onChange={setFollowingFacilitator} height={20}
                        width={40}
                        onColor="#00CC00"
                        offColor="#888888"/>
            </div>
        </div>
    </div>;
}

interface FeedbacksBarChartsProps {
    metricsMetadata: MetricMetadata[],
    groupedItems: Record<string, Record<string, number>>,
    myFeedback: ParticipantFeedback | null,
    eventName: string,
    setMyFeedback: (value: (((prevState: (ParticipantFeedback | null)) => (ParticipantFeedback | null)) | ParticipantFeedback | null)) => void
}

const FeedbacksBarCharts: React.FC<FeedbacksBarChartsProps> = ({
                                                                   metricsMetadata,
                                                                   groupedItems,
                                                                   myFeedback,
                                                                   eventName,
                                                                   setMyFeedback
                                                               }) => {

    return metricsMetadata.map((metadata, index) => {
        const data = metadata.metricOptions.map(metricOption => ({
            name: metricOption.value.toString(),
            count: groupedItems[metadata.metricName] ? groupedItems[metadata.metricName][metricOption.value.toString()] : 0
        }));
        return (
            <div className="flex flex-col w-full" key={metadata.metricName}>
                <div className="sub-title sub-title">{metadata.metricName + " Distribution"}</div>
                <BarChart width={200} height={150} data={data} className="font-lato">
                    <CartesianGrid strokeDasharray="3 3"/>
                    <XAxis dataKey="name"/>
                    <YAxis/>
                    <Tooltip/>
                    <Bar dataKey="count">
                        {colorfulBarCell(data, metadata)}

                    </Bar>
                </BarChart>
                <MetricOptions item={metadata.metricName}
                               metricMetadata={metadata}
                               myFeedback={myFeedback}
                               eventName={eventName}
                               setMyFeedback={setMyFeedback}/>
            </div>
        );
    });
}


const ParticipantFeedbackAdjustmentPanel: React.FC = () => {
    useEffect(() => {
        initialize()
    }, []);

    const {
        myFeedback,
        setMyFeedback,
        feedbacks,
        setFeedbacks,
        metricsMetadata,
        eventName,
        setEventName
    } = useFeedbacks();


    const {
        animationKey,
        groupedItems,
        showAnimation,
        followingFacilitator,
        setFollowingFacilitator
    } = mkUIState(eventName, feedbacks, setEventName, setMyFeedback, myFeedback, setFeedbacks);

    return (
        <CSSTransition
            in={showAnimation}
            timeout={300}
            classNames="slide"
            unmountOnExit
            key={animationKey}
        >
            <div className="w-full">
                <FollowingFacilitatorSwitch followingFacilitator={followingFacilitator}
                                            setFollowingFacilitator={setFollowingFacilitator}/>
                <div className="title title-panel">{eventName}</div>
                <FeedbacksBarCharts metricsMetadata={metricsMetadata} groupedItems={groupedItems}
                                    myFeedback={myFeedback} eventName={eventName} setMyFeedback={setMyFeedback}/>
            </div>

        </CSSTransition>)
}

function mergeMyFeedback(myFeedback: ParticipantFeedback, metricMetadata: MetricMetadata, selection: MetricOption) {
    return {
        ...myFeedback,
        feedback: [{
            ...myFeedback.feedback[0],
            items: [
                ...myFeedback.feedback[0].items.filter(item => item.item !== metricMetadata.metricName),
                {
                    item: metricMetadata.metricName,
                    feedback: selection.value.toString()
                }]
        }]
    };
}

function makeMyFeedback(eventName: string, metricMetadata: MetricMetadata, metricOption: MetricOption) {
    return {
        participantId: copilotSession$.value?.miroUserId ?? '',
        participantName: copilotSession$.value?.miroUsername ?? '',
        feedback: [{
            eventName: eventName,
            items: [{
                item: metricMetadata.metricName,
                feedback: metricOption.value.toString()
            }]
        }]
    };
}

function broadcastFeedbackChange(eventName: string, metricMetadata: MetricMetadata, selection: MetricOption) {
    broadcaster.broadcast(new FeedbackAdjustmentResponse(
        uuidv4(), null,
        copilotSession$.value?.miroUserId ?? '',
        copilotSession$.value?.miroUsername ?? '',
        null,
        new EventFeedback(eventName, [{
            item: metricMetadata.metricName,
            feedback: selection.value.toString()
        }])))
}

function onMyFeedbackChange(eventName: string, metricMetadata: MetricMetadata, selection: MetricOption, myFeedback: ParticipantFeedback | null, setMyFeedback: (f: ParticipantFeedback) => void) {
    return () => {
        broadcastFeedbackChange(eventName, metricMetadata, selection);
        // update my Feedback
        if (myFeedback && myFeedback.feedback[0]) {
            setMyFeedback(mergeMyFeedback(myFeedback, metricMetadata, selection))
        } else {
            setMyFeedback(makeMyFeedback(eventName, metricMetadata, selection))
        }
    };
}


function colorfulBarCell(data: { name: string; count: number }[], metadata: MetricMetadata) {
    const cs: React.JSX.Element[] = data.map((entry, index) => {
        let fill;
        switch (entry.name) {
            case '3':
                fill = '#FF8C00';  // 最深的橙色
                break;
            case '2':
                fill = '#FFA500';  // 中等深度的橙色
                break;
            case '1':
                fill = '#FFBF00';  // 较浅的橙色
                break;
            case '0':
                fill = '#FFDAB9';  // 最浅的橙色
                break;
            default:
                fill = '#cccccc';  // 默认颜色
        }
        return <Cell key={`${metadata.metricName}-cell-${index}`} fill={fill}/>;
    })
    return cs
}

function makeBarChartData(feedbacks: ParticipantFeedback[]) {
    const allItems = feedbacks.flatMap(feedback => feedback.feedback[0]?.items || []);
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
    return result;
}

function setupMessagingComponent(switchFeedbackHandler: ParticipantSwitchFeedbackHandler, feedbackAdjustmentHandler: IMessageHandler<FeedbackAdjustmentResponse>) {
    useEffect(() => {
        messageRegistry.registerHandler(
            FeedbackAdjustmentRequest.MESSAGE_TYPE, switchFeedbackHandler
        )
        messageRegistry.registerHandler(
            FeedbackAdjustmentResponse.MESSAGE_TYPE, feedbackAdjustmentHandler
        )
        console.log(messageRegistry)
        return () => {
            messageRegistry.unregisterHandler(
                FeedbackAdjustmentRequest.MESSAGE_TYPE, switchFeedbackHandler
            )
            messageRegistry.unregisterHandler(
                FeedbackAdjustmentResponse.MESSAGE_TYPE, feedbackAdjustmentHandler
            )
        }
    }, []);
}

function setupIncrementalFeedbackUpdateEffect(incrementalFeedback: IncrementalFeedback | null, feedbacks: ParticipantFeedback[], setFeedbacks: (value: (((prevState: ParticipantFeedback[]) => ParticipantFeedback[]) | ParticipantFeedback[])) => void) {
    useEffect(() => {
        if (incrementalFeedback) {
            console.log("incrementalFeedback", incrementalFeedback)
            if (incrementalFeedback.incrementalFeedback.eventName === feedbacks[0].feedback[0].eventName) {
                updateFeedbacks(incrementalFeedback, feedbacks, setFeedbacks);
            }
        }
    }, [incrementalFeedback]);
}

function setupFeedbacksUpdateBarchartDataEffect(setGroupedItems: (value: (((prevState: Record<string, Record<string, number>>) => Record<string, Record<string, number>>) | Record<string, Record<string, number>>)) => void, feedbacks: ParticipantFeedback[], setEventName: (value: (((prevState: string) => string) | string)) => void, copilotSession: CopilotSession, setMyFeedback: (value: (((prevState: (ParticipantFeedback | null)) => (ParticipantFeedback | null)) | ParticipantFeedback | null)) => void) {
    useEffect(() => {
        //group by item.item and item.value, count each (item.item,item.value), then create a barchart
        setGroupedItems(makeBarChartData(feedbacks))

        if (feedbacks[0].feedback[0]) {
            setEventName(feedbacks[0].feedback[0].eventName)
        }

        const mFeedback = feedbacks.find(feedback => feedback.participantId === copilotSession?.miroUserId)
        if (mFeedback) {
            setMyFeedback(mFeedback)
        }
    }, [feedbacks]);
}

function setupMyFeedbackUpdateFeedbacksData(copilotSession: CopilotSession, myFeedback: ParticipantFeedback | null, setFeedbacks: (value: (((prevState: ParticipantFeedback[]) => ParticipantFeedback[]) | ParticipantFeedback[])) => void, feedbacks: ParticipantFeedback[]) {
    useEffect(() => {
        if (copilotSession && myFeedback) {
            setFeedbacks(([
                ...(feedbacks.filter(feedback => feedback.participantId !== copilotSession.miroUserId)),
                myFeedback
            ]))
        }
    }, [myFeedback, copilotSession]);
}

function setupAnimationWithEventName(setShowAnimation: (value: (((prevState: boolean) => boolean) | boolean)) => void, setAnimationKey: (value: (((prevState: string) => string) | string)) => void, eventName: string) {
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
}

function setupBoardFocusChangeByEventChange(cards: WorkshopCard[], eventName: string, followingFacilitator: boolean) {
    useEffect(() => {
        const eventCardId = cards.find(card => cleanHtmlTag(card.content) === eventName)?.id
        if (eventCardId && followingFacilitator) boardSPI.zoomToCard(eventCardId)
    }, [eventName, cards, followingFacilitator])
}
function useFeedbacks() {
    //Page Level parameters
    const urlParams = new URLSearchParams(window.location.search);
    // Scenario Level parameters
    const [myFeedback, setMyFeedback] = useState<ParticipantFeedback | null>(null);
    // For realtime feedback update
    const [incrementalFeedback, setIncrementalFeedback] = React.useState<IncrementalFeedback | null>(null);
    const feedbackAdjustmentHandler: IMessageHandler<FeedbackAdjustmentResponse> = new ParticipantFeedbackAdjustmentResponseHandler(setIncrementalFeedback)
    const [feedbacks, setFeedbacks] = React.useState<ParticipantFeedback[]>(JSON.parse(urlParams.get('feedbacks') ?? "[]"));
    const [metricsMetadata, setMetricsMetadata] = React.useState<MetricMetadata[]>(JSON.parse(urlParams.get('metricsMetadata') ?? "[]"));
    const [eventName, setEventName] = useState(urlParams.get('eventName') ?? "Event Name Not Specified");

    const onDomainEventSwitched: (eventName: string, participantFeedbacks: ParticipantFeedback[], metricMetadata: MetricMetadata[]) => void = (eventName: string, participantFeedbacks, metricMetadata) => {
        setEventName(eventName)
        setFeedbacks(participantFeedbacks)
        setMetricsMetadata(metricMetadata)
    }
    const switchFeedbackHandler: ParticipantSwitchFeedbackHandler = new ParticipantSwitchFeedbackHandler(onDomainEventSwitched)
    setupMessagingComponent(switchFeedbackHandler, feedbackAdjustmentHandler);
    setupIncrementalFeedbackUpdateEffect(incrementalFeedback, feedbacks, setFeedbacks);
    return {myFeedback, setMyFeedback, feedbacks, setFeedbacks, metricsMetadata, eventName, setEventName};
}

function mkUIState(eventName: string, feedbacks: ParticipantFeedback[], setEventName: (value: (((prevState: string) => string) | string)) => void, setMyFeedback: (value: (((prevState: (ParticipantFeedback | null)) => (ParticipantFeedback | null)) | ParticipantFeedback | null)) => void, myFeedback: ParticipantFeedback | null, setFeedbacks: (value: (((prevState: ParticipantFeedback[]) => ParticipantFeedback[]) | ParticipantFeedback[])) => void) {
    // Board Level parameters
    const [copilotSession, setCopilotSession] = useState(copilotSession$.value as CopilotSession);
    const [cards, setCards] = useState([] as WorkshopCard[])
    useEffect(() => {
        boardSPI.fetchWorkshopCards().then(setCards);
        const subscription = copilotSession$.subscribe(maybeCopilotSession => {
            if (maybeCopilotSession) {
                setCopilotSession(maybeCopilotSession);
            }
        })
        return () => {
            subscription.unsubscribe()
        }
    }, []);

    const [animationKey, setAnimationKey] = useState(eventName);
    // Barchart Data
    const [groupedItems, setGroupedItems] = useState<Record<string, Record<string, number>>>({})
    const [showAnimation, setShowAnimation] = useState(false);

    setupFeedbacksUpdateBarchartDataEffect(setGroupedItems, feedbacks, setEventName, copilotSession, setMyFeedback);
    setupAnimationWithEventName(setShowAnimation, setAnimationKey, eventName);
    // Once facilitator switch to another event, whether to follow the facilitator's focused event
    const [followingFacilitator, setFollowingFacilitator] = useState(true);
    setupBoardFocusChangeByEventChange(cards, eventName, followingFacilitator);
    setupMyFeedbackUpdateFeedbacksData(copilotSession, myFeedback, setFeedbacks, feedbacks);
    return {animationKey, groupedItems, showAnimation, followingFacilitator, setFollowingFacilitator};
}

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(<ParticipantFeedbackAdjustmentPanel/>);