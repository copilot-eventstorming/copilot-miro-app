import {miroProxy, MiroProxy} from "./MiroProxy";
import {
    BoardInfo,
    BoardNode,
    Connector,
    OnlineUserInfo,
    Shape,
    ShapeProps,
    StickyNote,
    StickyNoteProps
} from "@mirohq/websdk-types";
import {
    EventSummary,
    OptimizeResult,
    WorkshopBoardAllCards,
    WorkshopBoardCoreCards,
    WorkshopBoardSPI,
    WorkshopCard
} from "../application/spi/WorkshopBoardSPI";

class WorkshopBoardService implements WorkshopBoardSPI {
    updateWorkshopCard(card: WorkshopCard): Promise<void> {
        return this.miroProxy.syncBoard(card)
    }

    findWorkshopCardById(id: string): Promise<WorkshopCard | null> {
        return this.miroProxy.findWorkshopCardById(id);
    }

    showFailure(failure: string): Promise<void> {
        return miro.board.notifications.showError(failure);
    }

    showNotification(message: string): Promise<void> {
        return miro.board.notifications.showInfo(message);
    }

    private miroProxy: MiroProxy;

    constructor(miroProxy: MiroProxy) {
        this.miroProxy = miroProxy;
    }

    domainEventPredicate = (card: WorkshopCard) => card.type === 'sticky_note' && card.style.fillColor === 'orange';
    commandPredicate = (card: WorkshopCard) => card.type === 'sticky_note' && card.style.fillColor === 'light_blue';
    externalPredicate = (card: WorkshopCard) => card.type === 'sticky_note' && card.style.fillColor === 'red';
    timerPredicate = (card: WorkshopCard) => card.type === 'sticky_note' && card.style.fillColor === 'pink';
    policyPredicate = (card: WorkshopCard) => card.type === 'sticky_note' && card.style.fillColor === 'violet';
    rolePredicate = (card: WorkshopCard) => card.type === 'sticky_note' && card.style.fillColor === 'light_yellow' && card.shape === 'square';
    aggregatePredicate = (card: WorkshopCard) => card.type === 'sticky_note' && card.style.fillColor === 'light_yellow' && card.shape === 'rectangle';
    hotspotPredicate = (card: WorkshopCard) => (card as Shape) && (card as Shape).shape === 'rhombus';

    async createStickyNote(stickyNote: StickyNoteProps): Promise<StickyNote> {
        return miroProxy.createStickyNote(stickyNote);
    }

    async createShapes(x: ShapeProps): Promise<Shape> {
        return this.miroProxy.createShape(x)
    }

    updateHotspot(card: Shape): Promise<void> {
        return this.miroProxy.syncBoard(card);
    }

    async fetchWorkshopCards(): Promise<WorkshopCard[]> {
        console.log("accessing miro websdk, fetchWorkshopCards");
        return await this.miroProxy.fetchBoardItems({type: ["sticky_note", 'shape']})
            .then(cards => cards.filter(isWorkshopItem).map(cast));
    }

    async fetchWorkshopUsers(): Promise<OnlineUserInfo[]> {
        console.log("accessing miro websdk, fetchWorkshopUsers");
        return await this.miroProxy.fetchOnlineUsers();
    }

    async maybeEventStormingSession(): Promise<boolean> {
        console.log("accessing miro websdk, maybeEventStormingSession");
        const cards: WorkshopCard[] = await this.fetchWorkshopCards();
        const aggregateCards = cards.filter(this.aggregatePredicate);
        const commandCards = cards.filter(this.commandPredicate);
        const domainCards = cards.filter(this.domainEventPredicate);

        if (aggregateCards.length > 0)
            return Promise.resolve(true);
        else if (commandCards.length > 0)
            return Promise.resolve(true);
        else if (domainCards.length > 0)
            return Promise.resolve(true);
        else
            return Promise.resolve(false);
    }

    async isBoardEmpty(): Promise<boolean> {
        console.log("accessing miro websdk, isBoardEmpty");
        const cards: WorkshopCard[] = await this.fetchWorkshopCards();
        return cards.length === 0;
    }


