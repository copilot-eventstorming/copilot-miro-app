import {IMessage} from "./IMessage";

export interface IMessageHandler<T extends IMessage> {
    handleMessage(message: T): Promise<void>;
    release(): void;
}