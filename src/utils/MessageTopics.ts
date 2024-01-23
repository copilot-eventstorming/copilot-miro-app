import {EventSessionQuizAnswer} from "../features/eventSession/broadcast/message/EventSessionQuizAnswer";
import {
    StartEventSessionConceptIntroductionQuiz
} from "../features/eventSession/broadcast/message/StartEventSessionConceptIntroductionQuiz";
import {StartEventSessionVote} from "../features/eventSession/broadcast/message/StartEventSessionVote";
import {EventSessionVoteResult} from "../features/eventSession/broadcast/message/EventSessionVoteResult";
import {FeedbackAdjustmentRequest} from "../component/broadcast/message/FeedbackAdjustmentRequest";
import {FeedbackAdjustmentResponse} from "../component/broadcast/message/FeedbackAdjustmentResponse";
import {ProblemFixSuggestionsMessage} from "../component/broadcast/message/ProblemFixSuggestionsMessage";
import {ClosePanelRequest} from "../component/broadcast/message/ClosePanelRequest";
import {ProblemFixSuggestionApplied} from "../component/broadcast/message/ProblemFixSuggestionApplied";

export const MessageTopics = [
    EventSessionQuizAnswer.MESSAGE_TYPE,
    StartEventSessionConceptIntroductionQuiz.MESSAGE_TYPE,
    StartEventSessionVote.MESSAGE_TYPE,
    EventSessionVoteResult.MESSAGE_TYPE,
    FeedbackAdjustmentRequest.MESSAGE_TYPE,
    FeedbackAdjustmentResponse.MESSAGE_TYPE,
    ProblemFixSuggestionsMessage.MESSAGE_TYPE,
    ProblemFixSuggestionApplied.MESSAGE_TYPE,
    ClosePanelRequest.MESSAGE_TYPE
]