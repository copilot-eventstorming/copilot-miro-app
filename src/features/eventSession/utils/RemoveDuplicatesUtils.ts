import {WorkshopBoardSPI, WorkshopCard} from "../../../application/spi/WorkshopBoardSPI";
import {
    GroupByDuplicationDomainEventService,
    SimilarityGroup,
    TGPTOptions
} from "../service/GroupByDuplicationDomainEventService";
import {CopilotSession} from "../../../application/CopilotSession";


export async function analyzeSimilarityByGPT(boardSPI: WorkshopBoardSPI,
                                             groupingService: GroupByDuplicationDomainEventService,
                                             copilotSession: CopilotSession,
                                             setSimilarityGroups: (value: SimilarityGroup[]) => void,
                                             setGroupedCards: (value: WorkshopCard[][]) => void,
                                             gptOptions: TGPTOptions
): Promise<WorkshopCard[][]> {
    return boardSPI.fetchEventCards()
        .then(cards => {
            return groupingService.perform(cards, copilotSession.gptConfiguration, gptOptions)
                .then(cardGroups => {
                    setSimilarityGroups(cardGroups)
                    return cardGroups.map(group => group.groupMembers)
                })
                .then(grouped => grouped.filter(group => group.length > 1))
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