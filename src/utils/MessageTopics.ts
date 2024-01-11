import {EventSessionQuizAnswer} from "../features/eventSession/broadcast/message/EventSessionQuizAnswer";
import {
    StartEventSessionConceptIntroductionQuiz
} from "../features/eventSession/broadcast/message/StartEventSessionConceptIntroductionQuiz";
import {StartEventSessionVote} from "../features/eventSession/broadcast/message/StartEventSessionVote";
import {EventSessionVoteResult} from "../features/eventSession/broadcast/message/EventSessionVoteResult";

export const MessageTopics = [
    EventSessionQuizAnswer.MESSAGE_TYPE,
    StartEventSessionConceptIntroductionQuiz.MESSAGE_TYPE,
    StartEventSessionVote.MESSAGE_TYPE,
    EventSessionVoteResult.MESSAGE_TYPE
]