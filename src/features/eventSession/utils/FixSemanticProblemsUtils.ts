import {FixCandidate} from "../service/FixEventNotPastTenseByGPTService";
import {WorkshopCard} from "../../../application/spi/WorkshopBoardSPI";
import {Broadcaster} from "../../../application/messaging/Broadcaster";
import {CopilotSession} from "../../../application/CopilotSession";
import {FixSuggestion, FixSuggestionType} from "../../../component/types/FixSuggestion";
import {ProblemFixSuggestionsMessage} from "../../../component/broadcast/message/ProblemFixSuggestionsMessage";
import {v4 as uuidv4} from "uuid";

export async function notifyCardOwners<O>(gptData: O[],
                                          f: (o:O) => FixSuggestion,
                                          g: (o:O) => Promise<string>,
                                          broadcaster: Broadcaster,
                                          copilotSession: CopilotSession) {
    const notification = async () => {
        //group by owner id
        const fixesByOwner: Record<string, FixSuggestion[]> = {};
        for (const fixCandidate of gptData) {
            if (fixCandidate) {
                const ownerId: string = await g(fixCandidate);
                const fixSuggestion = f(fixCandidate);
                if (fixesByOwner[ownerId]) {
                    fixesByOwner[ownerId].push(fixSuggestion);
                } else {
                    fixesByOwner[ownerId] = [fixSuggestion];
                }
            }
        }
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
    await notification();

}

export const fixCandidateToFixSuggestion: (o: FixCandidate) => FixSuggestion = (o) => {
    return new FixSuggestion(
        o.eventCardId,
        [o.eventName],
        [o.fixCandidate],
        FixSuggestionType.SpecificMeaningIssue
    )
}