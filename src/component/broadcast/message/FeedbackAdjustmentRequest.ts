import {IMessage} from "../../../application/messaging/IMessage";
import {ParticipantFeedback} from "../../../features/eventSession/repository/EventSessionVoteRepository";
import {MetricMetadata} from "../../../features/eventSession/types/MetricMetadata";

export class FeedbackAdjustmentRequest implements IMessage {
    static MESSAGE_TYPE: string = 'FeedbackAdjustmentRequest';
    id: string;
    type: string;
    recipient: string | null;
    sender: string;
    senderName: string;
    replyTo: string | null;
    feedbacks: ParticipantFeedback[];
    metricMeta: MetricMetadata[];
    eventName:string;

    constructor(id: string, recipient: string | null, replyTo: string | null,
                sender: string, senderName: string,
                feedbacks: ParticipantFeedback[],
                metricMeta: MetricMetadata[],
                eventName:string
    ) {
        this.type = FeedbackAdjustmentRequest.MESSAGE_TYPE;
        this.id = id;
        this.recipient = recipient;
        this.replyTo = replyTo;
        this.sender = sender;
        this.senderName = senderName;
        this.feedbacks = feedbacks;
        this.metricMeta = metricMeta;
        this.eventName = eventName;
    }

}