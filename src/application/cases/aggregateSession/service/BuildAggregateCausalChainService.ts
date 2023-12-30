import {WorkshopBoardSPI} from "../../../gateway/WorkshopBoardSPI";
import {BuildCausalChainService, CauseChainResult} from "../../../service/graph/BuildCausalChainService";
import {convertToNodeObject} from "../../../service/utils";

export class BuildAggregateCausalChainService {
    private readonly boardSPI: WorkshopBoardSPI;
    private actualService: BuildCausalChainService;

    constructor(boardSPI: WorkshopBoardSPI) {
        this.boardSPI = boardSPI;
        this.actualService = new BuildCausalChainService(this.boardSPI);

    }

    async perform(): Promise<CauseChainResult> {
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

        return this.actualService.perform(groupedCards)
    }
}