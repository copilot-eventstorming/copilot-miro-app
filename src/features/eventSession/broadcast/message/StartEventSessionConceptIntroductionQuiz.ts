import {IMessage} from "../../../../application/messaging/IMessage";

export class StartEventSessionConceptIntroductionQuiz implements IMessage {
    static MESSAGE_TYPE: string = 'StartEventSessionConceptIntroductionQuiz';
    id: string;
    type: string;
    recipient: string;
    sender: string;
    senderName: string;
    replyTo: string | null;

    constructor(id: string, recipient: string, sender: string, senderName: string, replyTo: string | null) {
        this.id = id;
        this.type = StartEventSessionConceptIntroductionQuiz.MESSAGE_TYPE;
        this.recipient = recipient;
        this.sender = sender;
        this.senderName = senderName;
        this.replyTo = replyTo;
    }

    toString(): string {
        return JSON.stringify(this);
    }
}