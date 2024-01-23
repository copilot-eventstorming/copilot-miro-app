import {IMessage} from "../../../application/messaging/IMessage";
import {FixSuggestion} from "../../types/FixSuggestion";

export class ProblemFixSuggestionsMessage implements IMessage {

    static MESSAGE_TYPE: string = 'ProblemFixSuggestionsMessage';
    id: string;
    type: string;
    recipient: string | null;
    sender: string;
    senderName: string;
    replyTo: string | null;
    subjectHeader: string;
    fixSuggestions: FixSuggestion[];

    constructor(id: string, recipient: string | null, sender: string, senderName: string, replyTo: string | null,
                subjectHeader: string, fixSuggestions: FixSuggestion[]) {
        this.id = id;
        this.type = ProblemFixSuggestionsMessage.MESSAGE_TYPE;
        this.recipient = recipient;
        this.sender = sender;
        this.senderName = senderName;
        this.replyTo = replyTo;
        this.subjectHeader = subjectHeader;
        this.fixSuggestions = fixSuggestions;
    }
}