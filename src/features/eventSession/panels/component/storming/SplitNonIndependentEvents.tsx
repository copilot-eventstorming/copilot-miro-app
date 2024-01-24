import {FixSemanticProblematicCards} from "../../../../../component/FixSemanticProblematicCards";
import {FixSuggestion, FixSuggestionType} from "../../../../../component/types/FixSuggestion";
import {WorkshopBoardSPI, WorkshopCard} from "../../../../../application/spi/WorkshopBoardSPI";
import {CopilotSession} from "../../../../../application/CopilotSession";
import React from "react";
import {
    FixEventNotIndependentByGPTService,
    IndependenceFixCandidate,
    ResponseData
} from "../../../service/FixEventNotIndependentByGPTService";

interface SplitNonIndependentEventProps {
    boardSPI: WorkshopBoardSPI;
    cards: WorkshopCard[];
    setCards: (cards: WorkshopCard[]) => void;
    copilotSession: CopilotSession;
}

export const SplitNonIndependentEvents: React.FC<SplitNonIndependentEventProps> = ({
                                                                                       boardSPI,
                                                                                       copilotSession,
                                                                                       cards,
                                                                                       setCards
                                                                                   }) => {
    const gptService = new FixEventNotIndependentByGPTService()
    const f: (o: IndependenceFixCandidate) => FixSuggestion = (o) => {
        return new FixSuggestion(
            o.eventCardId,
            [o.eventName],
            o.fixCandidate,
            FixSuggestionType.IndependenceIssue
        )
    }
    const g: (o: IndependenceFixCandidate) => Promise<string> = async (o) => {
        return await boardSPI.fetchEventCards().then(cards => {
            const card = cards.find(c => c.id === o.eventCardId)
            if (card) {
                return card.createdBy
            } else {
                return ""
            }
        })
    }
    return (
        <FixSemanticProblematicCards<ResponseData, IndependenceFixCandidate>
            actionName="Analyze Independency Issues"
            gptService={gptService}
            f={f}
            g={g}
            cards={cards}
            setCards={setCards}
            copilotSession={copilotSession}
            boardSPI={boardSPI}
        />
    )
}