    async summaryBySessionMainTypes(): Promise<WorkshopBoardCoreCards> {
        const cards: WorkshopCard[] = await this.fetchWorkshopCards();
        const aggregateCards: WorkshopCard[] = cards.filter(this.aggregatePredicate);
        const commandCards: WorkshopCard[] = cards.filter(this.commandPredicate);
        const domainCards: WorkshopCard[] = cards.filter(this.domainEventPredicate);

        return {
            "BoundedContexts": [],
            "Subdomains": [],
            "Aggregates": aggregateCards,
            "Commands": commandCards,
            "Events": domainCards,
        };
    }


    async summaryEventSession(): Promise<EventSummary> {
        const cards: WorkshopCard[] = await this.fetchWorkshopCards();
        const users: OnlineUserInfo[] = await this.fetchWorkshopUsers();
        return {
            "eventCards": cards.filter(this.domainEventPredicate),
            "hotspotCards": cards.filter(this.hotspotPredicate),
            "otherCards": cards.filter(card => !this.domainEventPredicate(card) && !this.hotspotPredicate(card)),
            "users": users,
            "contributors": new Set(cards.map(card => card.createdBy))
        };
    }

    async fetchEventCards(): Promise<WorkshopCard[]> {
        const cards: WorkshopCard[] = await this.fetchWorkshopCards();
        return cards.filter(this.domainEventPredicate);
    }

    async fetchHotSpotCards(): Promise<WorkshopCard[]> {
        const cards: WorkshopCard[] = await this.fetchWorkshopCards();
        return cards.filter(this.hotspotPredicate);
    }

    async summaryBySessionDetailedTypes(): Promise<WorkshopBoardAllCards> {
        const cards: WorkshopCard[] = await this.fetchWorkshopCards();
        const aggregateCards = cards.filter(this.aggregatePredicate);
        const commandCards = cards.filter(this.commandPredicate);
        const domainCards = cards.filter(this.domainEventPredicate);
        const externalCards = cards.filter(this.externalPredicate);
        const timerCards = cards.filter(this.timerPredicate);
        const policyCards = cards.filter(this.policyPredicate);
        const roleCards = cards.filter(this.rolePredicate);
        const hotSpotCards = cards.filter(this.hotspotPredicate);

        return new WorkshopBoardAllCards(domainCards, commandCards, externalCards,
            timerCards, policyCards, roleCards, aggregateCards, hotSpotCards);
    }

    async fetchBoardInfo(): Promise<BoardInfo> {
        console.log("accessing miro websdk, fetchBoardInfo");
        return this.miroProxy.fetchBoardInfo()
            .then(infoV2 => {
                return {...infoV2};
            });
    }

    async fetchConnectors(): Promise<Connector[]> {
        console.log("accessing miro websdk, fetch connectors");
        return await this.miroProxy.fetchBoardItems({type: 'connector'})
            .then(items => items
                .filter(item => item.type === 'connector')
                .map(item => item as Connector));
    }

    async zoomToCard(cardId: string): Promise<void> {
        console.log("accessing miro websdk, zoomToCard");
        await this.miroProxy.zoomToCard(cardId);
    }

    async fetchCurrentLayout(): Promise<BoardNode[]> {
        console.log("accessing miro websdk, fetchCurrentLayout");
        return await this.miroProxy.fetchBoardItems({});
    }

    async moveCards(setConsoleOutput: Function, widgets: {
        id: string,
        x: number,
        y: number
    }[]): Promise<OptimizeResult> {
        try {
            return this.processBoardItems(this.movable, setConsoleOutput, widgets);
        } catch (e) {
            console.log('moveCards failed', e)
            return this.mkFailedOptimizeResult(widgets);
        }
    }

    async moveCards2(widgets: { id: string, x: number, y: number }[]): Promise<OptimizeResult> {
        try {
            return this.processBoardItems2(this.movable, widgets);
        } catch (e) {
            console.log('moveCards failed', e)
            return this.mkFailedOptimizeResult(widgets);
        }
    }

    async restoreBoardLayout(widgets: WorkshopCard[], setConsoleOutput: Function): Promise<OptimizeResult> {
        try {
            return this.processBoardItems(this.restoreNeeded, setConsoleOutput, widgets);
        } catch (e) {
            console.log('restoreBoardLayout failed', e)
            return this.mkFailedOptimizeResult(widgets);
        }
    }

