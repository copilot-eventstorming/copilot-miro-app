import React, {useEffect} from "react";
import {WorkshopBoardSPI, WorkshopCard} from "../application/spi/WorkshopBoardSPI";
import {CopilotSession} from "../application/CopilotSession";
import {BaseGPTService, FixCandidate, ResponseData} from "../application/service/gpt/BaseGPTService";
import {FixSuggestion, FixSuggestionType} from "./types/FixSuggestion";
import {miroProxy} from "../api/MiroProxy";
import {Broadcaster} from "../application/messaging/Broadcaster";
import {UpdateFixSuggestionHandler} from "./broadcast/handler/UpdateFixSuggestionHandler";
import {messageRegistry} from "../utils/MessagingBroadcastingInitializer";
import {ProblemFixSuggestionApplied} from "./broadcast/message/ProblemFixSuggestionApplied";
import {ClosePanelRequest} from "./broadcast/message/ClosePanelRequest";
import {GPTAnalysisBase} from "./GPTComponent";
import {notifyCardOwners} from "../features/eventSession/utils/FixSemanticProblemsUtils";
import {prettifyContent} from "../application/service/utils/utils";
import {v4 as uuidv4} from 'uuid';

interface FixSemanticProblematicCardsProps {
    boardSPI: WorkshopBoardSPI;
    cards: WorkshopCard[];
    setCards: (cards: WorkshopCard[]) => void;
    copilotSession: CopilotSession;
    actionName: string;
    gptService: BaseGPTService<WorkshopCard[], ResponseData, FixCandidate[]>;
    semanticType: FixSuggestionType;
}


export const FixSemanticProblematicCards: React.FC<FixSemanticProblematicCardsProps> = ({
                                                                                            boardSPI,
                                                                                            copilotSession,
                                                                                            cards,
                                                                                            setCards,
                                                                                            actionName,
                                                                                            semanticType,
                                                                                            gptService
                                                                                        }) => {

    const [gptData, setGptData] = React.useState<FixCandidate[]>([])
    const [fixes, setFixes] = React.useState<FixSuggestion[]>([])
    const fixesRef = React.useRef(fixes);
    fixesRef.current = fixes;
    useEffect(() => {
        if (gptData) {
            setFixes(gptData.map((fixCandidate) => {
                return new FixSuggestion(
                    fixCandidate.eventCardId,
                    [fixCandidate.eventName],
                    [fixCandidate.fixCandidate],
                    FixSuggestionType.PastTensIssue
                )
            }))
        } else {
            setFixes([])
        }
    }, [gptData]);

    const broadcaster = new Broadcaster(miroProxy)

    const suggestionAppliedHandler = new UpdateFixSuggestionHandler(() => fixesRef.current, setFixes)
    useEffect(() => {
        messageRegistry.registerHandler(ProblemFixSuggestionApplied.MESSAGE_TYPE, suggestionAppliedHandler)
        return () => {
            messageRegistry.unregisterHandler(ProblemFixSuggestionApplied.MESSAGE_TYPE, suggestionAppliedHandler)
            broadcaster.broadcast(new ClosePanelRequest(
                uuidv4(),
                null,
                copilotSession.miroUserId,
                copilotSession.miroUsername,
                copilotSession.miroUserId
            ))
        }
    }, []);

    return (<div className="w-full my-2 mb-4">

            <GPTAnalysisBase
                boardSPI={boardSPI}
                copilotSession={copilotSession}
                cards={cards}
                setGptData={setGptData}
                setCards={setCards}
                gptService={gptService}
                actionName={actionName}/>

            <div className="w-full text-center">
                <button className="btn btn-primary btn-primary-panel px-2"
                        disabled={gptData.length === 0}
                        onClick={notifyCardOwners(gptData, cards, broadcaster, copilotSession, semanticType)}> Notify
                    Card Owners
                </button>
                <table className="w-full">
                    <thead>
                    <tr>
                        <th className='header header-panel'>Event Name</th>
                        <th className='header header-panel'>Solution</th>
                        <th className='header header-panel'>Action</th>
                    </tr>
                    </thead>
                    <tbody>
                    {fixes.map((data, index) => (
                        <tr key={index} className={index % 2 === 0 ? 'odd_row' : 'even_row'}>
                            <td className="text-cell text-cell-panel px-1 clickable-label"
                                onClick={() => {
                                    boardSPI.zoomToCard(data.id)
                                }}>{data.text[0]}</td>
                            <td className="text-cell text-cell-panel px-1">{data.suggestion[0]}</td>
                            <td className="text-cell text-cell-panel px-1">
                                <button className="btn btn-secondary btn-secondary-panel" onClick={() => {
                                    const targetCard = cards.find((card) => card.id === data.id)
                                    if (targetCard) {
                                        prettifyContent(targetCard, data.suggestion[0])
                                        boardSPI.updateWorkshopCard(targetCard)
                                    }
                                }}>Fix
                                </button>
                            </td>
                        </tr>
                    ))}

                    </tbody>
                </table>
            </div>
        </div>
    )
}