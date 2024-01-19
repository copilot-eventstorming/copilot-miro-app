import {WorkshopBoardSPI, WorkshopCard} from "../../../../../application/spi/WorkshopBoardSPI";
import {EventSummaryItem, EventSummaryTableProps, EventSummaryTypes} from "../../../types/EventSummaryTypes";
import React, {useEffect, useRef, useState} from "react";
import {OnlineUserInfo} from "@mirohq/websdk-types";
import {mkItems, reloadEventSummary} from "../../../utils/EventSummaryUtils";
import Switch from "react-switch";
import {Drawer} from "../../../../../component/drawer";
import {cleanHtmlTag} from "../../../../../application/service/utils/utils";


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

export interface CreatingEventsProps {
    boardSPI: WorkshopBoardSPI;
    eventSummary: EventSummaryTypes;
    setEventSummary: React.Dispatch<React.SetStateAction<EventSummaryTypes>>;
}

interface ContributionProps {
    cards: WorkshopCard[]
    onlineUsers: OnlineUserInfo[]
    boardSPI: WorkshopBoardSPI
    drawerOpen: boolean;
    toggleDrawer: () => void;
}

export const ContributionByParticipant: React.FC<ContributionProps> = ({
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
export const CreatingEvents: React.FC<CreatingEventsProps> = ({
                                                                  boardSPI, eventSummary,
                                                                  setEventSummary
                                                              }) => {
    const [contributionByContentDrawerOpen, setContributionByContentDrawerOpen] = React.useState(true);
    const [contributionByParticipantDrawerOpen, setContributionByParticipantDrawerOpen] = React.useState(true);

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

    return <>
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
                            onColor="#00CC00"
                            offColor="#888888"/>
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
    </>
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

export function reloadContribution(boardSPI: WorkshopBoardSPI, setCards: (value: (((prevState: WorkshopCard[]) => WorkshopCard[]) | WorkshopCard[])) => void, setOnlineUsers: (value: (((prevState: OnlineUserInfo[]) => OnlineUserInfo[]) | OnlineUserInfo[])) => void) {
    boardSPI.fetchEventCards().then((cards) => {
        setCards(cards)
    })
    boardSPI.fetchWorkshopUsers().then((users) => {
        setOnlineUsers(users)
    })
}
