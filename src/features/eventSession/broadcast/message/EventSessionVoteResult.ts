import {IMessage} from "../../../../application/messaging/IMessage";
import {VoteItem} from "../../types/VoteItem";


export class EventSessionVoteResult implements IMessage {
    static MESSAGE_TYPE = 'EventSessionVoteResult';
    id: string;
    type: string;
    recipient: string | null;
    sender: string | null;
    senderName: string;
    replyTo: string | null;
    results: VoteItem[];

    constructor(id: string, recipient: string | null, sender: string | null, senderName: string, replyTo: string | null, results: VoteItem[]) {
        this.type = EventSessionVoteResult.MESSAGE_TYPE;
        this.id = id;
        this.recipient = recipient;
        this.replyTo = replyTo;
        this.sender = sender;
        this.senderName = senderName;
        this.results = results;
    }

    toString() {
        return JSON.stringify(this);
    }
}