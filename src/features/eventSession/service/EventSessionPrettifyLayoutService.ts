import {WorkshopBoardSPI} from "../../../application/spi/WorkshopBoardSPI";
import {PrettifyLayoutService} from "../../../application/service/graph/PrettifyLayoutService";
import {convertToNodeObject} from "../../../application/service/utils/utils";

export class EventSessionPrettifyLayoutService {
    private boardSPI: WorkshopBoardSPI;
    private service: PrettifyLayoutService;

    constructor(boardSPI: WorkshopBoardSPI) {
        this.boardSPI = boardSPI;
        this.service = new PrettifyLayoutService(boardSPI)
    }

    async perform(widthPadding: number,
                  heightPadding: number,
                  hOverlapThreshold: number,
                  vOverlapThreshold: number) {

        const allCards = await this.boardSPI.summaryBySessionDetailedTypes();
        const eventCards = allCards.Events.map(convertToNodeObject('event', 1));
        const hotspotCards = allCards.Hotspots.map(convertToNodeObject('hotspot', 2));
        return this.service.perform([eventCards, hotspotCards], widthPadding, heightPadding, hOverlapThreshold, vOverlapThreshold);
    }
}