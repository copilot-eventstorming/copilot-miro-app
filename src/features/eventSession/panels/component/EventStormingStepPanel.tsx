import React, {useEffect, useRef, useState} from "react";
import {Drawer} from "../../../../component/drawer";
import {mkItems, reloadEventSummary} from "../../utils/EventSummaryUtils";
import {EventSummaryItem, EventStormingStepProps, EventSummaryTableProps} from "../../types/EventSummaryTypes";
import Switch from "react-switch"; // 引入Switch组件
import {
    TInvalidDomainEventCandidate,
    TValidateDomainEventResponse,
    TValidDomainEventCandidate,
    ValidateDomainEventService
} from "../../service/ValidateDomainEventService";
import {WorkshopBoardSPI, WorkshopCard} from "../../../../application/spi/WorkshopBoardSPI";
import {cleanHtmlTag} from "../../../../application/service/utils/utils"; // 引入Transition组件
import {Tab, TabList, TabPanel, Tabs} from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import {contentEquals} from "../../../../utils/WorkshopCardUtils";
import {DropEventService} from "../../service/DropEventService";
import '../../../../assets/LoadingSpinner.css'
import {OnlineUserInfo} from "@mirohq/websdk-types";
import {
    GroupByDuplicationDomainEventService,
    SimilarityGroup
} from "../../service/GroupByDuplicationDomainEventService";
import {SimilarEventsGroupLayoutService} from "../../service/SimilarEventsGroupLayoutService";
import {SaveOperation} from "./SaveOperation";
import {SaveActions} from "../../../../application/repository";
import {OperationLogChannel} from "../../../operationLogs/types/OperationLogChannels";
import {OperationLogDeleted, OperationLogRestore} from "../../../operationLogs/types/OperationLogEvent";

/*
Enhancement:
- [x] Add Tables to show Contributions
- [x] Add Methods to recognize de-duplicate events, the duplication number indicates the importance/alignment of the event
- [] Add Modal to let everyone vote for others' events:
   - I think I know what it means. if yes, then
   - is it a valid event on the 4 characteristics: past tense, value and impact, specific meaning, and independent
- [] After Vote, participants will see the vote statistics about their events from left hand side panel opened.
- [] Add Table/Modal to show the vote statistics
   - List the deduplicated events order by 'familiarity percentage', and 'consensus' with ascending direction
 */

interface ContributionProps {
    cards: WorkshopCard[]
    onlineUsers: OnlineUserInfo[]
    boardSPI: WorkshopBoardSPI
    drawerOpen: boolean;
    toggleDrawer: () => void;
}

function contributionQty(contribution: { [p: string]: WorkshopCard[] }): (a: string, b: string) => number {
    return (a: string, b: string) => {
        return contribution[b].length - contribution[a].length
    }
}

function positionOrder() {
    //TODO: might be sorted by incorrectness of past tense
    return (a: WorkshopCard, b: WorkshopCard) => {
        return new Date(a.createdAt) > new Date(b.createdAt) ? 1 : -1
        /*
        if (a.y - b.y !== 0) return a.y - b.y;
        else if (a.x - b.x !== 0) return a.x - b.x;
        else return 0;
         */
    }
}

