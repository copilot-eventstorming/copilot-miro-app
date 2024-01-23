import {FixSuggestion} from "../../types/FixSuggestion";

export class ProblemFixSuggestionApplied {
    static MESSAGE_TYPE: string = "ProblemFixSuggestionApplied";
    id: string;
    type: string;
    recipient: string | null;
    sender: string;
    senderName: string;
    replyTo: string | null;
    fixSuggestion: FixSuggestion;

    constructor(id: string, recipient: string | null, sender: string, senderName: string, replyTo: string | null, fixSuggestion: FixSuggestion) {
        this.type = ProblemFixSuggestionApplied.MESSAGE_TYPE;
        this.id = id;
        this.recipient = recipient;
        this.sender = sender;
        this.senderName = senderName;
        this.replyTo = replyTo;
        this.fixSuggestion = fixSuggestion;
    }
}