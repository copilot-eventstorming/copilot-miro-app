import {IMessage} from "../../../../application/messaging/IMessage";
import {VoteItem} from "../../types/VoteItem";

export class StartEventSessionVote implements IMessage {
    static MESSAGE_TYPE = 'StartEventSessionVote';
    id: string;
    type: string;
    recipient: string | null;
    sender: string;
    senderName: string;
    replyTo: string | null;
    voteItems: VoteItem[];

    constructor(id: string, recipient: string | null, sender: string, senderName: string, replyTo: string | null, voteItems: VoteItem[]) {
        this.id = id;
        this.type = StartEventSessionVote.MESSAGE_TYPE;
        this.recipient = recipient;
        this.sender = sender;
        this.senderName = senderName;
        this.replyTo = replyTo;
        this.voteItems = voteItems;
    }

    toString(): string {
        return JSON.stringify(this);
    }
}