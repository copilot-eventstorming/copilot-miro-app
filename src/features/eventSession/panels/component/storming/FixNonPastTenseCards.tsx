import React, {useEffect} from "react";
import {GPTAnalysisBase} from "../../../../../component/GPTComponent";
import {WorkshopBoardSPI, WorkshopCard} from "../../../../../application/spi/WorkshopBoardSPI";
import {CopilotSession} from "../../../../../application/CopilotSession";
import {FixCandidate, FixEventNotPastTenseByGPTService} from "../../../service/FixEventNotPastTenseByGPTService";
import {prettifyContent} from "../../../../../application/service/utils/utils";
import {FixSuggestion, FixSuggestionType} from "../../../../../component/types/FixSuggestion";
import {miroProxy} from "../../../../../api/MiroProxy";
import {ProblemFixSuggestionsMessage} from "../../../../../component/broadcast/message/ProblemFixSuggestionsMessage";
import {Broadcaster} from "../../../../../application/messaging/Broadcaster";
import {v4 as uuidv4} from 'uuid';
import {messageRegistry} from "../../../../../utils/MessagingBroadcastingInitializer";
import {ProblemFixSuggestionApplied} from "../../../../../component/broadcast/message/ProblemFixSuggestionApplied";
import {IMessageHandler} from "../../../../../application/messaging/IMessageHandler";
import {ClosePanelRequest} from "../../../../../component/broadcast/message/ClosePanelRequest";

interface FixNonPastTenseCardsProps {
    boardSPI: WorkshopBoardSPI;
    cards: WorkshopCard[];
    setCards: (cards: WorkshopCard[]) => void;
    copilotSession: CopilotSession;
}

class UpdateFixSuggestionHandler implements IMessageHandler<ProblemFixSuggestionApplied> {
    private readonly fixSuggestions: FixSuggestion[];
    private readonly setFixSuggestions: (gptData: FixSuggestion[]) => void;

    constructor(fixSuggestions: FixSuggestion[], setFixSuggestions: (gptData: FixSuggestion[]) => void) {
        this.fixSuggestions = fixSuggestions;
        this.setFixSuggestions = setFixSuggestions;
    }

    handleMessage(message: ProblemFixSuggestionApplied): Promise<void> {
        const unfixed = this.fixSuggestions.filter((fixCandidate) => fixCandidate.id !== message.fixSuggestion.id)
        if (unfixed) {
            this.setFixSuggestions([...unfixed])
        }
    }

    release() {
    }
}

function notifyCardOwners(gptData: FixCandidate[], cards: WorkshopCard[], broadcaster: Broadcaster, copilotSession: CopilotSession) {
    return () => {
        //group by owner id
        const fixesByOwner = gptData.reduce<Record<string, FixSuggestion[]>>((acc, fixCandidate) => {
            if (fixCandidate) {

                const cardId = fixCandidate.eventCardId
                const ownerId: string = cards.find((card) => card.id === cardId)?.createdBy || ""
                const fixSuggestion = new FixSuggestion(
                    fixCandidate.eventCardId,
                    [fixCandidate.eventName],
                    [fixCandidate.fixCandidate],
                    FixSuggestionType.PastTensIssue
                )
                if (acc[ownerId]) {
                    acc[ownerId].push(fixSuggestion)
                } else {
                    acc[ownerId] = [fixSuggestion]
                }
            }
            return acc
        }, {})
        Object.entries(fixesByOwner).forEach(([ownerId, fixes]) => {
            console.log("ownerId", ownerId, "fixes", fixes)
            broadcaster.broadcast(new ProblemFixSuggestionsMessage(
                uuidv4(),
                ownerId,
                copilotSession.miroUserId,
                copilotSession.miroUsername,
                copilotSession.miroUserId,
                "Event Name",
                fixes));
        });
    };
}

export const FixNonPastTenseCards: React.FC<FixNonPastTenseCardsProps> = ({
                                                                              boardSPI, copilotSession, cards, setCards
                                                                          }) => {

    const gptService = new FixEventNotPastTenseByGPTService()
    const [gptData, setGptData] = React.useState<FixCandidate[]>([])
    const [fixes, setFixes] = React.useState<FixSuggestion[]>([])

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

    const suggestionAppliedHandler = new UpdateFixSuggestionHandler(fixes, setFixes)
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
                actionName="Analyze Violation"/>

            <div className="w-full text-center">
                <button className="btn btn-primary btn-primary-panel px-2"
                        disabled={gptData.length === 0}
                        onClick={notifyCardOwners(gptData, cards, broadcaster, copilotSession)}> Notify Card Owners
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
                                    const targetCard = cards.find((card) => card.id === data.eventCardId)
                                    if (targetCard) {
                                        prettifyContent(targetCard, data.fixCandidate)
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