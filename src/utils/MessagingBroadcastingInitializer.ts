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
import {EventSessionVoteResult} from "../features/eventSession/broadcast/message/EventSessionVoteResult";
import {EventSessionVoteResultHandler} from "../features/eventSession/broadcast/handler/EventSessionVoteResultHandler";

export const messageRegistry = new MessageRegistry(MessageTopics)

const startEventSessionConceptIntroductionQuizHandler = new StartEventSessionConceptIntroductionQuizHandler();
const startEventSessionVoteHandler = new StartEventSessionVoteHandler();
const eventSessionVoteResultHandler = new EventSessionVoteResultHandler();
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

    messageRegistry.registerHandler(
        EventSessionVoteResult.MESSAGE_TYPE,
        eventSessionVoteResultHandler
    )

}

export function releaseMessaging() {
    messageRegistry.release();
}