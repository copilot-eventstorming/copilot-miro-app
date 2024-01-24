import React, {useEffect, useState} from "react"
import {AddEventStormingSampleService} from "../../../service/AddEventStormingSampleService";
import {WorkshopBoardSPI} from "../../../../../application/spi/WorkshopBoardSPI";
import {Hotspot} from "../../../types/Hotspot";
import {FetchHotspotsService} from "../../../service/FetchHotspotsService";
import {Shape} from "@mirohq/websdk-types";
import {Broadcaster} from "../../../../../application/messaging/Broadcaster";
import {miroProxy} from "../../../../../api/MiroProxy";
import {
    StartEventSessionConceptIntroductionQuiz
} from "../../../broadcast/message/StartEventSessionConceptIntroductionQuiz";
import {EventSessionQuizAnswerHandler} from "../../../broadcast/handler/EventSessionQuizAnswerHandler";
import {Answer, EventSessionQuizAnswer} from "../../../broadcast/message/EventSessionQuizAnswer";
import {CopilotSession} from "../../../../../application/CopilotSession";
import {v4 as uuidv4} from 'uuid';
import {messageRegistry} from "../../../../../utils/MessagingBroadcastingInitializer";
import {EventSessionQuizRepository, QuizAnswer} from "../../../repository/EventSessionQuizRepository";
import {LoadEventSessionQuizService} from "../../../service/LoadEventSessionQuizService";
import {TQuestion} from "../../../types/QuizTypes";
import Switch from "react-switch";


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
    quizAnswer: QuizAnswer;
    questions: TQuestion[];
    style: React.CSSProperties;
}

function isIncorrectFn(actualAnswerItem: string, questions: TQuestion[], questionNumber: number): boolean {
    const answerLetter = actualAnswerItem.split(')')[0].trim();
    return !questions[questionNumber].correctAnswers.includes(answerLetter);
}

function missingAnswerFn(actualAnswerItem: string[], questions: TQuestion[], questionNumber: number): string[] {
    const actualAnswerLetters = actualAnswerItem.map(x => x.split(')')[0].trim());
    const correctAnswerLetters = questions[questionNumber].correctAnswers;
    return correctAnswerLetters.filter(x => !actualAnswerLetters.includes(x));
}

