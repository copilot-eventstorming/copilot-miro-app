import {EventSessionQuizAnswer} from "../features/eventSession/broadcast/message/EventSessionQuizAnswer";
import {
    StartEventSessionConceptIntroductionQuiz
} from "../features/eventSession/broadcast/message/StartEventSessionConceptIntroductionQuiz";

export const MessageTopics = [
    EventSessionQuizAnswer.MESSAGE_TYPE,
    StartEventSessionConceptIntroductionQuiz.MESSAGE_TYPE
]