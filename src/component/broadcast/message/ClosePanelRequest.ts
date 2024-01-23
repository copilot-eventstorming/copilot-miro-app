export class ClosePanelRequest implements IMessage {
    static MESSAGE_TYPE: string = "ClosePanelRequest";
    id: string;
    type: string;
    recipient: string | null;
    sender: string;
    senderName: string;
    replyTo: string | null;

    public constructor(id: string, recipient: string | null, sender: string, senderName: string, replyTo: string | null) {
        this.type = ClosePanelRequest.MESSAGE_TYPE;
        this.id = id;
        this.recipient = recipient;
        this.replyTo = replyTo;
        this.sender = sender;
        this.senderName = senderName;
    }
}