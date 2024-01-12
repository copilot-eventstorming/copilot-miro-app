import {MessageTopics} from "./MessageTopics";
import {MessageRegistry} from "../application/messaging/MessageRegistry";
import {
    StartEventSessionConceptIntroductionQuiz
} from "../features/eventSession/broadcast/message/StartEventSessionConceptIntroductionQuiz";
import {
    StartEventSessionConceptIntroductionQuizHandler
} from "../features/eventSession/broadcast/handler/StartEventSessionConceptIntroductionQuizHandler";
import {copilotSession$} from "../application/CopilotSession";
import {StartEventSessionVoteHandler} from "../features/eventSession/broadcast/handler/StartEventSessionVoteHandler";
import {StartEventSessionVote} from "../features/eventSession/broadcast/message/StartEventSessionVote";

export const messageRegistry = new MessageRegistry(MessageTopics)

const startEventSessionConceptIntroductionQuizHandler = new StartEventSessionConceptIntroductionQuizHandler();
const startEventSessionVoteHandler = new StartEventSessionVoteHandler();

export function initializeMessaging() {
    copilotSession$.subscribe((copilotSession) => {
        if (copilotSession) {
            messageRegistry.setCopilotSession(copilotSession)
        }
    })
    messageRegistry.bindMessageFramework(
        miro.board.events.on.bind(miro.board.events),
        miro.board.events.off.bind(miro.board.events)
    )

    messageRegistry.registerHandler(
        StartEventSessionConceptIntroductionQuiz.MESSAGE_TYPE,
        startEventSessionConceptIntroductionQuizHandler
    )

    messageRegistry.registerHandler(
        StartEventSessionVote.MESSAGE_TYPE,
        startEventSessionVoteHandler
    )


}

export function releaseMessaging() {
    messageRegistry.release();
}