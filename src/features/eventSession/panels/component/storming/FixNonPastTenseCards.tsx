import {FixSemanticProblematicCards} from "../../../../../component/FixSemanticProblematicCards";
import {FixSuggestionType} from "../../../../../component/types/FixSuggestion";
import {WorkshopBoardSPI, WorkshopCard} from "../../../../../application/spi/WorkshopBoardSPI";
import {CopilotSession} from "../../../../../application/CopilotSession";
import React from "react";
import {FixEventNotPastTenseByGPTService} from "../../../service/FixEventNotPastTenseByGPTService";

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
    const gptService = new FixEventNotPastTenseByGPTService()
    return (
        <FixSemanticProblematicCards
            actionName="Analyze Tense Issues"
            semanticType={FixSuggestionType.PastTensIssue}
            gptService={gptService}
            cards={cards} setCards={setCards} copilotSession={copilotSession} boardSPI={boardSPI}
        />
    )
}