    dropCard(card: WorkshopCard): Promise<void> {
        return miro.board.remove(card);
    }

    async clearBoard(): Promise<void> {
        const cards = await this.fetchWorkshopCards();
        cards.map(card => miro.board.remove(card));
    }

    private mkFailedOptimizeResult(widgets: { id: string, x: number, y: number }[]) {
        const failure = new OptimizeResult(widgets.map(card => {
            return {card, x: card.x, y: card.y};
        }));
        failure.setFailureCount(widgets.length);
        return Promise.resolve(failure);
    }

    private async processBoardItems2(processFn: Function,
                                     coordinates: { id: string, x: number, y: number }[]): Promise<OptimizeResult> {
        const allBoardItems: WorkshopCard[] = await this.fetchWorkshopCards();
        const boardItemsMap: Map<string, WorkshopCard> = new Map(allBoardItems.map(item => [item.id, item]));

        const works = coordinates
            .map(entry => {
                const {id, x, y} = entry;
                const card = boardItemsMap.get(id) as WorkshopCard;
                return {card, x, y};
            }).filter(({card, x, y}) => card && processFn(card, {x, y}));


        console.log("accessing miro websdk, movable " + works.length + " cards");

        const result = await Promise.allSettled(
            works.map(({card, ...props}) => {
                card.x = props.x;
                card.y = props.y;
                return this.miroProxy.syncBoard(card);
            }));

        const optimizeResult = this.mkLayoutOptimizeResult(works, result);
        console.log(`${optimizeResult.successCount} cards moved successfully, ${optimizeResult.failureCount} cards moved failed!`);
        return optimizeResult;
    }

    private async processBoardItems(processFn: Function, setConsoleOutput: Function,
                                    coordinates: { id: string, x: number, y: number }[]): Promise<OptimizeResult> {
        const allBoardItems: WorkshopCard[] = await this.fetchWorkshopCards();
        const boardItemsMap: Map<string, WorkshopCard> = new Map(allBoardItems.map(item => [item.id, item]));

        const works = coordinates
            .map(entry => {
                const {id, x, y} = entry;
                const card = boardItemsMap.get(id) as WorkshopCard;
                return {card, x, y};
            }).filter(({card, x, y}) => card && processFn(card, {x, y}));

        setConsoleOutput(`Optimizing Layout Started.
                 moving : ${works.length} cards...
            `);
        console.log("accessing miro websdk, movable " + works.length + " cards");

        const result = await Promise.allSettled(
            works.map(({card, ...props}) => {
                card.x = props.x;
                card.y = props.y;
                return this.miroProxy.syncBoard(card);
            }));

        const optimizeResult = this.mkLayoutOptimizeResult(works, result);
        console.log(`${optimizeResult.successCount} cards moved successfully, ${optimizeResult.failureCount} cards moved failed!`);
        return optimizeResult;
    }

    private mkLayoutOptimizeResult(works: {
        x: number;
        y: number;
        card: StickyNote | Shape
    }[], result: Array<PromiseSettledResult<Awaited<Promise<void>>>>) {
        const optimizeResult: OptimizeResult = new OptimizeResult(works);
        let successCount = 0;
        let failureCount = 0;

        result.forEach(item => {
            if (item.status === 'rejected') {
                failureCount++;
            } else {
                successCount++;
            }
        });
        optimizeResult.setFailureCount(failureCount);
        optimizeResult.setSuccessCount(successCount);
        return optimizeResult;
    }

    private movable(card: WorkshopCard, {x, y}: { x: number, y: number }): boolean {
        return card.x !== x || card.y !== y;
    }

    private restoreNeeded(card: WorkshopCard, {x, y, width}: { x: number, y: number, width: number }): boolean {
        return card.x !== x || card.y !== y || card.width !== width;
    }
}


function isWorkshopItem(item: BoardNode): item is WorkshopCard {
    return item.type === 'sticky_note' || item.type === 'shape';
}

function cast(item: BoardNode): WorkshopCard {
    return item as WorkshopCard;
}

export {WorkshopBoardService};