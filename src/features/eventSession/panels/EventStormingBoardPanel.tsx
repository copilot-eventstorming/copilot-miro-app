import React, {useEffect, useState} from "react";
import {TConsoleProps, TEventStormingBoardPanelProps} from "../types/EventStormingBoardPanelTypes";
import {EventStormingStepPanel} from "./component/EventStormingStepPanel";
import {emptyEventSummary} from "../types/EventSummaryTypes";
import {reloadEventSummary} from "../utils/EventSummaryUtils";
import {GraphOptimizerButtonGroup} from "./component/GraphOptimizerButtonGroup";
import {ConceptIntroductionStepPanel} from "./component/ConceptIntroductionStepPanel";
import {CopilotSession, copilotSession$} from "../../../application/CopilotSession";

const Console: React.FC<TConsoleProps> = ({output}) => {
    return (
        <div className="m-0 rounded">
            <div className="sub-title text-lg w-full text-center">Copilot Output</div>
            <textarea readOnly value={output} className="w-full text-xs h-48 p-2"/>
        </div>
    );
};
type TPanelProps = {
    title: string,
    children: React.ReactNode,
    index: number,
    currentStep: number,
    onClick: () => void
}
const AgendaItem: React.FC<TPanelProps> = ({title, children, index, currentStep, onClick}) => {
    return (
        <div className={`agenda-item ${index === currentStep ? 'agenda-item-open' : ''}`}>
            <div className="w-full">
                <input type="radio" id={`agenda-item-${index}`} className="hidden" checked={index === currentStep}
                       onChange={() => {
                       }}/>
                <label className="agenda-item-btn" onClick={onClick} htmlFor={`agenda-item-${index}`}>
                    {title}
                </label>
            </div>
            {index === currentStep && <div>{children}</div>}
        </div>
    );
};


export const EventStormingBoardPanel: React.FC<TEventStormingBoardPanelProps> = ({boardSPI}) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [eventSummary, setEventSummary] = useState(emptyEventSummary);
    const [consoleOutput, setConsoleOutput] = useState("");
    const [copilotSession, setCopilotSession] = useState(copilotSession$.value as CopilotSession);
    useEffect(() => {
        reloadEventSummary(boardSPI, setEventSummary);
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
    return (
        <div className="agenda">
            <div className="title title-panel">Event Storming Agenda</div>

            <AgendaItem
                title="1. Concepts Introduction"
                index={0}
                currentStep={currentStep}
                onClick={() => setCurrentStep(0)}
            >
                <ConceptIntroductionStepPanel boardSPI={boardSPI} copilotSession={copilotSession}/>
            </AgendaItem>
            <AgendaItem
                title="2. Event Storming"
                index={1}
                currentStep={currentStep}
                onClick={() => setCurrentStep(1)}
            >
                {/* Storm the events content */}
                <EventStormingStepPanel boardSPI={boardSPI} eventSummary={eventSummary}
                                        setEventSummary={setEventSummary} copilotSession={copilotSession}/>

            </AgendaItem>
            <AgendaItem
                title="3. Event Explanation"
                index={2}
                currentStep={currentStep}
                onClick={() => setCurrentStep(2)}
            >
                {/* Event Explanation content */}
                <div>Event Explanation content goes here</div>
            </AgendaItem>
            <AgendaItem
                title="4. Normalizing"
                index={3}
                currentStep={currentStep}
                onClick={() => setCurrentStep(3)}
            >
                {/* Normalizing content */}
                <GraphOptimizerButtonGroup boardSPI={boardSPI} consoleOutput={consoleOutput}
                                           setConsoleOutput={setConsoleOutput}/>
                <div className="divider"/>
                <Console output={consoleOutput}/>
            </AgendaItem>
            <AgendaItem
                title="5. Conclusion"
                index={4}
                currentStep={currentStep}
                onClick={() => setCurrentStep(4)}
            >
                {/* Save Checkpoint & Prepare Next Session content */}
                <div>Save Checkpoint & Prepare Next Session content goes here</div>
            </AgendaItem>
        </div>
    );
};
