import {IMessageHandler} from "../../../application/messaging/IMessageHandler";
import {FeedbackAdjustmentResponse} from "../message/FeedbackAdjustmentResponse";
import {IncrementalFeedback} from "../../../features/eventSession/utils/FeedbackMergeUtils";

export class ParticipantFeedbackAdjustmentResponseHandler implements IMessageHandler<FeedbackAdjustmentResponse> {
    private callback: (value: IncrementalFeedback) => void;

    constructor(setIncrementalFeedback: (value: IncrementalFeedback) => void) {
        this.callback = setIncrementalFeedback;
    }


    handleMessage(message: FeedbackAdjustmentResponse): Promise<void> {
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