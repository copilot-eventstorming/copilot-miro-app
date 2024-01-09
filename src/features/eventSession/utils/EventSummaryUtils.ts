import {EventSummary, WorkshopBoardSPI, WorkshopCard} from "../../../application/spi/WorkshopBoardSPI";
import {EventSummaryTypes} from "../types/EventSummaryTypes";


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

function mapToEventSummary(eventSummaryRaw: EventSummary): EventSummaryTypes {
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

function reloadEventSummary(boardSPI: WorkshopBoardSPI, setEventSummary: (summary: EventSummaryTypes) => void): void {
    (async () => {
        const eventSummaryRaw = await boardSPI.summaryEventSession();
        const eventSummary = mapToEventSummary(eventSummaryRaw);
        setEventSummary(eventSummary);
    })();
}

export {
    withinXMinutes, reloadEventSummary
};

export function mkItems(eventSummary: EventSummaryTypes) {
    return [
        {
            type: 'Events',
            total: eventSummary.eventCards,
            unique: eventSummary.eventUniqueCards,
            blank: eventSummary.eventBlankCards
        },
        {
            type: 'Events in 10m',
            total: eventSummary.eventIn10min,
            unique: eventSummary.eventIn10minUnique,
            blank: eventSummary.eventIn10minBlank
        },
        {
            type: 'Events in 5m',
            total: eventSummary.eventIn5min,
            unique: eventSummary.eventIn5minUnique,
            blank: eventSummary.eventIn5minBlank
        },
        {
            type: 'Events in 1m',
            total: eventSummary.eventIn1min,
            unique: eventSummary.eventIn1minUnique,
            blank: eventSummary.eventIn1minBlank
        },
        {
            type: 'Hotspots',
            total: eventSummary.hotspotCards,
            unique: eventSummary.hotspotUniqueCards,
            blank: eventSummary.hotspotBlankCards
        },
        {
            type: 'Hotspots in 10m',
            total: eventSummary.hotspotIn10m,
            unique: eventSummary.hotspotIn10mUniques,
            blank: eventSummary.hotspotIn10mBlank
        },
        {
            type: 'Hotspots in 5m',
            total: eventSummary.hotspotIn5m,
            unique: eventSummary.hotspotIn5mUniques,
            blank: eventSummary.hotspotIn5mBlank
        },
        {
            type: 'Hotspots in 1m',
            total: eventSummary.hotspotIn1m,
            unique: eventSummary.hotspotIn1mUniques,
            blank: eventSummary.hotspotIn1mBlank
        },
        {type: 'Others', total: eventSummary.otherCards, unique: undefined, blank: undefined},
        {type: 'Online Users', total: eventSummary.users, unique: undefined, blank: undefined},
        {type: 'Contributors', total: eventSummary.contributors, unique: undefined, blank: undefined},
    ];
}