import {WorkshopBoardSPI} from "../../../gateway/WorkshopBoardSPI";
import {PrettifyLayoutService} from "../../../service/graph/PrettifyLayoutService";
import {convertToNodeObject} from "../../../service/utils";

export class AggregateSessionPrettifyLayoutService {
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
        const aggregateCards = allCards.Aggregates.map(convertToNodeObject('aggregate', 0));
        const eventCards = allCards.Events.map(convertToNodeObject('event', 1));
        const commandCards = allCards.Commands.map(convertToNodeObject('command', 2));
        const externalCards = allCards.Externals.map(convertToNodeObject('external_system', 2));
        const timerCards = allCards.Timers.map(convertToNodeObject('timer', 2));
        const policyCards = allCards.Policies.map(convertToNodeObject('timer', 2, true));
        const roleCards = allCards.Roles.map(convertToNodeObject('role', 3));
        const hotspotCards = allCards.Hotspots.map(convertToNodeObject('hotspot', 2, true));

        const groupedCards = [aggregateCards, eventCards,
            commandCards.concat(externalCards).concat(timerCards).concat(policyCards).concat(hotspotCards), roleCards];
        return this.service.perform(groupedCards, widthPadding, heightPadding, hOverlapThreshold, vOverlapThreshold);
    }
}