import {IMessage} from "../../../../application/messaging/IMessage";
import {ParticipantFeedback} from "../../repository/EventSessionVoteRepository";

export class ParticipantFeedbackAdjustmentRequest implements IMessage {
    static MESSAGE_TYPE: string = 'ParticipantFeedbackAdjustmentRequest';
    id: string;
    type: string;
    recipient: string | null;
    sender: string;
    senderName: string;
    replyTo: string | null;
    feedbacks: ParticipantFeedback[];

    constructor(id: string, recipient: string | null, replyTo: string | null,
                sender: string, senderName: string, feedbacks: ParticipantFeedback[]) {
        this.type = ParticipantFeedbackAdjustmentRequest.MESSAGE_TYPE;
        this.id = id;
        this.recipient = recipient;
        this.replyTo = replyTo;
        this.sender = sender;
        this.senderName = senderName;
        this.feedbacks = feedbacks;
    }

}