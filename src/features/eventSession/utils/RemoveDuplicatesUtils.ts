import {WorkshopBoardSPI, WorkshopCard} from "../../../application/spi/WorkshopBoardSPI";
import {GroupByDuplicationDomainEventService, SimilarityGroup} from "../service/GroupByDuplicationDomainEventService";
import {CopilotSession} from "../../../application/CopilotSession";

export async function analyzeSimilarityByGPT(boardSPI: WorkshopBoardSPI, groupingService: GroupByDuplicationDomainEventService, copilotSession: CopilotSession,
                                             setSimilarityGroups: (value: SimilarityGroup[]) => void,
                                             setGroupedCards: (value: WorkshopCard[][]) => void
): Promise<WorkshopCard[][]> {
    return boardSPI.fetchEventCards()
        .then(cards => {
            return groupingService.perform(cards, copilotSession.gptConfiguration)
                .then(cardGroups => {
                    setSimilarityGroups(cardGroups)
                    return cardGroups.map(group => group.groupMembers)
                })
                .then(grouped => {
                    setGroupedCards(grouped)
                    return grouped
                })
                .catch(reason => {
                    console.log("deduplication Failed", reason)
                    return []
                })
        })
}