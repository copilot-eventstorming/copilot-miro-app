import {FixSemanticProblematicCards} from "../../../../../component/FixSemanticProblematicCards";
import {WorkshopBoardSPI, WorkshopCard} from "../../../../../application/spi/WorkshopBoardSPI";
import {CopilotSession} from "../../../../../application/CopilotSession";
import {FixUnspecificMeaningEventByGPTService} from "../../../service/FixUnclearEventByGPTService";
import React from "react";
import {FixCandidate} from "../../../../../application/service/gpt/BaseGPTService";
import {ResponseData} from "../../../service/FixEventNotPastTenseByGPTService";
import {fixCandidateToFixSuggestion} from "../../../utils/FixSemanticProblemsUtils";

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
    return (
        <FixSemanticProblematicCards<ResponseData, FixCandidate>
            actionName="Analyze Unspecific Meaning Issues"
            f={fixCandidateToFixSuggestion}
            g={g}
            gptService={gptService}
            cards={cards} setCards={setCards} copilotSession={copilotSession} boardSPI={boardSPI}
        />
    )
}