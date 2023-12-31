import React, {useEffect, useState} from 'react';
import ReactDOM from "react-dom/client";
import {SummaryBoard} from "../component/SummaryBoard";
import {
    AggregateExplorationSession,
    CommandStormingSession,
    ContextMappingSession,
    EventStormingSession,
    strategicSessions,
    SubdomainExplorationSession, TSessionType
} from "../types/SessionTypes";

import LoadingSpinnerAnimation from "../component/LoadingSpinnerAnimation";
import {miroProxy} from "../../../api/MiroProxy";
import {WorkshopBoardService} from "../../../api/WorkshopBoardService";
import {emptyBoardCoreCards, WorkshopBoardCoreCards} from "../../../application/spi/WorkshopBoardSPI";
import {SessionLifecycleChannel, SessionTypeChannel} from "../types/SessionChannels";
import {NotInitialized, SessionInitializingFinished, SessionInitializingStarted} from "../types/SessionEvents";
import {initialize} from "../../../utils/AppInitializer";

type TStateAnimationProps = {
    stateName: { key: string, text: string };
    setClosed: React.Dispatch<React.SetStateAction<boolean>>;
}

const StateAnimation: React.FC<TStateAnimationProps> = ({stateName, setClosed}) => {
    if (stateName.key === NotInitialized.key) {
        return (
            <div className="relative w-full" style={{"height": 116}}>
                <div className="state-animation-empty h-0.5 w-full absolute bottom-0"></div>
            </div>
        )
    } else {
        return (
            <div className="state-animation-full w-full pb-2" style={{"height": 116}}>
                {stateName.key === SessionInitializingStarted.key ? <LoadingSpinnerAnimation/> :
                    (<div className="mt-2 pb-3 text-white w-full">
                        <div className="text-xl text-center py-2 font-bold ">Congratulations!</div>
                        <div className="text-center pt-2 text-lg">Board was imported
                            successfully, {stateName.text}</div>
                        <div className="text-gray-500 w-full text-center">Click <span onClick={() => setClosed(true)}
                                                                                      className="underline hover:cursor-pointer">close</span> button
                            to proceed.
                        </div>
                    </div>)}
            </div>
        )
    }
}

const fireSessionTypeEvent = (sessionTypeChannel: BroadcastChannel, sessionType: TSessionType) => {
    if (isValidSessionType(sessionType)) {
        sessionTypeChannel.postMessage(sessionType)
    }
}

const boardSPI = new WorkshopBoardService(miroProxy)
const sessionTypeChannel = new BroadcastChannel(SessionTypeChannel);
const sessionTypes = [
    {session: EventStormingSession, name: 'Event Storming'},
    {session: CommandStormingSession, name: 'Command Storming'},
    {session: AggregateExplorationSession, name: 'Aggregate Exploration'},
    {session: SubdomainExplorationSession, name: 'Subdomain Exploration'},
    {session: ContextMappingSession, name: 'Context Mapping'},
];

const ImportBoardModal: React.FC = () => {

    const [initializingSession, setInitializingSession] = useState<{ key: string, text: string }>(NotInitialized)
    const [managed, setManaged] = useState(false)
    const [closed, setClosed] = useState(false)
    const [boardSummary, setBoardSummary] = useState<WorkshopBoardCoreCards>(emptyBoardCoreCards)
    const [name, setName] = useState("")
    const [id, setId] = useState("")

    useEffect(() => {
        initialize()
    }, []);

    useEffect(() => {
        const sessionLifecycleChannel = new BroadcastChannel(SessionLifecycleChannel);
        const eventHandler = (event: MessageEvent) => {
            console.log('Receive message from SessionLifecycleChannel: ' + event.data.key)
            if (event.data.key === SessionInitializingStarted.key || event.data.key === SessionInitializingFinished.key) {
                setInitializingSession(event.data)
            } else {
                console.log("ignoring message from SessionLifecycleChannel: " + event.data.key)
            }
        };
        sessionLifecycleChannel.addEventListener("message", eventHandler)
        return () => {
            sessionLifecycleChannel.removeEventListener("message", eventHandler)
            sessionLifecycleChannel.close()
        }
    }, [])

    useEffect(() => {
        if (closed) {
            miro.board.ui.closeModal().then(() => {
                setManaged(false)
            });
        }
    }, [closed]);

    useEffect(() => {
        boardSPI.summaryBySessionMainTypes().then(setBoardSummary);
    }, []);


    useEffect(() => {
        boardSPI.fetchBoardInfo().then(board => {
            setId(board.id);
        })
    }, [closed]);


    if (!managed) {
        return (
            <div className="w-full">
                <div className="title title-modal">Manage Board as a Workshop Session</div>
                <div className="w-full flex justify-end pr-2">
                    <button
                        className="btn btn-secondary btn-secondary-modal"
                        onClick={async () => {
                            const boardSummary = await boardSPI.summaryBySessionMainTypes();
                            setBoardSummary(boardSummary)
                        }}>Refresh
                    </button>
                    <button
                        className="btn btn-secondary btn-secondary-modal"
                        onClick={() => setClosed(true)}
                    >Close
                    </button>
                </div>
                <SummaryBoard boardSummary={boardSummary} id={id} name={name}/>
                <div className="flex flex-col w-full justify-center items-center mt-8">
                    <StateAnimation stateName={initializingSession} setClosed={setClosed}/>
                </div>
                <div className="mt-2 pt-2 flex flex-col h-full w-full justify-center items-center">
                    <div className="sub-title sub-title-modal mb-4">Choose a session type to import:</div>
                    <div className="flex justify-between items-center space-x-3 mx-3">
                        {
                            sessionTypes.map(({session, name}) => (
                                <button key={session.key}
                                        className="btn btn-primary btn-primary-modal"
                                        disabled={initializingSession.key === SessionInitializingStarted.key}
                                        onClick={() => fireSessionTypeEvent(sessionTypeChannel, session)}>
                                    {name}
                                </button>
                            ))
                        }
                    </div>

                </div>
            </div>)
    } else {
        return null;
    }
}

function isValidSessionType(sessionType: TSessionType) {
    return strategicSessions
        .map(session => session.key)
        .includes(sessionType.key);
}

const root = ReactDOM.createRoot(document.getElementById('prompt-root') as HTMLElement);
root.render(<ImportBoardModal/>);