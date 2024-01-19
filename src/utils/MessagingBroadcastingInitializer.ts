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
import {
    ParticipantFeedbackAdjustmentRequestHandler
} from "../features/eventSession/broadcast/handler/ParticipantFeedbackAdjustmentRequestHandler";
import {
    ParticipantFeedbackAdjustmentRequest
} from "../features/eventSession/broadcast/message/ParticipantFeedbackAdjustmentRequest";

export const messageRegistry = new MessageRegistry(MessageTopics)

const startEventSessionConceptIntroductionQuizHandler = new StartEventSessionConceptIntroductionQuizHandler();
const startEventSessionVoteHandler = new StartEventSessionVoteHandler();
const participantFeedbackAdjustmentRequestHandler = new ParticipantFeedbackAdjustmentRequestHandler();

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
        ParticipantFeedbackAdjustmentRequest.MESSAGE_TYPE,
        participantFeedbackAdjustmentRequestHandler
    )


}

export function releaseMessaging() {
    messageRegistry.release();
}