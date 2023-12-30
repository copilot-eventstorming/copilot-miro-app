import {WorkshopBoardSPI} from "../../../gateway/WorkshopBoardSPI";
import {convertToNodeObject} from "../../../service/utils";
import {
    AffiliationDistinctionExplorationService
} from "../../../service/graph/AffiliationDistinctionExplorationService";
import {ClusterAnalysisResult} from "../../../../infrastructure/view/eventSession/component/ExploreAnalysisResultTable";

export class HotspotAffiliationDistinctionAnalysisService {
    private actualService: AffiliationDistinctionExplorationService;
    private boardSPI: WorkshopBoardSPI;

    constructor(boardSPI: WorkshopBoardSPI) {
        this.boardSPI = boardSPI;
        this.actualService = new AffiliationDistinctionExplorationService();
    }

    async perform(): Promise<ClusterAnalysisResult[]> {
        const events = (await this.boardSPI.fetchEventCards()).map(convertToNodeObject('event', 1));
        const hotspots = (await this.boardSPI.fetchHotSpotCards()).map(convertToNodeObject('hotspot', 1));
        return this.actualService.perform(hotspots, events)
    }
}