import {IMessage} from "../../../../application/messaging/IMessage";
import {Answer} from "./EventSessionQuizAnswer";

export class StartEventSessionConceptIntroductionQuiz implements IMessage {
    static MESSAGE_TYPE: string = 'StartEventSessionConceptIntroductionQuiz';
    id: string;
    type: string;
    recipient: string|null;
    sender: string;
    senderName: string;
    replyTo: string | null;
    answers: Answer[];

    constructor(id: string, recipient: string|null, sender: string, senderName: string, replyTo: string | null, answers: Answer[] = []) {
        this.id = id;
        this.type = StartEventSessionConceptIntroductionQuiz.MESSAGE_TYPE;
        this.recipient = recipient;
        this.sender = sender;
        this.senderName = senderName;
        this.replyTo = replyTo;
        this.answers = answers;
    }

    toString(): string {
        return JSON.stringify(this);
    }
}