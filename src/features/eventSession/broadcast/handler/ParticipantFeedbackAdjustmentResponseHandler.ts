import {IMessageHandler} from "../../../../application/messaging/IMessageHandler";
import {ParticipantFeedbackAdjustmentResponse} from "../message/ParticipantFeedbackAdjustmentResponse";
import {IncrementalFeedback} from "../../utils/FeedbackMergeUtils";

export class ParticipantFeedbackAdjustmentResponseHandler implements IMessageHandler<ParticipantFeedbackAdjustmentResponse> {
    private callback: (value: IncrementalFeedback) => void;

    constructor(setIncrementalFeedback: (value: IncrementalFeedback) => void) {
        this.callback = setIncrementalFeedback;
    }


    handleMessage(message: ParticipantFeedbackAdjustmentResponse): Promise<void> {
        console.log("ParticipantFeedbackAdjustmentResponseHandler", message)
        this.callback({
            participantId: message.sender,
            incrementalFeedback: message.eventFeedback
        })
        return Promise.resolve();
    }

    release(): void {
    }
}