const ContributionByParticipant: React.FC<ContributionProps> = ({
                                                                    cards, onlineUsers, boardSPI
                                                                    , drawerOpen, toggleDrawer
                                                                }) => {
    const [showMore, setShowMore] = useState({} as { [key: string]: boolean })
    const showQty = 5
    //group cards by created by
    let contributions: { [p: string]: WorkshopCard[] } = cards.reduce((acc, card) => {
        const creator = card.createdBy
        if (acc[creator]) {
            acc[creator].push(card)
        } else {
            acc[creator] = [card]
        }
        return acc
    }, {} as { [key: string]: WorkshopCard[] })

    const getUserName = (userId: string) => {
        const user = onlineUsers.find(user => user.id === userId)
        return user ? user.name : userId
    }

    const userWithoutContribution = onlineUsers
        .filter(user => !Object.keys(contributions).includes(user.id))

    contributions = userWithoutContribution.reduce((acc, user) => {
        acc[user.id] = []
        return acc
    }, contributions)

    return (<>
        <div className="flex items-center w-full px-1.5">
            <Drawer isOpen={drawerOpen} style={{marginRight: '10px'}} toggleDrawer={toggleDrawer}/>
            <div className="sub-title sub-title-panel text-sm">Contribution Status by Participants</div>
        </div>
        <div className="flex justify-between items-center w-full px-1.5">
            {
                drawerOpen && (
                    <div className="w-full">
                        <table className="w-full">
                            <thead>
                            <tr>
                                <th className="header header-panel">Name/Qty</th>
                                <th className="header header-panel">Cards Contribution</th>
                            </tr>
                            </thead>
                            <tbody>
                            {
                                contributions && Object.keys(contributions).sort(contributionQty(contributions)).map((key, index) => {
                                    const cards = contributions[key]
                                    const visibleCards = showMore[key] ? cards : cards.sort(positionOrder()).slice(0, showQty)
                                    return (<tr key={key} className={index % 2 === 0 ? "even_row" : "odd_row"}>
                                        <td className="clickable-label text-cell text-cell-panel text-center">{getUserName(key)}<br/>{cards.length}
                                        </td>
                                        <td>
                                            <div>
                                                {
                                                    <div>{visibleCards.map(card => (
                                                        <div key={card.id}
                                                             className="clickable-label text-cell text-cell-panel text-left"
                                                             onClick={() => boardSPI.zoomToCard(card.id)}>{cleanHtmlTag(card.content)}</div>
                                                    ))}
                                                    </div>
                                                }
                                                {
                                                    cards.length > showQty &&
                                                    <div className="clickable-label text-cell text-cell-panel text-right px-2"
                                                         onClick={() => setShowMore({...showMore, [key]: !showMore[key]})}>
                                                        {showMore[key] ? 'Show Less' : 'Show More'}
                                                    </div>
                                                }
                                            </div>
                                        </td>
                                    </tr>)
                                })
                            }
                            </tbody>
                        </table>
                    </div>)
            }
        </div>
    </>)
}

const Steps: React.FC = () => <>
    <div className="flex flex-col w-full my-4 px-4 py-2 font-lato text-sm">
        <b>Steps</b>
        <li>Align Workshop Objectives</li>
        <li>Event Storming Ramp Up
            <ul style={{listStyleType: 'disc', paddingLeft: '30px'}}>
                <li>Everyone's 1st shot</li>
                <li>Quick Review</li>
            </ul>
        </li>
        <li>Event Storming Fast Track</li>
        <ul style={{listStyleType: 'disc', paddingLeft: '30px'}}>
            <li>Fire at will</li>
            <li>Deduplicate</li>
            <li>Review</li>
        </ul>
    </div>
</>;

