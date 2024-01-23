import {IMessage} from "../../../application/messaging/IMessage";
import {EventFeedback} from "../../../features/eventSession/repository/EventSessionVoteRepository";

export class FeedbackAdjustmentResponse implements IMessage {
    static MESSAGE_TYPE: string = "FeedbackAdjustmentResponse";
    id: string;
    type: string;
    recipient: string | null;
    sender: string;
    senderName: string;
    replyTo: string | null;
    eventFeedback: EventFeedback;

    public constructor(id: string, recipient: string | null, sender: string, senderName: string, replyTo: string | null, eventFeedback: EventFeedback) {
        this.type = FeedbackAdjustmentResponse.MESSAGE_TYPE;
        this.id = id;
        this.recipient = recipient;
        this.replyTo = replyTo;
        this.sender = sender;
        this.senderName = senderName;
        this.eventFeedback = eventFeedback;
    }
}