const FloatingWindow: React.FC<FlowingWindowProps> = ({quizAnswer, questions, style}) => {
    return (
        <>
            <div className="floating-window w-full">
                <div className="sub-title sub-title-panel">{quizAnswer.userName}'s Answers</div>
                <table className="w-full">
                    <thead>
                    <tr className="w-full">
                        <th className="header header-panel text-xs">No.</th>
                        <th className="header header-panel text-xs text-center">Answers</th>
                        <th className="header header-panel text-xs">Correct Answers</th>
                    </tr>
                    </thead>
                    <tbody>
                    {quizAnswer.answers.map((filledAnswer, index) => (
                        <tr key={index} className={index % 2 === 0 ? 'odd_row' : 'even_row'}>
                            <td className="number-cell number-cell-panel centered">{filledAnswer.questionNumber + 1}</td>
                            <td className="text-cell text-cell-panel">{filledAnswer.actualAnswer.map((singleAnswerItem, index) => {
                                const isIncorrect = isIncorrectFn(singleAnswerItem, questions, filledAnswer.questionNumber);
                                return (
                                    <li key={index} className={isIncorrect ? 'incorrect-answer' : 'correct-answer'}>
                                        {singleAnswerItem}
                                    </li>
                                );
                            })}</td>
                            <td className="text-cell, text-cell-panel">{questions[filledAnswer.questionNumber]
                                .correctAnswers
                                .map((correctAnswerItem, index) => {
                                    const isMissing = missingAnswerFn(filledAnswer.actualAnswer, questions, filledAnswer.questionNumber)
                                        .includes(correctAnswerItem);
                                    return (
                                        <li key={index} className={isMissing ? 'missing-answer' : ''}>
                                            {correctAnswerItem}
                                        </li>
                                    );

                                })
                            }</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </>
    )
        ;
};

export const ConceptIntroductionStepPanel: React.FC<TConceptIntroductionPanelProps> = ({
                                                                                           boardSPI,
                                                                                           copilotSession
                                                                                       }) => {
    const sampleService = new AddEventStormingSampleService(boardSPI)
    const hotspotService = new FetchHotspotsService(boardSPI)
    const broadcaster = new Broadcaster(miroProxy)
    const [hotspots, setHotspots] = useState<Hotspot[]>([])
    const quizRepository: EventSessionQuizRepository | null = copilotSession ? new EventSessionQuizRepository(copilotSession.miroBoardId) : null
    const [quizAnswers, setQuizAnswers] = useState<QuizAnswer[]>([])
    const [hoveredScoreIndex, setHoveredScoreIndex] = useState<number>(-1)
    const [questions, setQuestions] = useState([] as TQuestion[])
    const [autoRefresh, setAutoRefresh] = useState(false); // 新增一个状态来控制是否启用自动刷新

    useEffect(() => {
        const quizService = new LoadEventSessionQuizService()
        quizService.loadEventSessionQuiz().then(setQuestions);
    }, []);

    useEffect(() => {
        let intervalId: NodeJS.Timeout;
        if (autoRefresh) { // 当autoRefresh为真时，设置定时器
            intervalId = setInterval(() => {
                hotspotService.fetchHotspots().then(setHotspots)
            }, 1000); // 设置为每5秒自动加载一次
        }

        return () => {
            if (intervalId) { // 在组件卸载时或autoRefresh变为假时，清除定时器
                clearInterval(intervalId);
            }
        };
    }, [boardSPI, autoRefresh]);

    useEffect(() => {
        hotspotService.fetchHotspots().then(setHotspots)
        const answerHandler = new EventSessionQuizAnswerHandler(quizRepository, setQuizAnswers)
        messageRegistry.registerHandler(EventSessionQuizAnswer.MESSAGE_TYPE, answerHandler)
        return () => {
            messageRegistry.unregisterHandler(EventSessionQuizAnswer.MESSAGE_TYPE, answerHandler)
        }
    }, [])

    useEffect(() => {
        if (quizRepository) {
            quizRepository.loadQuizAnswer().then(setQuizAnswers)
        }
    }, []);

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
            <li>Domain Event and Granularity
                <ul style={{listStyleType: 'disc', paddingLeft: '30px'}}>
                    <li>Past Tense</li>
                    <li>Specific Meaning</li>
                    <li>Independence</li>
                    <li>Value and Impact</li>
                </ul>
            </li>
            <b>Notions</b>
            <li>Domain Event Sticky Note</li>
            <li>Hotspot Shape</li>
            <b>Processes</b>
            <li>Resolve Hotspot</li>
            <li>Vote for Domain Event Acceptance</li>
        </div>
        <div className="flex flex-row w-full justify-center">
            <div className="px-2 py-2">
                <button className="btn btn-primary btn-primary-panel px-2" onClick={async () => {
                    await sampleService.addPNEventSample()
                }}>Add Positive/Negative Samples
                </button>
            </div>
        </div>
        <div className="flex flex-row w-full justify-center">
            <div className="px-2 py-2">
                <button className="btn btn-primary btn-primary-panel px-2" onClick={async () => {
                    await sampleService.addSample()
                }}>Add Normalized Sample
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
        <div className="flex justify-between items-center w-full px-1.5">
            <div className="sub-title sub-title-panel">Hotspot List</div>
            <div className="flex items-center">
                <label className="font-lato text-sm text-blue-800">Auto Refresh</label>
                <div className="mx-2 justify-center">
                    <Switch checked={autoRefresh} onChange={setAutoRefresh} height={20} width={40}
                            onColor="#00CC00"
                            offColor="#888888"/>
                </div>
            </div>
        </div>
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
                    <td className="text-cell text-cell-panel justify-center">
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
            {quizAnswers?.map((actualAnswer, index) => (
                <tr key={index} className={index % 2 === 0 ? 'w-full odd_row' : 'w-full even_row'}
                    onMouseEnter={(e) => handleMouseEnter(index, e)}
                    onMouseLeave={handleMouseLeave}
                >
                    <td className="text-cell text-cell-panel clickable-label">{actualAnswer.userName}</td>
                    <td className="number-cell number-cell-panel centered  clickable-label">
                        {actualAnswer.answers.filter(x => {
                                const actual = x.actualAnswer.map(y => y.split(')')[0].trim()).sort().join(",")
                                const expected = questions[x.questionNumber]?.correctAnswers.sort().join(",")
                                return actual === expected
                            }
                        ).length} / {questions.length}
                    </td>
                    <td className="">
                        <button className="btn btn-secondary btn-secondary-panel px-2 py-1"
                                onClick={async () => {
                                    await broadcaster.broadcast(
                                        new StartEventSessionConceptIntroductionQuiz(
                                            uuidv4(), actualAnswer.userId,
                                            copilotSession?.miroUserId,
                                            copilotSession?.miroUsername ?? "",
                                            copilotSession?.miroUserId,
                                            actualAnswer.answers.map(x => new Answer(x.questionNumber, x.actualAnswer, questions[x.questionNumber].correctAnswers))
                                        ))
                                    console.log(miroProxy.getApiCallsInLastMinute())
                                }}>Retry
                        </button>
                    </td>
                    {hoveredScoreIndex == index &&
                        <td>
                            <FloatingWindow quizAnswer={actualAnswer} questions={questions} style={{}}/>
                        </td>}
                </tr>
            ))}
            </tbody>
        </table>
    </div>;
    const Quiz: React.FC = () => <>
        <div>
            <div className="px-2 py-2 centered">
                <button className="btn btn-primary btn-primary-panel px-2" onClick={async () => {
                    await broadcaster.broadcast(
                        new StartEventSessionConceptIntroductionQuiz(
                            uuidv4(), null,
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
            <div className="sub-title sub-title-panel w-full justify-center">Answers By Participants</div>
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
        </div>
    )
}