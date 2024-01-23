import {IMessageHandler} from "../../../application/messaging/IMessageHandler";
import {FeedbackAdjustmentRequest} from "../message/FeedbackAdjustmentRequest";
import {ParticipantFeedback} from "../../../features/eventSession/repository/EventSessionVoteRepository";
import {MetricMetadata} from "../../../features/eventSession/types/MetricMetadata";

export class ParticipantSwitchFeedbackHandler implements IMessageHandler<FeedbackAdjustmentRequest> {
    private callback: (eventName: string, value: ParticipantFeedback[], metricMetadata: MetricMetadata[]) => void;

    constructor(feedbacksSetter: (eventName: string, value: ParticipantFeedback[], metricMetadata: MetricMetadata[]) => void) {
        this.callback = feedbacksSetter
    }
    handleMessage(message: FeedbackAdjustmentRequest): Promise<void> {
        console.log("ParticipantSwitchFeedbackHandler", message)
        this.callback(message.eventName, message.feedbacks, message.metricMeta)
        return Promise.resolve();
    }

    release(): void {

    }

}