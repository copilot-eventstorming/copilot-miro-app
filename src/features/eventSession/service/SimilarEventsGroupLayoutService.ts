import {WorkshopBoardSPI} from "../../../application/spi/WorkshopBoardSPI";
import {SimilarityGroup} from "./GroupByDuplicationDomainEventService";
import {PrettifyLayoutService} from "../../../application/service";
import {contentEquals} from "../../../utils/WorkshopCardUtils";
import {convertToNodeObject} from "../../../application/service/utils/utils";
import {NestedGroupNode} from "../../../domain/graph";

export class SimilarEventsGroupLayoutService {
    private boardSPI: WorkshopBoardSPI;
    private layoutService: PrettifyLayoutService;

    constructor(boardSPI: WorkshopBoardSPI) {
        this.boardSPI = boardSPI;
        this.layoutService = new PrettifyLayoutService(boardSPI);
    }

    async perform(groups: SimilarityGroup[]): Promise<void> {
        const groupSequence = groups
            .filter(group => group.groupMembers.find(card => contentEquals(card.content, group.groupName)))
            .map(group => {
                    const centralCard = group.groupMembers.find(card => contentEquals(card.content, group.groupName))
                    const satelliteCards = group.groupMembers.filter(card => card.id !== centralCard?.id)
                    const f = convertToNodeObject('event', 1, false)
                    const centralNode = f(centralCard!)
                    const satelliteNodes = satelliteCards.map(f)
                    return new NestedGroupNode(centralNode, satelliteNodes, 1)
                }
            )

        this.layoutService.perform([groupSequence], 0.1, 0, 2, 0)
            .then(() => console.log('layout done'))
            .catch((e) => console.log('layout error', e))
    }
}