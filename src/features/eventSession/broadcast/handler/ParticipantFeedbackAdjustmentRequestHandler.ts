import {IMessageHandler} from "../../../../application/messaging/IMessageHandler";
import {ParticipantFeedbackAdjustmentRequest} from "../message/ParticipantFeedbackAdjustmentRequest";

export class ParticipantFeedbackAdjustmentRequestHandler implements IMessageHandler<ParticipantFeedbackAdjustmentRequest> {
    async handleMessage(message: ParticipantFeedbackAdjustmentRequest): Promise<void> {
        if (await miro.board.ui.canOpenPanel()) {
            const url = new URL('panels/ParticipantFeedbackAdjustmentPanel.html', window.location.href);
            url.searchParams.append('sender', message.sender);
            url.searchParams.append('senderName', message.senderName);
            url.searchParams.append('feedbacks', JSON.stringify(message.feedbacks));
            url.searchParams.append('metricsMetadata', JSON.stringify(message.metricMeta));
            url.searchParams.append('eventName', message.eventName);
            await miro.board.ui.openPanel({
                url: url.toString(),
            });

        }
    }

    release(): void {
    }
}