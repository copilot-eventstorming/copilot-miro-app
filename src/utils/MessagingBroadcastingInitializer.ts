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
} from "../component/broadcast/handler/ParticipantFeedbackAdjustmentRequestHandler";
import {
    FeedbackAdjustmentRequest
} from "../component/broadcast/message/FeedbackAdjustmentRequest";
import {ProblemFixSuggestionsMessage} from "../component/broadcast/message/ProblemFixSuggestionsMessage";
import {ClosePanelRequest} from "../component/broadcast/message/ClosePanelRequest";
import {ClosePanelHandler} from "../component/broadcast/handler/ClosePanelHandler";
import {ProblemFixSuggestionsHandler} from "../component/broadcast/handler/ProblemFixSuggestionsHandler";

export const messageRegistry = new MessageRegistry(MessageTopics)

const startEventSessionConceptIntroductionQuizHandler = new StartEventSessionConceptIntroductionQuizHandler();
const startEventSessionVoteHandler = new StartEventSessionVoteHandler();
const participantFeedbackAdjustmentRequestHandler = new ParticipantFeedbackAdjustmentRequestHandler();
const problemFixSuggestionsMessageHandler = new ProblemFixSuggestionsHandler();
const closePanelHandler = new ClosePanelHandler()

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
        FeedbackAdjustmentRequest.MESSAGE_TYPE,
        participantFeedbackAdjustmentRequestHandler
    )

    messageRegistry.registerHandler(
        ProblemFixSuggestionsMessage.MESSAGE_TYPE,
        problemFixSuggestionsMessageHandler
    )

   messageRegistry.registerHandler(
       ClosePanelRequest.MESSAGE_TYPE,
       closePanelHandler
   )
}

export function releaseMessaging() {
    messageRegistry.release();
}