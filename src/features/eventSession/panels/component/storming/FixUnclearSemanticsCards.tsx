import {FixSemanticProblematicCards} from "../../../../../component/FixSemanticProblematicCards";
import {FixSuggestionType} from "../../../../../component/types/FixSuggestion";
import {WorkshopBoardSPI, WorkshopCard} from "../../../../../application/spi/WorkshopBoardSPI";
import {CopilotSession} from "../../../../../application/CopilotSession";
import {FixUnspecificMeaningEventByGPTService} from "../../../service/FixUnclearEventByGPTService";
import React from "react";

interface FixUnclearSemanticsCardProps {
    boardSPI: WorkshopBoardSPI;
    cards: WorkshopCard[];
    setCards: (cards: WorkshopCard[]) => void;
    copilotSession: CopilotSession;
}

export const FixUnclearSemanticsCards: React.FC<FixUnclearSemanticsCardProps> = ({
                                                                                     boardSPI,
                                                                                     copilotSession,
                                                                                     cards,
                                                                                     setCards
                                                                                 }) => {
    const gptService = new FixUnspecificMeaningEventByGPTService()
    return (
        <FixSemanticProblematicCards
            actionName="Analyze Unspecific Meaning Issues"
            semanticType={FixSuggestionType.SpecificMeaningIssue}
            gptService={gptService}
            cards={cards} setCards={setCards} copilotSession={copilotSession} boardSPI={boardSPI}
        />
    )
}