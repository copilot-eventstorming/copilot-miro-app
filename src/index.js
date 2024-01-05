import {initialize} from "./utils/AppInitializer";
import {EventSessionQuizAnswerHandler} from "./features/eventSession/broadcast/handler/EventSessionQuizAnswerHandler";
import {EventSessionQuizRepository} from "./features/eventSession/repository/EventSessionQuizRepository";
import {messageRegistry} from "./utils/MessagingBroadcastingInitializer";
import {EventSessionQuizAnswer} from "./features/eventSession/broadcast/message/EventSessionQuizAnswer";

export async function init() {
    miro.board.ui.on('icon:click', async () => {
        await miro.board.ui.openPanel({url: 'app.html'});
    });

    initialize();

    miro.board.getInfo().then(board => {

        const quizRepository = new EventSessionQuizRepository(board.id)
        const answerHandler = new EventSessionQuizAnswerHandler(quizRepository, () => {})
        messageRegistry.registerHandler(EventSessionQuizAnswer.MESSAGE_TYPE, answerHandler)

    })
}

init();
