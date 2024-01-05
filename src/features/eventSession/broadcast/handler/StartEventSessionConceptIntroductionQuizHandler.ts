import {IMessageHandler} from "../../../../application/messaging/IMessageHandler";
import {StartEventSessionConceptIntroductionQuiz} from "../message/StartEventSessionConceptIntroductionQuiz";
import {EventSessionQuizModalChannel, QuizSubmittedMessage} from "../../types/QuizModalChannels";
import {release} from "../../../../utils/AppInitializer";

export class StartEventSessionConceptIntroductionQuizHandler
    implements IMessageHandler<StartEventSessionConceptIntroductionQuiz> {
    broadcastChannel = new BroadcastChannel(EventSessionQuizModalChannel);

    constructor() {
        this.broadcastChannel.addEventListener('message', (event) => {
            if (event.data === QuizSubmittedMessage) {
                miro.board.ui.closeModal();
            }
        })
    }

    async handleMessage(message: StartEventSessionConceptIntroductionQuiz) {
        if (await miro.board.ui.canOpenModal()) {
            const url = new URL('modals/eventSessionQuiz.html', window.location.href);
            url.searchParams.append('sender', message.sender);
            url.searchParams.append('senderName', message.senderName);
            url.searchParams.append('answers', JSON.stringify(message.answers));
            await miro.board.ui.openModal({
                url: url.toString(), width: 800, height: 640, fullscreen: false,
            });

        }
    }

    release() {
        this.broadcastChannel.close();
    }
}