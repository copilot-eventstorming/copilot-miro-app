import {FixCandidate} from "../service/FixEventNotPastTenseByGPTService";
import {WorkshopCard} from "../../../application/spi/WorkshopBoardSPI";
import {Broadcaster} from "../../../application/messaging/Broadcaster";
import {CopilotSession} from "../../../application/CopilotSession";
import {FixSuggestion, FixSuggestionType} from "../../../component/types/FixSuggestion";
import {ProblemFixSuggestionsMessage} from "../../../component/broadcast/message/ProblemFixSuggestionsMessage";
import {v4 as uuidv4} from "uuid";

export function notifyCardOwners(gptData: FixCandidate[], cards: WorkshopCard[], broadcaster: Broadcaster, copilotSession: CopilotSession, fixSuggestionType: FixSuggestionType) {
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
                    fixSuggestionType
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
