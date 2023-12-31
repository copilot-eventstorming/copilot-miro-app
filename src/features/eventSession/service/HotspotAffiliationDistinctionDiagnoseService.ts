import {
    AffiliationDistinctionProblemDiagnoseService,
    ProblematicCard
} from "../../../application/service/graph/AffiliationDistinctionProblemDiagnoseService";
import {convertToNodeObject} from "../../../application/service/utils/utils";
import {WorkshopBoardSPI} from "../../../application/spi/WorkshopBoardSPI";
import {NestedGroupNode} from "../../../domain/graph";

export class HotspotAffiliationDistinctionDiagnoseService {
    private actualService: AffiliationDistinctionProblemDiagnoseService;
    private boardSPI: WorkshopBoardSPI;

    constructor(boardSPI: WorkshopBoardSPI) {
        this.boardSPI = boardSPI;
        this.actualService = new AffiliationDistinctionProblemDiagnoseService()
    }

    async perform(ambiguousDistanceThreshold: number): Promise<[ProblematicCard[], ProblematicCard[]]> {
        const events: NestedGroupNode[] = (await this.boardSPI.fetchEventCards()).map(convertToNodeObject('event', 1));
        const hotspots: NestedGroupNode[] = (await this.boardSPI.fetchHotSpotCards()).map(convertToNodeObject('hotspot', 1));
        return this.actualService.perform(ambiguousDistanceThreshold, hotspots, events);
    }
}