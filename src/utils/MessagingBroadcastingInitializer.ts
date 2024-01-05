import {MessageTopics} from "./MessageTopics";
import {MessageRegistry} from "../application/messaging/MessageRegistry";
import {
    StartEventSessionConceptIntroductionQuiz
} from "../features/eventSession/broadcast/message/StartEventSessionConceptIntroductionQuiz";
import {
    StartEventSessionConceptIntroductionQuizHandler
} from "../features/eventSession/broadcast/handler/StartEventSessionConceptIntroductionQuizHandler";
import {copilotSession$} from "../application/CopilotSession";

export const messageRegistry = new MessageRegistry(MessageTopics)

const startEventSessionConceptIntroductionQuizHandler = new StartEventSessionConceptIntroductionQuizHandler();

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
}