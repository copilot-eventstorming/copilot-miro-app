import {IMessage} from "../../../../application/messaging/IMessage";

export class Answer {
    constructor(public questionNumber: number, public answer: string[]) {
    }
}

export class EventSessionQuizAnswer implements IMessage {
    static MESSAGE_TYPE: string = 'EventSessionQuizAnswer';
    id: string;
    recipient: string | null;
    replyTo: string | null;
    sender: string | null;
    senderName: string;
    type: string;
    answers: Answer[];

    constructor(id: string, recipient: string | null, replyTo: string | null,
                sender: string | null, senderName: string, answers: Answer[]) {
        this.type = EventSessionQuizAnswer.MESSAGE_TYPE;
        this.id = id;
        this.recipient = recipient;
        this.replyTo = replyTo;
        this.sender = sender;
        this.senderName = senderName;
        this.answers = answers;
    }
}