import React from "react";
import {Drawer} from "../../../../component/drawer";
import {mkItems, reloadEventSummary} from "../../utils/EventSummaryUtils";
import {EventSummaryItem, EventSummaryProps, EventSummaryTableProps} from "../../types/EventSummaryTypes";

const EventSummaryTable: React.FC<EventSummaryTableProps> = ({
                                                                 boardSPI,
                                                                 eventSummary,
                                                                 setEventSummary,
                                                                 drawerOpen,
                                                                 toggleDrawer
                                                             }) => {
    const items: EventSummaryItem[] = mkItems(eventSummary);

    return <>
        <div className="flex items-center w-full px-1.5">
            <Drawer isOpen={drawerOpen} style={{marginRight: '10px'}} toggleDrawer={toggleDrawer}/>
            <div className="sub-title sub-title-panel">Events Summary</div>
            {
                drawerOpen && (
                    <button className="btn btn-secondary btn-secondary-panel "
                            onClick={() => {
                                reloadEventSummary(boardSPI, setEventSummary)
                            }}>
                        refresh
                    </button>
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
                    {items.map((item, index) => (
                        <tr key={item.type} className={index % 2 === 0 ? 'odd_row' : 'even_row'}>
                            <td className="text-cell text-cell-panel">{item.type}</td>
                            <td className="number-cell number-cell-panel">{item.total}</td>
                            <td className="number-cell number-cell-panel">{item.unique}</td>
                            <td className="number-cell number-cell-panel">{item.blank}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>)}</>
};

const EventSummary: React.FC<EventSummaryProps> = ({boardSPI, eventSummary, setEventSummary}) => {
    const [drawerOpen, setDrawerOpen] = React.useState(true);
    const toggleDrawer = () => {
        setDrawerOpen(!drawerOpen);
    };

    return (
        <div className="w-full flex justify-center flex-col items-center">
            <EventSummaryTable boardSPI={boardSPI} eventSummary={eventSummary} setEventSummary={setEventSummary}
                               drawerOpen={drawerOpen}
                               toggleDrawer={toggleDrawer}/>
        </div>
    );
};

export {EventSummary};