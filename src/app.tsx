import * as React from 'react';
import ReactDOM from 'react-dom/client';
import {checkBoardManagedOnServer} from "./infrastructure/gateway/backend";
import {OnboardingPage} from "./infrastructure/view/onboarding/OnboardingPage";
import {SessionLifecycleChannel, SessionTypeChannel} from "./infrastructure/channel/channelNames";
import {SessionInitializingFinished, SessionInitializingStarted} from "./infrastructure/common/SessionLifecycleNames";
import {
    AggregateExplorationSession,
    CommandStormingSession,
    ContextMappingSession,
    EventStormingSession,
    SubdomainExplorationSession
} from "./infrastructure/common/SessionTypes";
import {EventStormingBoardPanel} from "./infrastructure/view/eventSession/EventStormingBoardPanel";
import {CommandStormingBoardPanel} from "./infrastructure/view/commandSession/CommandStormingBoardPanel";
import {AggregateExplorationBoardPanel} from "./infrastructure/view/aggregateSession/AggregateExplorationBoardPanel";
import {SubdomainExplorationBoardPanel} from "./infrastructure/view/subdomainSession/SubdomainExplorationBoardPanel";
import {ContextMappingBoardPanel} from "./infrastructure/view/contextSession/ContextMappingBoardPanel";
import {WorkshopBoardService} from "./infrastructure/gateway/WorkshopBoardService";
import {miroProxy} from "./infrastructure/gateway/MiroProxy";

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