import React, {useEffect, useState} from "react";
import {EventSummary} from "./component/EventSummary";
import {GraphOptimizerButtonGroup} from "./component/GraphOptimizerButtonGroup";
import {reloadEventSummary} from "../utils/EventSummaryUtils";
import {WorkshopBoardSPI} from "../../../application/spi/WorkshopBoardSPI";
import {emptyEventSummary} from "../types/EventSummaryTypes";

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
