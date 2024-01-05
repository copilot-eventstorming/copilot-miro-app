import React, {useEffect, useState} from "react"
import {AddEventStormingSampleService} from "../../service/AddEventStormingSampleService";
import {WorkshopBoardSPI} from "../../../../application/spi/WorkshopBoardSPI";
import {Hotspot} from "../../types/Hotspot";
import {FetchHotspotsService} from "../../service/FetchHotspotsService";
import {Shape} from "@mirohq/websdk-types";
import {Broadcaster} from "../../../../application/messaging/Broadcaster";
import {miroProxy} from "../../../../api/MiroProxy";
import {
    StartEventSessionConceptIntroductionQuiz
} from "../../broadcast/message/StartEventSessionConceptIntroductionQuiz";
import {EventSessionQuizAnswerHandler} from "../../broadcast/handler/EventSessionQuizAnswerHandler";
import {EventSessionQuizAnswer} from "../../broadcast/message/EventSessionQuizAnswer";
import {CopilotSession} from "../../../../application/CopilotSession";
import {v4 as uuidv4} from 'uuid';
import {messageRegistry} from "../../../../utils/MessagingBroadcastingInitializer";
import {EventSessionQuizRepository, QuizAnswer} from "../../repository/EventSessionQuizRepository";


type TConceptIntroductionPanelProps = {
    boardSPI: WorkshopBoardSPI
    copilotSession: CopilotSession
}

function truncateString(str: string, maxLength: number): string {
    if (str.length > maxLength) {
        return str.slice(0, maxLength) + '...';
    } else {
        return str;
    }
}

interface FlowingWindowProps {
    answer: QuizAnswer;
    style: React.CSSProperties;
}

