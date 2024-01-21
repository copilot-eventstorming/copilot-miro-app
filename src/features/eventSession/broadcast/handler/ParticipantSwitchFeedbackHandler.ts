import {IMessageHandler} from "../../../../application/messaging/IMessageHandler";
import {ParticipantFeedbackAdjustmentRequest} from "../message/ParticipantFeedbackAdjustmentRequest";
import {ParticipantFeedback} from "../../repository/EventSessionVoteRepository";
import {MetricMetadata} from "../../types/MetricMetadata";

export class ParticipantSwitchFeedbackHandler implements IMessageHandler<ParticipantFeedbackAdjustmentRequest> {
    private callback: (eventName: string, value: ParticipantFeedback[], metricMetadata: MetricMetadata[]) => void;

    constructor(feedbacksSetter: (eventName: string, value: ParticipantFeedback[], metricMetadata: MetricMetadata[]) => void) {
        this.callback = feedbacksSetter
    }
    handleMessage(message: ParticipantFeedbackAdjustmentRequest): Promise<void> {
        console.log("ParticipantSwitchFeedbackHandler", message)
        this.callback(message.eventName, message.feedbacks, message.metricMeta)
        return Promise.resolve();
    }

    release(): void {

    }

}