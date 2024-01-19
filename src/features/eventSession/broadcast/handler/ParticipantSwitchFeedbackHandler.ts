import {IMessageHandler} from "../../../../application/messaging/IMessageHandler";
import {ParticipantFeedbackAdjustmentRequest} from "../message/ParticipantFeedbackAdjustmentRequest";
import {ParticipantFeedback} from "../../repository/EventSessionVoteRepository";

export class ParticipantSwitchFeedbackHandler implements IMessageHandler<ParticipantFeedbackAdjustmentRequest> {
    private callback: (value: ParticipantFeedback[]) => void;

    constructor(feedbacksSetter: (value: (ParticipantFeedback[])) => void) {
        this.callback = feedbacksSetter
    }
    handleMessage(message: ParticipantFeedbackAdjustmentRequest): Promise<void> {
        console.log("ParticipantSwitchFeedbackHandler", message)
        this.callback(message.feedbacks)
        return Promise.resolve();
    }

    release(): void {

    }

}