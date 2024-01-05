export interface IMessage {
    id: string;
    type: string;
    // null for everyone, otherwise specific recipient
    recipient: string | null;
    //senderId, null for anonymous
    sender: string | null;
    senderName: string;
    // replyTo miroUserId, null for no reply
    replyTo: string | null;
}