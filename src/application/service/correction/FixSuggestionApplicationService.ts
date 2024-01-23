import {FixSuggestion, FixSuggestionType} from "../../../component/types/FixSuggestion";
import {WorkshopBoardSPI} from "../../spi/WorkshopBoardSPI";
import {Broadcaster} from "../../messaging/Broadcaster";
import {ProblemFixSuggestionApplied} from "../../../component/broadcast/message/ProblemFixSuggestionApplied";
import {v4 as uuidv4} from 'uuid';
export class FixSuggestionApplicationService {
    boardSPI: WorkshopBoardSPI;

    fixPastTenseService: FixPastTenseService
    private broadcaster: Broadcaster;

    constructor(boardSPI: WorkshopBoardSPI, broadcaster: Broadcaster) {
        this.boardSPI = boardSPI;
        this.fixPastTenseService = new FixPastTenseService(boardSPI);
        this.broadcaster = broadcaster;
    }

    async performFixSuggestion(ownerId: string, ownerName: string, recipientId: string, fixSuggestion: FixSuggestion) {
        const {id, suggestion, text, typeName} = fixSuggestion;
        switch (typeName) {
            case FixSuggestionType.PastTensIssue:
                if (suggestion.length >= 1) {
                    this.fixPastTenseService.performFixSuggestion(id, suggestion[0])
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
                break;
            case FixSuggestionType.SpecificMeaningIssue:
                break;
        }
    }
}

class FixPastTenseService {
    constructor(private boardSPI: WorkshopBoardSPI) {
    }

    async performFixSuggestion(id: string, suggestion: string) {
        this.boardSPI.findWorkshopCardById(id)
            .then(card => {
                if (card) {
                    card.content = suggestion;
                    this.boardSPI.updateWorkshopCard(card);
                }
            })
    }
}