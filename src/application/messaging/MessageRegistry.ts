import {IMessage} from "./IMessage";
import {IMessageHandler} from "./IMessageHandler";
import {CopilotSession} from "../CopilotSession";

type BroadcastReceiver = (payload: any) => void

export class MessageRegistry {
    private handlers: Map<string, IMessageHandler<any>[]> = new Map<string, IMessageHandler<any>[]>();
    private readonly messageTopics: string[] = [];
    private copilotSession: CopilotSession | null = null;
    private subscriptions: Map<string, BroadcastReceiver> = new Map()

    constructor(messageTopics: string[]) {
        this.messageTopics = messageTopics;
        messageTopics.forEach((messageTopic: string) => {
            this.subscriptions.set(messageTopic, this.onMessage(messageTopic).bind(this))
        })
    }

    setCopilotSession(copilotSession: CopilotSession) {
        this.copilotSession = copilotSession;
    }

    registerHandler(type: string, handler: IMessageHandler<any>) {
        console.log("registering handler", type, handler, this.handlers.get(type)?.length ?? 0)
        if (this.handlers.has(type)) {
            const handlers = this.handlers.get(type);
            this.handlers.get(type)?.push(handler);
            return;
        } else {
            this.handlers.set(type, [handler]);
        }
        console.log("after registering handler", type, handler, this.handlers.get(type)?.length ?? 0)
    }

    unregisterHandler(type: string, handler: IMessageHandler<any>) {
        console.log("before unregistering handler", type, handler, this.handlers.get(type)?.length ?? 0)
        if (this.handlers.has(type)) {
            const handlers = this.handlers.get(type);
            const index = handlers?.indexOf(handler);
            if (index !== undefined) {
                handlers?.splice(index, 1);
            }
        }
        console.log("after unregistering handler", type, handler, this.handlers.get(type)?.length ?? 0)
    }

    bindMessageFramework(
        subscribe: (event: string, messageHandler: ((payload: any) => void)) => void,
        unsubscribe: (event: string, messageHandler: ((payload: any) => void)) => void,
    ) {
        console.log(this.messageTopics)
        this.messageTopics.forEach((messageTopic: string) => {
            try {
                unsubscribe(messageTopic, this.subscriptions.get(messageTopic)!)
            } catch (e) {
                console.log("MessageRegistry: unsubscribe failed", e)
            }
        })
        this.messageTopics.forEach((messageTopic: string) => {
            subscribe(messageTopic, this.subscriptions.get(messageTopic)!)
        })
    }

    private onMessage(messageTopic: string) {
        return (payload: any) => {
            const iMessage: IMessage = JSON.parse(payload)
            console.log("Message Registry is processing: ", iMessage)
            this.handlers.get(messageTopic)?.forEach(handler => {
                if (this.copilotSession === null || iMessage.recipient === null
                    || iMessage.recipient === this.copilotSession.miroUserId) {
                    handler.handleMessage(iMessage)
                        .then(() => console.log(`Handled ${iMessage.type} by ${typeof (handler)}`))
                        .catch((e) => console.error(`Failed to handle ${iMessage.type} by ${typeof (handler)}`, e))
                }
            })
        }
    }

    release() {
        [...this.handlers.entries()].forEach((entry) => {
            entry[1].forEach((handler) => {
                handler.release()
            })
        })
    }
}