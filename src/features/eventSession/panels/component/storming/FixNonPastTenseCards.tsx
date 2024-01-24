import {FixSemanticProblematicCards} from "../../../../../component/FixSemanticProblematicCards";
import {FixSuggestion, FixSuggestionType} from "../../../../../component/types/FixSuggestion";
import {WorkshopBoardSPI, WorkshopCard} from "../../../../../application/spi/WorkshopBoardSPI";
import {CopilotSession} from "../../../../../application/CopilotSession";
import React from "react";
import {FixEventNotPastTenseByGPTService, ResponseData} from "../../../service/FixEventNotPastTenseByGPTService";
import {FixCandidate} from "../../../../../application/service/gpt/BaseGPTService";
import {fixCandidateToFixSuggestion} from "../../../utils/FixSemanticProblemsUtils";

interface FixNonPastTenseCardProps {
    boardSPI: WorkshopBoardSPI;
    cards: WorkshopCard[];
    setCards: (cards: WorkshopCard[]) => void;
    copilotSession: CopilotSession;
}

export const FixNonPastTenseCards: React.FC<FixNonPastTenseCardProps> = ({
                                                                             boardSPI,
                                                                             copilotSession,
                                                                             cards,
                                                                             setCards
                                                                         }) => {

    const g: (o: FixCandidate) => Promise<string> = async (o) => {
        return await boardSPI.fetchEventCards().then(cards => {
            const card = cards.find(c => c.id === o.eventCardId)
            if (card) {
                return card.createdBy
            } else {
                return ""
            }
        })
    }
    const gptService = new FixEventNotPastTenseByGPTService()
    return (
        <FixSemanticProblematicCards<ResponseData, FixCandidate>
            actionName="Analyze Tense Issues"
            gptService={gptService}
            f={fixCandidateToFixSuggestion}
            g={g}
            cards={cards} setCards={setCards} copilotSession={copilotSession} boardSPI={boardSPI}
        />
    )
}