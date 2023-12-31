import {BoardInfo, BoardNode, Connector, OnlineUserInfo, Shape, StickyNote} from "@mirohq/websdk-types";

export interface WorkshopBoardSPI {
    domainEventPredicate: (card: WorkshopCard) => boolean;
    commandPredicate: (card: WorkshopCard) => boolean;
    externalPredicate: (card: WorkshopCard) => boolean;
    timerPredicate: (card: WorkshopCard) => boolean;
    policyPredicate: (card: WorkshopCard) => boolean;
    rolePredicate: (card: WorkshopCard) => boolean;
    aggregatePredicate: (card: WorkshopCard) => boolean;
    hotspotPredicate: (card: WorkshopCard) => boolean;

    fetchWorkshopCards(): Promise<WorkshopCard[]>;

    fetchWorkshopUsers(): Promise<OnlineUserInfo[]>;

    maybeEventStormingSession(): Promise<boolean>;

    isBoardEmpty(): Promise<boolean>;

    summaryBySessionMainTypes(): Promise<WorkshopBoardCoreCards>;

    summaryEventSession(): Promise<EventSummary>;

    fetchEventCards(): Promise<WorkshopCard[]>;

    fetchHotSpotCards(): Promise<WorkshopCard[]>;

    summaryBySessionDetailedTypes(): Promise<WorkshopBoardAllCards>;

    fetchBoardInfo(): Promise<BoardInfo>;

    fetchConnectors(): Promise<Connector[]>;

    zoomToCard(cardId: string): Promise<void>;

    fetchCurrentLayout(): Promise<BoardNode[]>;

    moveCards(setConsoleOutput: Function, widgets: { id: string, x: number, y: number }[]): Promise<OptimizeResult>;

    moveCards2(widgets: { id: string, x: number, y: number }[]): Promise<OptimizeResult>;

    restoreBoardLayout(widgets: WorkshopCard[], setConsoleOutput: Function): Promise<OptimizeResult>;
}


export class EventSummary {
    eventCards: WorkshopCard[];
    hotspotCards: WorkshopCard[];
    otherCards: WorkshopCard[];
    users: OnlineUserInfo[];
    contributors: Set<string>;

    constructor(eventCards: WorkshopCard[], hotspotCards: WorkshopCard[], otherCards: WorkshopCard[], users: OnlineUserInfo[], contributors: Set<string>) {
        this.eventCards = eventCards;
        this.hotspotCards = hotspotCards;
        this.otherCards = otherCards;
        this.users = users;
        this.contributors = contributors;
    }
}

export class WorkshopBoardCoreCards {
    BoundedContexts: WorkshopCard[];
    Subdomains: WorkshopCard[];
    Aggregates: WorkshopCard[];
    Commands: WorkshopCard[];
    Events: WorkshopCard[];

    constructor(aggregateCards: WorkshopCard[], commandCards: WorkshopCard[], domainCards: WorkshopCard[]) {
        this.BoundedContexts = [];
        this.Subdomains = [];
        this.Aggregates = aggregateCards;
        this.Commands = commandCards;
        this.Events = domainCards;
    }
}

export const emptyBoardCoreCards = new WorkshopBoardCoreCards([], [], []);

export class WorkshopBoardAllCards {
    Events: WorkshopCard[];
    Commands: WorkshopCard[];
    Externals: WorkshopCard[];
    Timers: WorkshopCard[];
    Policies: WorkshopCard[];
    Roles: WorkshopCard[];
    Aggregates: WorkshopCard[];
    Subdomains: WorkshopCard[];
    BoundedContexts: WorkshopCard[];
    Hotspots: WorkshopCard[];

    constructor(domainCards: WorkshopCard[], commandCards: WorkshopCard[], externalCards: WorkshopCard[], timerCards: WorkshopCard[],
                policyCards: WorkshopCard[], roleCards: WorkshopCard[], aggregateCards: WorkshopCard[], hotSpotCards: WorkshopCard[]) {
        this.Events = domainCards;
        this.Commands = commandCards;
        this.Externals = externalCards;
        this.Timers = timerCards;
        this.Policies = policyCards;
        this.Roles = roleCards;
        this.Aggregates = aggregateCards;
        this.Subdomains = [];
        this.BoundedContexts = [];
        this.Hotspots = hotSpotCards;
    }
}


export class OptimizeResult {
    targetCardsNum: number;
    targetTotalDistance: number[];
    successCount: number = 0;
    failureCount: number = 0;

    constructor(works: { card: { id: string, x: number, y: number }, x: number, y: number }[]) {
        this.targetCardsNum = works.length;
        this.targetTotalDistance = works.map(({
                                                  card,
                                                  x,
                                                  y
                                              }) => Math.sqrt(Math.pow(card.x - x, 2) + Math.pow(card.y - y, 2)));
    }

    setSuccessCount(successCount: number) {
        this.successCount = successCount;
    }

    setFailureCount(failureCount: number) {
        this.failureCount = failureCount;
    }
}

export type WorkshopCard = StickyNote | Shape

