import React, {useEffect, useState} from "react";
import {EventSummary} from "./component/EventSummary";
import {GraphOptimizerButtonGroup} from "./component/GraphOptimizerButtonGroup";
import {EventSummaryNumbers, reloadEventSummary} from "../../../application/cases/eventSession/utils/EventSummaryUtils";
import {WorkshopBoardSPI} from "../../../application/gateway/WorkshopBoardSPI";

interface ConsoleProps {
    output: string;
}

const Console: React.FC<ConsoleProps> = ({output}) => {
    return (
        <div className="m-0 rounded">
            <div className="sub-title text-lg w-full text-center">Copilot Output</div>
            <textarea readOnly value={output} className="w-full text-xs h-48 p-2"/>
        </div>
    );
};

interface EventStormingBoardPanelProps {
    boardSPI: WorkshopBoardSPI;
}

const emptyEventSummary: EventSummaryNumbers = {
    eventCards: 0,
    eventUniqueCards: 0,
    eventBlankCards: 0,
    hotspotCards: 0,
    hotspotUniqueCards: 0,
    hotspotBlankCards: 0,
    otherCards: 0,

    eventIn10min: 0,
    eventIn10minUnique: 0,
    eventIn10minBlank: 0,

    eventIn5min: 0,
    eventIn5minUnique: 0,
    eventIn5minBlank: 0,

    eventIn1min: 0,
    eventIn1minUnique: 0,
    eventIn1minBlank: 0,


    hotspotIn10m: 0,
    hotspotIn10mUniques: 0,
    hotspotIn10mBlank: 0,
    hotspotIn5m: 0,

    hotspotIn5mUniques: 0,
    hotspotIn5mBlank: 0,
    hotspotIn1m: 0,
    hotspotIn1mUniques: 0,
    hotspotIn1mBlank: 0,
    users: 0,
    contributors: 0,

}

export const EventStormingBoardPanel: React.FC<EventStormingBoardPanelProps> = ({boardSPI}) => {
    const [eventSummary, setEventSummary] = useState(emptyEventSummary);
    const [consoleOutput, setConsoleOutput] = useState("");

    useEffect(() => {
        reloadEventSummary(boardSPI, setEventSummary);
    }, []);

    return (
        <div>
            <div className="title title-panel">Event Storming Session</div>
            <EventSummary boardSPI={boardSPI} eventSummary={eventSummary} setEventSummary={setEventSummary}/>
            <div className="divider"/>
            <GraphOptimizerButtonGroup boardSPI={boardSPI} consoleOutput={consoleOutput}
                                       setConsoleOutput={setConsoleOutput}/>
            <div className="divider"/>
            <Console output={consoleOutput}/>
        </div>
    );
};

