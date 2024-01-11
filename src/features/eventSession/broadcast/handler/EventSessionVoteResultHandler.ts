import {IMessageHandler} from "../../../../application/messaging/IMessageHandler";
import {EventSessionVoteResult} from "../message/EventSessionVoteResult";

export class EventSessionVoteResultHandler implements IMessageHandler<EventSessionVoteResult> {
    handleMessage(message: EventSessionVoteResult): Promise<void> {
        console.log(message)
        return Promise.resolve(undefined);
    }

    release(): void {
    }

}