import {IMessageHandler} from "../../../../application/messaging/IMessageHandler";
import {StartEventSessionVote} from "../message/StartEventSessionVote";
import {EventSessionVoteModalChannel, VoteSubmittedMessage} from "../../types/EventSessionVoteModalChannels";

export class StartEventSessionVoteHandler implements IMessageHandler<StartEventSessionVote> {
    broadcastChannel = new BroadcastChannel(EventSessionVoteModalChannel);

    constructor() {
        this.broadcastChannel.addEventListener('message', (event) => {
            if (event.data === VoteSubmittedMessage) {
                miro.board.ui.closeModal();
            }
        })
    }

    async handleMessage(message: StartEventSessionVote): Promise<void> {
        if (await miro.board.ui.canOpenModal()) {
            const url = new URL('modals/eventSessionVote.html', window.location.href);
            url.searchParams.append('sender', message.sender);
            url.searchParams.append('senderName', message.senderName);
            url.searchParams.append('voteItems', JSON.stringify(message.voteItems));
            await miro.board.ui.openModal({
                url: url.toString(), width: 1200, height: 640, fullscreen: false,
            });

        }
    }

    release(): void {

    }

}