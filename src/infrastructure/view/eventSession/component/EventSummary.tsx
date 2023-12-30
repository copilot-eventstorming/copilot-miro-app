import React from "react";
import {Drawer} from "../../../common/components";
import {EventSummaryNumbers, reloadEventSummary} from "../../../../application/cases/eventSession/utils/EventSummaryUtils";
import {WorkshopBoardSPI} from "../../../../application/gateway/WorkshopBoardSPI";

interface DataType {
    type: string;
    total: number;
    unique: number | string;
    blank: number | string;
}

interface EventSummaryProps {
    boardSPI: WorkshopBoardSPI;
    eventSummary: EventSummaryNumbers;
    setEventSummary: React.Dispatch<React.SetStateAction<EventSummaryNumbers>>;

}

interface EventSummaryTableProps {
    boardSPI: any;
    eventSummary: EventSummaryNumbers;
    setEventSummary: React.Dispatch<React.SetStateAction<EventSummaryNumbers>>;
    drawerOpen: boolean;
    toggleDrawer: () => void;
}

const EventSummaryTable: React.FC<EventSummaryTableProps> = ({
                                                                 boardSPI,
                                                                 eventSummary,
                                                                 setEventSummary,
                                                                 drawerOpen,
                                                                 toggleDrawer
                                                             }) => {
    const dataTypes: DataType[] = [
        {
            type: 'Events',
            total: eventSummary.eventCards,
            unique: eventSummary.eventUniqueCards,
            blank: eventSummary.eventBlankCards
        },
        {
            type: 'Events in 10m',
            total: eventSummary.eventIn10min,
            unique: eventSummary.eventIn10minUnique,
            blank: eventSummary.eventIn10minBlank
        },
        {
            type: 'Events in 5m',
            total: eventSummary.eventIn5min,
            unique: eventSummary.eventIn5minUnique,
            blank: eventSummary.eventIn5minBlank
        },
        {
            type: 'Events in 1m',
            total: eventSummary.eventIn1min,
            unique: eventSummary.eventIn1minUnique,
            blank: eventSummary.eventIn1minBlank
        },
        {
            type: 'Hotspots',
            total: eventSummary.hotspotCards,
            unique: eventSummary.hotspotUniqueCards,
            blank: eventSummary.hotspotBlankCards
        },
        {
            type: 'Hotspots in 10m',
            total: eventSummary.hotspotIn10m,
            unique: eventSummary.hotspotIn10mUniques,
            blank: eventSummary.hotspotIn10mBlank
        },
        {
            type: 'Hotspots in 5m',
            total: eventSummary.hotspotIn5m,
            unique: eventSummary.hotspotIn5mUniques,
            blank: eventSummary.hotspotIn5mBlank
        },
        {
            type: 'Hotspots in 1m',
            total: eventSummary.hotspotIn1m,
            unique: eventSummary.hotspotIn1mUniques,
            blank: eventSummary.hotspotIn1mBlank
        },
        {type: 'Others', total: eventSummary.otherCards, unique: '-', blank: '-'},
        {type: 'Online Users', total: eventSummary.users, unique: '-', blank: '-'},
        {type: 'Contributors', total: eventSummary.contributors, unique: '-', blank: '-'},
    ];

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
                    {dataTypes.map((dataType, index) => (
                        <tr key={dataType.type} className={index % 2 === 0 ? 'odd_row' : 'even_row'}>
                            <td className="text-cell text-cell-panel">{dataType.type}</td>
                            <td className="number-cell number-cell-panel">{dataType.total}</td>
                            <td className="number-cell number-cell-panel">{dataType.unique}</td>
                            <td className="number-cell number-cell-panel">{dataType.blank}</td>
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