const FloatingWindow: React.FC<FlowingWindowProps> = ({answer, style}) => {
    return (
        <div className="floating-window w-full">
            <div className="sub-title sub-title-panel">{answer.userName}'s Answers</div>
            <table className="w-full">
                <thead>
                <tr className="w-full">
                    <th className="header header-panel">No.</th>
                    <th className="header header-panel centered">Answer</th>
                </tr>
                </thead>
                <tbody>
                {answer.answers.map((answer, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'odd_row' : 'even_row'}>
                        <td className="number-cell number-cell-panel centered">{answer.questionNumber + 1}</td>
                        <td className="text-cell text-cell-panel">{answer.actualAnswer.map((answer, index) => {
                            return (<li key={index}>{answer}</li>)
                        })}</td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    )
        ;
};

export const ConceptIntroductionPanel: React.FC<TConceptIntroductionPanelProps> = ({boardSPI, copilotSession}) => {
    const sampleService = new AddEventStormingSampleService(boardSPI)
    const hotspotService = new FetchHotspotsService(boardSPI)
    const broadcaster = new Broadcaster(miroProxy)
    const [hotspots, setHotspots] = useState<Hotspot[]>([])
    const quizRepository: EventSessionQuizRepository | null = copilotSession ? new EventSessionQuizRepository(copilotSession.miroBoardId) : null
    const [quizAnswers, setQuizAnswers] = useState<QuizAnswer[]>([])
    const [hoveredScoreIndex, setHoveredScoreIndex] = useState<number>(-1)

    console.log("ConceptIntroductionPanel", copilotSession)

    useEffect(() => {
        const answerHandler = new EventSessionQuizAnswerHandler(quizRepository, setQuizAnswers)
        hotspotService.fetchHotspots().then(setHotspots)
        messageRegistry.registerHandler(EventSessionQuizAnswer.MESSAGE_TYPE, answerHandler)
        return () => {
            messageRegistry.unregisterHandler(EventSessionQuizAnswer.MESSAGE_TYPE, answerHandler)
        }
    }, [])

    const handleMouseEnter = (rowIndex: number, event: React.MouseEvent<HTMLTableRowElement>) => {
        const trElement = event.currentTarget;
        const floatingWindowElement = trElement!.querySelector('.floating-window') as HTMLElement;

        if (floatingWindowElement) {
            const trRect = trElement!.getBoundingClientRect();
            const floatingWindowHeight = floatingWindowElement!.offsetHeight;

            floatingWindowElement!.style.top = `${trRect.top - floatingWindowHeight - 60}px`;
        }

        setHoveredScoreIndex(rowIndex);
    };

    const handleMouseLeave = () => {
        setHoveredScoreIndex(-1);
    };
    const ConceptIntroduction: React.FC = () => <>
        <div className="flex flex-col w-full my-4 px-4 py-2 font-lato text-sm">
            <b>Core Concepts</b>
            <li>Domain Event and Granularity</li>
            <b>Notions</b>
            <li>Domain Event Sticky Note</li>
            <li>Hotspot Shape</li>
            <b>Processes</b>
            <li>Resolve Hotspot</li>
            <li>Vote for Domain Event Acceptance</li>
        </div>
        <div className="flex flex-row w-full centered">
            <div className="px-2 py-2">
                <button className="btn btn-primary btn-primary-panel px-2" onClick={async () => {
                    await sampleService.addSample()
                }}>Add Sample
                </button>
            </div>
            <div className="px-2 py-2">
                <button className="btn btn-primary btn-primary-panel px-2" onClick={async () => {
                    await sampleService.clearBoard()
                }}>Clear Board
                </button>
            </div>
        </div>
    </>;
    const HotspotList: React.FC = () => <div>
        <div className="sub-title sub-title-panel">Hotspot List</div>
        <table className="w-full">
            <thead>
            <tr>
                <th className="header header-panel">Hotspot Content</th>
                <th className="header header-panel">Created By</th>
                <th className="header header-panel">Resolved</th>
            </tr>
            </thead>
            <tbody>
            {hotspots.map((item, index) => (
                <tr key={index} className={index % 2 === 0 ? 'odd_row' : 'even_row'}>
                    <td className="text-cell text-cell-panel clickable-label"
                        onClick={() => boardSPI.zoomToCard(item.id)}
                        title={item.content}>{truncateString(item.content, 30)}</td>
                    <td className="text-cell text-cell-panel">{item.createdBy}</td>
                    <td className="text-cell text-cell-panel centered">
                        <input type='checkbox'
                               checked={item.resolved}
                               onChange={() => {
                                   if (item.resolved) {
                                       hotspotService.unresolveHotspot(item.card as Shape).then(setHotspots)
                                   } else {
                                       hotspotService.resolveHotspot(item.card as Shape).then(setHotspots)
                                   }
                               }}/>
                    </td>
                </tr>
            ))}
            </tbody>
        </table>
    </div>;
    const Answers: React.FC = () => <div>
        <table className="w-full">
            <thead>
            <tr>
                <th className="header header-panel">Name</th>
                <th className="header header-panel">Score</th>
                <th className="header header-panel">Action</th>
            </tr>
            </thead>
            <tbody>
            {quizAnswers.map((answer, index) => (
                <tr key={index} className={index % 2 === 0 ? 'odd_row' : 'even_row'}
                    onMouseEnter={(e) => handleMouseEnter(index, e)}
                    onMouseLeave={handleMouseLeave}
                >
                    <td className="text-cell text-cell-panel">{answer.userName}</td>
                    <td className="number-cell number-cell-panel centered">{answer.answers.filter(x => x !== undefined).length}</td>
                    <td>
                        <button className="btn btn-secondary btn-secondary-panel px-2 py-1"
                                onClick={async () => {
                                    await broadcaster.broadcast(
                                        new StartEventSessionConceptIntroductionQuiz(
                                            uuidv4(), answer.userId,
                                            copilotSession?.miroUserId,
                                            copilotSession?.miroUsername ?? "",
                                            copilotSession?.miroUserId
                                        ))
                                    console.log(miroProxy.getApiCallsInLastMinute())
                                }}>Retry
                        </button>
                    </td>
                    {hoveredScoreIndex == index &&
                        <FloatingWindow answer={answer} style={{}}/>}
                </tr>
            ))}
            </tbody>
        </table>
    </div>;
    const Quiz: React.FC = () => <>
        <div>
            <div className="px-2 py-2 centered">
                <button className="btn btn-primary btn-primary-panel px-2" onClick={async () => {
                    console.log("Start a quiz")
                    await broadcaster.broadcast(
                        new StartEventSessionConceptIntroductionQuiz(
                            uuidv4(), "participant",
                            copilotSession?.miroUserId,
                            copilotSession?.miroUsername ?? "",
                            copilotSession?.miroUserId ?? null
                        ))
                    console.log(miroProxy.getApiCallsInLastMinute())
                }}>Start a Quiz
                </button>
            </div>
        </div>
        <div className="w-full">
            <div className="sub-title sub-title-panel w-full centered">Answers By Participants</div>
            <Answers/>
        </div>
    </>;
    return (
        <div className="flex flex-col w-full">
            <ConceptIntroduction/>
            <div className="divider"/>
            <HotspotList/>
            <div className="divider"/>
            <Quiz/>
        </div>)
}