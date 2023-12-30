import {EventSummary, WorkshopBoardSPI, WorkshopCard} from "../../../gateway/WorkshopBoardSPI";


export interface EventSummaryNumbers {
    eventCards: number;
    eventUniqueCards: number;
    eventBlankCards: number;
    eventIn10min: number;
    eventIn10minUnique: number;
    eventIn10minBlank: number;
    eventIn5min: number;
    eventIn5minUnique: number;
    eventIn5minBlank: number;
    eventIn1min: number;
    eventIn1minUnique: number;
    eventIn1minBlank: number;
    hotspotCards: number;
    hotspotUniqueCards: number;
    hotspotBlankCards: number;
    hotspotIn10m: number;
    hotspotIn10mUniques: number;
    hotspotIn10mBlank: number;
    hotspotIn5m: number;
    hotspotIn5mUniques: number;
    hotspotIn5mBlank: number;
    hotspotIn1m: number;
    hotspotIn1mUniques: number;
    hotspotIn1mBlank: number;
    otherCards: number;
    contributors: number;
    users: number;
}

function withinXMinutes(timeString: string, minutes: number): boolean {
    return new Date(timeString).getTime() > Date.now() - minutes * 60 * 1000;
}

function countCards(cards: WorkshopCard[]): number {
    return cards.length;
}

function countUniqueCards(cards: WorkshopCard[]): number {
    return new Set(cards.map(card => card.content).filter(content => content.length > 0)).size;
}

function countBlankCards(cards: WorkshopCard[]): number {
    return cards.map(card => card.content).filter(content => content.length <= 0).length;
}

function filterCardsInMinutes(cards: WorkshopCard[], minutes: number): WorkshopCard[] {
    return cards.filter(card => withinXMinutes(card.createdAt, minutes) || withinXMinutes(card.modifiedAt, minutes));
}

function mapToEventSummary(eventSummaryRaw: EventSummary): EventSummaryNumbers {
    const eventCardsIn10min = filterCardsInMinutes(eventSummaryRaw.eventCards, 10);
    const eventCardsIn5min = filterCardsInMinutes(eventSummaryRaw.eventCards, 5);
    const eventCardsIn1min = filterCardsInMinutes(eventSummaryRaw.eventCards, 1);
    const hotspotCardsIn10m = filterCardsInMinutes(eventSummaryRaw.hotspotCards, 10);
    const hotspotCardsIn5m = filterCardsInMinutes(eventSummaryRaw.hotspotCards, 5);
    const hotspotCardsIn1m = filterCardsInMinutes(eventSummaryRaw.hotspotCards, 1);

    return {
        eventCards: countCards(eventSummaryRaw.eventCards),
        eventUniqueCards: countUniqueCards(eventSummaryRaw.eventCards),
        eventBlankCards: countBlankCards(eventSummaryRaw.eventCards),
        eventIn10min: countCards(eventCardsIn10min),
        eventIn10minUnique: countUniqueCards(eventCardsIn10min),
        eventIn10minBlank: countBlankCards(eventCardsIn10min),
        eventIn5min: countCards(eventCardsIn5min),
        eventIn5minUnique: countUniqueCards(eventCardsIn5min),
        eventIn5minBlank: countBlankCards(eventCardsIn5min),
        eventIn1min: countCards(eventCardsIn1min),
        eventIn1minUnique: countUniqueCards(eventCardsIn1min),
        eventIn1minBlank: countBlankCards(eventCardsIn1min),
        hotspotCards: countCards(eventSummaryRaw.hotspotCards),
        hotspotUniqueCards: countUniqueCards(eventSummaryRaw.hotspotCards),
        hotspotBlankCards: countBlankCards(eventSummaryRaw.hotspotCards),
        hotspotIn10m: countCards(hotspotCardsIn10m),
        hotspotIn10mUniques: countUniqueCards(hotspotCardsIn10m),
        hotspotIn10mBlank: countBlankCards(hotspotCardsIn10m),
        hotspotIn5m: countCards(hotspotCardsIn5m),
        hotspotIn5mUniques: countUniqueCards(hotspotCardsIn5m),
        hotspotIn5mBlank: countBlankCards(hotspotCardsIn5m),
        hotspotIn1m: countCards(hotspotCardsIn1m),
        hotspotIn1mUniques: countUniqueCards(hotspotCardsIn1m),
        hotspotIn1mBlank: countBlankCards(hotspotCardsIn1m),
        otherCards: eventSummaryRaw.otherCards.length,
        contributors: eventSummaryRaw.contributors.size,
        users: eventSummaryRaw.users.length
    };
}

function reloadEventSummary(boardSPI: WorkshopBoardSPI, setEventSummary: (summary: EventSummaryNumbers) => void): void {
    (async () => {
        const eventSummaryRaw = await boardSPI.summaryEventSession();
        const eventSummary = mapToEventSummary(eventSummaryRaw);
        setEventSummary(eventSummary);
    })();
}

export {
    withinXMinutes, reloadEventSummary
};