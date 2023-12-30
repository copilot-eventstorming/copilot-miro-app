import {
    AffiliationDistinctionProblemDiagnoseService, ProblematicCard
} from "../../../service/graph/AffiliationDistinctionProblemDiagnoseService";
import {convertToNodeObject} from "../../../service/utils";
import {WorkshopBoardSPI} from "../../../gateway/WorkshopBoardSPI";
import {NestedGroupNode} from "../../../../domain/graph/entity/NestedGroupNode";

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