const ContributionByContent: React.FC<EventSummaryTableProps> = ({
                                                                     boardSPI,
                                                                     eventSummary,
                                                                     setEventSummary,
                                                                     drawerOpen,
                                                                     toggleDrawer,
                                                                     autoRefresh, // 新增一个props来接收autoRefresh状态
                                                                     setAutoRefresh // 新增一个props来接收setAutoRefresh函数
                                                                 }) => {
    const items: EventSummaryItem[] = mkItems(eventSummary);

    const prevItemsRef = useRef(items);

    useEffect(() => {
        prevItemsRef.current = items;
    }, [items]);


    return <>
        <div className="flex items-center w-full px-1.5">
            <Drawer isOpen={drawerOpen} style={{marginRight: '10px'}} toggleDrawer={toggleDrawer}/>
            <div className="sub-title sub-title-panel text-sm">Contribution Status By Content</div>
        </div>

        {drawerOpen && (
            <div className="w-full">
                <table className="w-full">
                    <thead>
                    <tr>
                        <th className="header header-panel">Category</th>
                        <th className="header header-panel text-right">Total</th>
                        <th className="header header-panel text-right">Unique</th>
                        <th className="header header-panel text-right">Blank</th>
                    </tr>
                    </thead>
                    <tbody>
                    {items.map((item, index) => {
                        const prevItem = prevItemsRef.current.find(i => i.type === item.type);

                        const getArrowDirection = (current: number | undefined, prev: number | undefined) => {
                            if (!prev) return null;
                            if (!current) return null;
                            if (current > prev) {
                                return 'up';
                            } else if (current < prev) {
                                return 'down';
                            }
                            return null;
                        };

                        return (
                            <tr key={item.type}>
                                <td className={`text-cell text-cell-panel ${index % 2 === 0 ? 'odd_row' : 'even_row'}
                ${item.type !== prevItem?.type ? 'cell-change' : ''}`}>
                                    {item.type}
                                </td>
                                <td className={`number-cell number-cell-panel ${index % 2 === 0 ? 'odd_row' : 'even_row'}
                ${item.total !== prevItem?.total ? 'cell-change' : ''}`}>
                                    {item.total} {getArrowDirection(item.total, prevItem?.total) === 'up' && '↑'}
                                    {getArrowDirection(item.total, prevItem?.total) === 'down' && '↓'}
                                </td>
                                <td className={`number-cell number-cell-panel ${index % 2 === 0 ? 'odd_row' : 'even_row'}
                ${item.unique !== prevItem?.unique ? 'cell-change' : ''}`}>
                                    {item.unique !== undefined ? item.unique : '-'} {getArrowDirection(item.unique, prevItem?.unique) === 'up' && '↑'}
                                    {getArrowDirection(item.unique, prevItem?.unique) === 'down' && '↓'}
                                </td>
                                <td className={`number-cell number-cell-panel ${index % 2 === 0 ? 'odd_row' : 'even_row'}
                ${item.blank !== prevItem?.blank ? 'cell-change' : ''}`}>
                                    {item.blank !== undefined ? item.blank : '-'} {getArrowDirection(item.blank, prevItem?.blank) === 'up' && '↑'}
                                    {getArrowDirection(item.blank, prevItem?.blank) === 'down' && '↓'}
                                </td>
                            </tr>
                        );
                    })}


                    </tbody>
                </table>
            </div>)
        }
    </>
};

function analysisByCopilot(eventCards: WorkshopCard[], service: ValidateDomainEventService, setAnalysisResult: (value: (((prevState: TValidateDomainEventResponse) => TValidateDomainEventResponse) | TValidateDomainEventResponse)) => void): Promise<void> {
    const cardNames: string[] = eventCards.map((card) => cleanHtmlTag(card.content))
    return service.perform(cardNames).then(setAnalysisResult)
}

function dropEvent(eventCards: WorkshopCard[], event: TInvalidDomainEventCandidate, boardSPI:
    WorkshopBoardSPI) {
    const card = eventCards
        .find(card => contentEquals(card.content, event.name))
    if (card) {
        const service = new DropEventService(boardSPI)
        service.perform(card)
            .then(() => console.log("dropEvent Success", cleanHtmlTag(card.content)))
            .catch(reason => console.log("dropEvent Failed", reason))
    } else {
        boardSPI.showFailure("Event name might contain special chars")
            .then(() => {/*ignored*/
            })
    }
}

