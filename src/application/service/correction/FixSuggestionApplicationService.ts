import {FixSuggestion, FixSuggestionType} from "../../../component/types/FixSuggestion";
import {WorkshopBoardSPI} from "../../spi/WorkshopBoardSPI";
import {Broadcaster} from "../../messaging/Broadcaster";
import {ProblemFixSuggestionApplied} from "../../../component/broadcast/message/ProblemFixSuggestionApplied";
import {v4 as uuidv4} from 'uuid';
import {StickyNoteColor} from "@mirohq/websdk-types";

export class FixSuggestionApplicationService {
    boardSPI: WorkshopBoardSPI;

    fixPastTenseService: OneCardOneSuggestionFixService
    fixIndependenceService: OneCardManySuggestionFixService
    private broadcaster: Broadcaster;

    constructor(boardSPI: WorkshopBoardSPI, broadcaster: Broadcaster) {
        this.boardSPI = boardSPI;
        this.fixPastTenseService = new OneCardOneSuggestionFixService(boardSPI);
        this.fixIndependenceService = new OneCardManySuggestionFixService(boardSPI);
        this.broadcaster = broadcaster;
    }

    async performFixSuggestion(ownerId: string, ownerName: string, recipientId: string, fixSuggestion: FixSuggestion): Promise<void> {
        const {id, suggestion, text, typeName} = fixSuggestion;
        switch (typeName) {
            case FixSuggestionType.SpecificMeaningIssue:
            //fall through
            case FixSuggestionType.PastTensIssue:
                if (suggestion.length >= 1) {
                    return this.fixPastTenseService.performFixSuggestion(id, suggestion[0])
                        .then(() => {
                            this.broadcaster.broadcast(new ProblemFixSuggestionApplied(
                                uuidv4(), recipientId, ownerId, ownerName, null,
                                {
                                    id, suggestion, text, typeName
                                }))
                        })
                }
                break;
            case FixSuggestionType.IndependenceIssue:
                if (suggestion.length >= 1) {
                    return this.fixIndependenceService.performFixSuggestion(id, suggestion)
                        .then(() => {
                            this.broadcaster.broadcast(new ProblemFixSuggestionApplied(
                                uuidv4(), recipientId, ownerId, ownerName, null,
                                {
                                    id, suggestion, text, typeName
                                }))
                        })
                }
                break;
        }
        return Promise.resolve();
    }
}

class OneCardOneSuggestionFixService {
    constructor(private boardSPI: WorkshopBoardSPI) {
    }

    async performFixSuggestion(id: string, suggestion: string): Promise<void> {
        return this.boardSPI.findWorkshopCardById(id)
            .then((card) => {
                if (card) {
                    card.content = suggestion;
                    return this.boardSPI.updateWorkshopCard(card);
                } else {
                    return Promise.resolve();
                }
            })
    }
}

class OneCardManySuggestionFixService {
    constructor(private boardSPI: WorkshopBoardSPI) {
    }

    async performFixSuggestion(id: string, suggestions: string[]) {
        this.boardSPI.findWorkshopCardById(id)
            .then(async (card)=> {
                if (card) {
                    return this.boardSPI.dropCard(card).then(async () => {
                        console.log("performFixSuggestion")
                        const xs = Promise.allSettled(suggestions.map((suggestion, index) => {
                            this.boardSPI.createStickyNote(({
                                content: suggestion,
                                x: card.x,
                                y: card.y + card.height * (index + 1),
                                width: card.width,
                                style: {
                                    fillColor: card.style.fillColor as StickyNoteColor ?? StickyNoteColor.Orange,
                                    textAlign: card.style.textAlign ?? 'center',
                                    textAlignVertical:  card.style.textAlignVertical ?? 'middle',
                                },
                            }))
                        }))
                        return await xs;
                    })
                } else {
                    return Promise.resolve();
                }
            })


    }

}