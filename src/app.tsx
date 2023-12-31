import * as React from 'react';
import ReactDOM from 'react-dom/client';
import {checkBoardManagedOnServer} from "./api/Backend";
import {OnboardingPage} from "./features/onboarding/panels/OnboardingPage";
import {
    AggregateExplorationSession,
    CommandStormingSession,
    ContextMappingSession,
    EventStormingSession,
    SubdomainExplorationSession
} from "./features/onboarding/types/SessionTypes";
import {EventStormingBoardPanel} from "./features/eventSession/panels/EventStormingBoardPanel";
import {SubdomainExplorationBoardPanel} from "./features/subdomainSession/SubdomainExplorationBoardPanel";
import {WorkshopBoardService} from "./api/WorkshopBoardService";
import {miroProxy} from "./api/MiroProxy";
import {SessionLifecycleChannel, SessionTypeChannel} from "./features/onboarding/types/SessionChannels";
import {SessionInitializingFinished, SessionInitializingStarted} from "./features/onboarding/types/SessionEvents";
import {CommandStormingBoardPanel} from "./features/commandSession/CommandStormingBoardPanel";
import {AggregateExplorationBoardPanel} from "./features/aggregateSession/AggregateExplorationBoardPanel";
import {ContextMappingBoardPanel} from "./features/contextSession/ContextMappingBoardPanel";

interface SessionType {
    key: string;
}

async function isBoardManaged(boardSPI: WorkshopBoardService) {
    return await boardSPI.fetchBoardInfo().then(board => {
        return checkBoardManagedOnServer(board.id)
    })
}

const App: React.FC = () => {
    console.log("init app")
    const boardSPI = new WorkshopBoardService(miroProxy)

    const [managed, setManaged] = React.useState(false)
    const [page, setPage] = React.useState<JSX.Element | null>(null)

    React.useEffect(() => {
        (async () => await isBoardManaged(boardSPI))().then(setManaged)
    }, []);

    const sessionTypeChannel = new BroadcastChannel(SessionTypeChannel);
    const sessionLifecycleChannel = new BroadcastChannel(SessionLifecycleChannel);
    React.useEffect(() => {
        const handleEvent = async (event: MessageEvent) => {
            console.log("sessionTypeChannel event received")
            sessionLifecycleChannel.postMessage(SessionInitializingStarted)
            const page = createPageBySessionType(event.data, boardSPI)
            setPage(page)
            setManaged(true)
            sessionLifecycleChannel.postMessage(SessionInitializingFinished)
        }
        sessionTypeChannel.addEventListener("message", handleEvent)
        return () => {
            sessionTypeChannel.removeEventListener("message", handleEvent)
        }
    }, [sessionTypeChannel, sessionLifecycleChannel]);

    if (!managed || page == null) {
        return <OnboardingPage boardSPI={boardSPI}/>
    } else {
        return page
    }
};

function createPageBySessionType(sessionType: SessionType, boardSPI: WorkshopBoardService) {
    switch (sessionType.key) {
        case EventStormingSession.key:
            return <EventStormingBoardPanel boardSPI={boardSPI}/>
        case CommandStormingSession.key:
            return <CommandStormingBoardPanel/>
        case AggregateExplorationSession.key:
            return <AggregateExplorationBoardPanel/>
        case SubdomainExplorationSession.key:
            return <SubdomainExplorationBoardPanel/>
        case ContextMappingSession.key:
            return <ContextMappingBoardPanel/>
        default:
            return <div className="title title-panel">Unknown Board</div>
    }
}

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(<App/>);