type TEventDeduplicationProps = {
    boardSPI: WorkshopBoardSPI;
    cards: WorkshopCard[];
    drawerOpen: boolean;
    toggleDrawer: () => void;
}
const EventDeduplication: React.FC<TEventDeduplicationProps> = ({boardSPI, drawerOpen, toggleDrawer, cards}) => {
    const groupingService = new GroupByDuplicationDomainEventService()
    const layoutService: SimilarEventsGroupLayoutService = new SimilarEventsGroupLayoutService(boardSPI)
    const [isLoading, setIsLoading] = useState(false) // 新增一个状态来跟踪异步操作是否正在进行
    const [groupedCards, setGroupedCards] = useState([] as WorkshopCard[][]) // 新增一个状态来保存分组后的卡片
    const [similarityGroups, setSimilarityGroups] = useState([] as SimilarityGroup[]) // 新增一个状态来保存分组后的卡片

    const [consoleOutput, setConsoleOutput] = useState("");
    const [saveActions, setSaveActions] = React.useState(null as SaveActions | null);
    const [undoQty, setUndoQty] = React.useState(0);
    const [redoQty, setRedoQty] = React.useState(0);

    useEffect(() => {
        const operationLogEventChannel = new BroadcastChannel(OperationLogChannel);

        const handleEvent = async (event: MessageEvent) => {
            console.log('GraphOptimizerButtonGroup: receiveMessage', event)
            switch (event.data.type) {
                case OperationLogDeleted:
                    if (saveActions) {
                        saveActions.deleteLogById(event.data.id)
                    }
                    break;
                case OperationLogRestore:
                    if (saveActions) {
                        await saveActions.loadByLogId(event.data.id)
                        await miro.board.ui.closeModal();
                    }
                    break;
            }
        };

        operationLogEventChannel.addEventListener("message", handleEvent)

        // 在 useEffect 的清理函数中移除事件监听器
        return () => {
            operationLogEventChannel.removeEventListener("message", handleEvent);
            operationLogEventChannel.close();
        };
    }, [saveActions]);


    useEffect(() => {
            if (saveActions == null) {
                boardSPI.fetchBoardInfo().then(board => {
                    const actions = new SaveActions(board.id,
                        setUndoQty,
                        setRedoQty,
                        setConsoleOutput,
                        boardSPI);
                    setSaveActions(actions);
                })
            }
        }
    )
    return (<div className="w-full">

        <div className="flex items-center w-full px-1.5">
            <Drawer isOpen={drawerOpen} style={{marginRight: '10px'}} toggleDrawer={toggleDrawer}/>
            <div className="sub-title sub-title-panel text-sm">Deduplicating Similar Events</div>
        </div>

        {drawerOpen && (
            <div className="w-full">
                <div className="w-full centered my-2 flex flex-row justify-center space-x-4 px-1.5">
                    <button className="btn btn-primary btn-primary-panel px-2"
                            disabled={isLoading}
                            onClick={() => {
                                groupingService.perform(cards)
                                    .then(cardGroups => {
                                        setSimilarityGroups(cardGroups)
                                        return cardGroups.map(group => group.groupMembers)
                                    })
                                    .then(setGroupedCards)
                                    .catch(reason => {
                                        console.log("deduplication Failed", reason)
                                    })
                            }}>Similarity Analysis
                    </button>
                    <button className="btn btn-primary btn-primary-panel mx-1"
                            onClick={() => {
                                saveActions?.save('Auto-save before cluster similar events', 'Event Storming Session')
                                    .then(async () => await layoutService.perform(similarityGroups))
                                    .then(() => saveActions?.save('Auto-save after cluster similar events', 'Event Storming Session'))
                            }}
                            disabled={groupedCards.length === 0}>Cluster Similar Events
                    </button>
                </div>
                <SaveOperation saveActions={saveActions} redoQty={redoQty} undoQty={undoQty}
                               setConsoleOutput={setConsoleOutput}/>
                <table className="w-full">
                    <thead>
                    <tr>
                        <th className="head header-panel">Quantity</th>
                        <th className="head header-panel">Similar Event Candidates</th>
                    </tr>
                    </thead>
                    <tbody>
                    {
                        groupedCards.map((group, index) => (
                            <tr key={index} className={index % 2 === 0 ? 'odd_row' : 'even_row'}>
                                <td className="text-cell text-cell-panel text-center">{group.length}</td>
                                <td>
                                    <div>
                                        {
                                            <div>{group.map(card => (
                                                <div key={card.id}
                                                     className="clickable-label text-cell text-cell-panel text-left"
                                                     onClick={() => boardSPI.zoomToCard(card.id)}
                                                >{cleanHtmlTag(card.content)}</div>
                                            ))}
                                            </div>
                                        }
                                    </div>
                                </td>
                            </tr>
                        ))
                    }
                    </tbody>
                </table>

            </div>
        )}
    </div>)
}

function zoomToEvent(eventCards: WorkshopCard[], event: TInvalidDomainEventCandidate |
    TValidDomainEventCandidate, boardSPI: WorkshopBoardSPI) {
    const card = eventCards
        .find(card => contentEquals(card.content, event.name))
    if (card) boardSPI.zoomToCard(card.id)
}

