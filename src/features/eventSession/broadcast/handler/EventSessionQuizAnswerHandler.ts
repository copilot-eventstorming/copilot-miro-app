import {IMessageHandler} from "../../../../application/messaging/IMessageHandler";
import {EventSessionQuizAnswer} from "../message/EventSessionQuizAnswer";

export class EventSessionQuizAnswerHandler implements IMessageHandler<EventSessionQuizAnswer> {
    handleMessage(message: EventSessionQuizAnswer): Promise<void> {
        return Promise.resolve(console.log(message))
    }
}