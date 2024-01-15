import React, {useEffect, useState} from "react";
import {TConsoleProps, TEventStormingBoardPanelProps} from "../types/EventStormingBoardPanelTypes";
import {EventStormingStepPanel} from "./component/EventStormingStepPanel";
import {emptyEventSummary} from "../types/EventSummaryTypes";
import {reloadEventSummary} from "../utils/EventSummaryUtils";
import {GraphOptimizerButtonGroup} from "./component/GraphOptimizerButtonGroup";
import {ConceptIntroductionStepPanel} from "./component/ConceptIntroductionStepPanel";
import {CopilotSession, copilotSession$} from "../../../application/CopilotSession";
import {AgendaItem} from "../../../component/AgendaItem";

const Console: React.FC<TConsoleProps> = ({output}) => {
    return (
        <div className="m-0 rounded">
            <div className="sub-title text-lg w-full text-center">Copilot Output</div>
            <textarea readOnly value={output} className="w-full text-xs h-48 p-2"/>
        </div>
    );
};


export const EventStormingBoardPanel: React.FC<TEventStormingBoardPanelProps> = ({boardSPI}) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [currentLevel, setCurrentLevel] = useState(0);
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
                level={0}
                currentStep={currentStep}
                currentLevel={currentLevel}
                setCurrentLevel={setCurrentLevel}
                setCurrentStep={setCurrentStep}
            >
                <ConceptIntroductionStepPanel boardSPI={boardSPI} copilotSession={copilotSession}/>
            </AgendaItem>
            <AgendaItem
                title="2. Event Storming"
                index={1}
                level={0}
                currentLevel={currentLevel}
                currentStep={currentStep}
                setCurrentLevel={setCurrentLevel}
                setCurrentStep={setCurrentStep}
            >
                {/* Storm the events content */}
                <EventStormingStepPanel boardSPI={boardSPI}
                                        eventSummary={eventSummary}
                                        setEventSummary={setEventSummary}
                                        currentLevel={currentLevel}
                                        setCurrentLevel={setCurrentLevel}
                                        copilotSession={copilotSession}/>
            </AgendaItem>
            <AgendaItem
                title="3. Event Explanation"
                index={2}
                level={0}
                currentLevel={currentLevel}
                currentStep={currentStep}
                setCurrentLevel={setCurrentLevel}
                setCurrentStep={setCurrentStep}
            >
                {/* Event Explanation content */}
                <div>Event Explanation content goes here</div>
            </AgendaItem>
            <AgendaItem
                title="4. Normalizing"
                index={3}
                level={0}
                currentLevel={currentLevel}
                currentStep={currentStep}
                setCurrentLevel={setCurrentLevel}
                setCurrentStep={setCurrentStep}
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
                level={0}
                currentLevel={currentLevel}
                currentStep={currentStep}
                setCurrentLevel={setCurrentLevel}
                setCurrentStep={setCurrentStep}
            >
                {/* Save Checkpoint & Prepare Next Session content */}
                <div>Save Checkpoint & Prepare Next Session content goes here</div>
            </AgendaItem>
        </div>
    );
};
