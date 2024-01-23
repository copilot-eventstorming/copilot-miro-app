import {WorkshopBoardSPI, WorkshopCard} from "../../../application/spi/WorkshopBoardSPI";
import {
    ClusterSimilarDomainEventByGPTService,
    SimilarityGroup
} from "../service/ClusterSimilarDomainEventByGPTService";
import {CopilotSession} from "../../../application/CopilotSession";
import {TGPTOptions} from "../../../application/service/gpt/BaseGPTService";


export async function analyzeSimilarityByGPT(boardSPI: WorkshopBoardSPI,
                                             groupingService: ClusterSimilarDomainEventByGPTService,
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