function AnalysisResult(analysisResult: TValidateDomainEventResponse, keptEvents: string[], eventCards:
    WorkshopCard[], boardSPI: WorkshopBoardSPI, setKeptEvents: (value: (((prevState: string[]) => string[]) |
    string[])) => void) {
    return <Tabs>
        <TabList>
            <Tab>
                <div className="text-cell text-cell-panel font-bold">Invalids Candidates</div>
            </Tab>
            <Tab>
                <div className="text-cell text-cell-panel font-bold">Valids Candidates</div>
            </Tab>
        </TabList>
        <TabPanel>
            <table>
                <thead>
                <tr>
                    <th className='header header-panel'>Name</th>
                    <th className='header header-panel'>Reason</th>
                    <th className='header header-panel'>Action</th>
                </tr>
                </thead>
                <tbody>
                {analysisResult.invalidDomainEvents
                    .filter(candidate => !keptEvents.includes(candidate.name))
                    .map((event: TInvalidDomainEventCandidate, index: number) => (
                        <tr key={index} className={index % 2 === 0 ? 'odd_row' : 'even_row'}>
                            <td className="text-cell text-cell-panel clickable-label" onClick={
                                () => {
                                    zoomToEvent(eventCards, event, boardSPI);
                                }
                            }>{event.name}</td>
                            <td className="text-cell text-cell-panel">{event.reason}</td>
                            <td>
                                <button className="btn btn-secondary btn-secondary-panel" onClick={() => {
                                    if (event.fix.action === 'drop') {
                                        dropEvent(eventCards, event, boardSPI)
                                    }
                                }}>{event.fix.action}
                                </button>
                                <button className="btn btn-secondary btn-secondary-panel" onClick={() => {
                                    setKeptEvents([...keptEvents, event.name])
                                }}>Keep
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </TabPanel>
        <TabPanel>
            <table>
                <thead>
                <tr>
                    <th className='header header-panel'>Name</th>
                    <th className='header header-panel'>Comment</th>
                </tr>
                </thead>
                <tbody>
                {analysisResult.validDomainEvents
                    .concat(keptEvents.map((name) => ({name, comments: 'Kept'})))
                    .map((event: TValidDomainEventCandidate, index: number) => (
                        <tr key={index} className={index % 2 === 0 ? 'odd_row' : 'even_row'}>
                            <td className="text-cell text-cell-panel  clickable-label" onClick={
                                () => {
                                    zoomToEvent(eventCards, event, boardSPI);
                                }
                            }>{event.name}</td>
                            <td className="text-cell text-cell-panel">{event.comments}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </TabPanel>
    </Tabs>
        ;
}

const EventAnalysis: React.FC<{ boardSPI: WorkshopBoardSPI }> = ({
                                                                     boardSPI
                                                                 }) => {
    const service = new ValidateDomainEventService()
    const [eventCards, setEventCards] = useState([] as WorkshopCard[])
    const [analysisResult, setAnalysisResult] = useState({
        validDomainEvents: [], invalidDomainEvents: []
    } as TValidateDomainEventResponse)
    const [keptEvents, setKeptEvents] = useState([] as string[])
    const [isLoading, setIsLoading] = useState(false) // 新增一个状态来跟踪异步操作是否正在进行

    useEffect(() => {
        boardSPI.fetchEventCards().then((cards) => {
            setEventCards(cards)
        })
    }, []);


    return (
        <div className="w-full">
            <div className="divider w-full"/>
            <div className="w-full centered relative"> {/* 添加 relative 类 */}
                <button className="btn btn-primary btn-secondary-panel centered" onClick={() => {
                    setIsLoading(true)
                    analysisByCopilot(eventCards, service, setAnalysisResult)
                        .then(() => setIsLoading(false))
                }
                }>Analysis by Copilot
                </button>
                {isLoading && <div className="spinner" style={{
                    position: 'absolute',
                    top: 'calc(100%)',
                    left: '42%',
                    transform: 'translateX(-50%)'
                }}></div>}
            </div>
            <div className="w-full">
                {
                    !isLoading && (analysisResult.validDomainEvents.length > 0 || analysisResult.invalidDomainEvents.length > 0)
                    && AnalysisResult(analysisResult, keptEvents, eventCards, boardSPI, setKeptEvents)}
            </div>
        </div>
    )
}

function reloadContribution(boardSPI: WorkshopBoardSPI, setCards: (value: (((prevState: WorkshopCard[]) => WorkshopCard[]) | WorkshopCard[])) => void, setOnlineUsers: (value: (((prevState: OnlineUserInfo[]) => OnlineUserInfo[]) | OnlineUserInfo[])) => void) {
    boardSPI.fetchEventCards().then((cards) => {
        setCards(cards)
    })
    boardSPI.fetchWorkshopUsers().then((users) => {
        setOnlineUsers(users)
    })
}

const EventStormingStepPanel: React.FC<EventStormingStepProps> = ({boardSPI, eventSummary, setEventSummary}) => {
    const [contributionByContentDrawerOpen, setContributionByContentDrawerOpen] = React.useState(false);
    const [contributionByParticipantDrawerOpen, setContributionByParticipantDrawerOpen] = React.useState(false);
    const [deduplicationDrawerOpen, setDeduplicationDrawerOpen] = React.useState(false);

    const [autoRefresh, setAutoRefresh] = useState(false); // 新增一个状态来控制是否启用自动刷新
    const [cards, setCards] = useState([] as WorkshopCard[])
    const [onlineUsers, setOnlineUsers] = useState([] as OnlineUserInfo[])

    useEffect(() => {
        reloadContribution(boardSPI, setCards, setOnlineUsers);
    }, []);
    useEffect(() => {
        let intervalId: NodeJS.Timeout;
        if (autoRefresh) { // 当autoRefresh为真时，设置定时器
            intervalId = setInterval(() => {
                reloadEventSummary(boardSPI, setEventSummary);
                reloadContribution(boardSPI, setCards, setOnlineUsers);
            }, 3000);
        }

        return () => {
            if (intervalId) { // 在组件卸载时或autoRefresh变为假时，清除定时器
                clearInterval(intervalId);
            }
        };
    }, [boardSPI, setEventSummary, autoRefresh]);

    const eventSummaryToggleDrawer = () => {
        setContributionByContentDrawerOpen(!contributionByContentDrawerOpen);
    };
    const contributionToggleDrawer = () => {
        setContributionByParticipantDrawerOpen(!contributionByParticipantDrawerOpen);
    };

    const deduplicationToggleDrawer = () => {
        setDeduplicationDrawerOpen(!deduplicationDrawerOpen);
    };
    return (
        <div className="w-full flex justify-center flex-col items-center">
            <Steps/>
            <div className="divider w-full"/>
            <div className="flex justify-between items-center w-full px-1.5">

                <button className="btn btn-secondary btn-secondary-panel "
                        onClick={() => {
                            reloadEventSummary(boardSPI, setEventSummary)
                            reloadContribution(boardSPI, setCards, setOnlineUsers);
                        }}>
                    refresh
                </button>
                <div className="flex items-center">
                    <label className="font-lato text-sm">Auto Refresh</label>
                    <div className="mx-2 centered">
                        <Switch checked={autoRefresh} onChange={setAutoRefresh} height={20} width={40}
                                onColor="#00ff00"
                                offColor="#ff0000"/>
                    </div>
                </div>
            </div>
            <div className="divider w-full"/>

            <ContributionByContent boardSPI={boardSPI} eventSummary={eventSummary} setEventSummary={setEventSummary}
                                   drawerOpen={contributionByContentDrawerOpen}
                                   toggleDrawer={eventSummaryToggleDrawer}
                                   autoRefresh={autoRefresh}
                                   setAutoRefresh={setAutoRefresh}
            />
            <div className="divider  w-full"/>
            <ContributionByParticipant cards={cards} onlineUsers={onlineUsers} boardSPI={boardSPI}
                                       drawerOpen={contributionByParticipantDrawerOpen}
                                       toggleDrawer={contributionToggleDrawer}/>
            <div className="divider  w-full"/>
            <EventDeduplication boardSPI={boardSPI} cards={cards}
                                drawerOpen={deduplicationDrawerOpen}
                                toggleDrawer={deduplicationToggleDrawer}/>
            <EventAnalysis boardSPI={boardSPI}/>
        </div>
    )
        ;
};


export {
    EventStormingStepPanel
};