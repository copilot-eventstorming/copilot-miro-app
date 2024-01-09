import React, {useEffect, useRef, useState} from "react";
import {Drawer} from "../../../../component/drawer";
import {mkItems, reloadEventSummary} from "../../utils/EventSummaryUtils";
import {EventSummaryItem, EventSummaryProps, EventSummaryTableProps} from "../../types/EventSummaryTypes";
import Switch from "react-switch"; // 引入Switch组件
import {Transition} from 'react-transition-group'; // 引入Transition组件


const EventSummaryTable: React.FC<EventSummaryTableProps> = ({
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

    useEffect(() => {
        let intervalId: NodeJS.Timeout;
        if (autoRefresh) { // 当autoRefresh为真时，设置定时器
            intervalId = setInterval(() => {
                reloadEventSummary(boardSPI, setEventSummary);
            }, 3000);
        }

        return () => {
            if (intervalId) { // 在组件卸载时或autoRefresh变为假时，清除定时器
                clearInterval(intervalId);
            }
        };
    }, [boardSPI, setEventSummary, autoRefresh]);

    return <>
        <div className="flex items-center w-full px-1.5">
            <Drawer isOpen={drawerOpen} style={{marginRight: '10px'}} toggleDrawer={toggleDrawer}/>
            <div className="sub-title sub-title-panel">Events Summary</div>
        </div>
        <div className="flex justify-between items-center w-full px-1.5">
            {
                drawerOpen && (
                    <>
                        <button className="btn btn-secondary btn-secondary-panel "
                                onClick={() => {
                                    reloadEventSummary(boardSPI, setEventSummary)
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
                    </>
                )
            }
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

                        const getArrowDirection = (current:number|undefined, prev: number|undefined) => {
                            if (!prev) return null;
                            if(!current) return null;
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

const EventSummary: React.FC<EventSummaryProps> = ({boardSPI, eventSummary, setEventSummary}) => {
    const [drawerOpen, setDrawerOpen] = React.useState(true);
    const [autoRefresh, setAutoRefresh] = useState(true); // 新增一个状态来控制是否启用自动刷新

    const toggleDrawer = () => {
        setDrawerOpen(!drawerOpen);
    };

    return (
        <div className="w-full flex justify-center flex-col items-center">
            <EventSummaryTable boardSPI={boardSPI} eventSummary={eventSummary} setEventSummary={setEventSummary}
                               drawerOpen={drawerOpen}
                               toggleDrawer={toggleDrawer}
                               autoRefresh={autoRefresh}
                               setAutoRefresh={setAutoRefresh}
            />
        </div>
    );
};

export {EventSummary};