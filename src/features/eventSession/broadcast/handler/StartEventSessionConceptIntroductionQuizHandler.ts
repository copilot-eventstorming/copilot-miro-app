import {IMessageHandler} from "../../../../application/messaging/IMessageHandler";
import {StartEventSessionConceptIntroductionQuiz} from "../message/StartEventSessionConceptIntroductionQuiz";

export class StartEventSessionConceptIntroductionQuizHandler
    implements IMessageHandler<StartEventSessionConceptIntroductionQuiz> {
    async handleMessage(message: StartEventSessionConceptIntroductionQuiz) {
        console.log('StartEventSessionConceptIntroductionQuizHandler', JSON.stringify(message));
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
}