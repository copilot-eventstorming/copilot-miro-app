import {IMessageHandler} from "../../../../application/messaging/IMessageHandler";
import {Answer, EventSessionQuizAnswer} from "../message/EventSessionQuizAnswer";
import {EventSessionQuizRepository, QuizAnswer} from "../../repository/EventSessionQuizRepository";

export class EventSessionQuizAnswerHandler implements IMessageHandler<EventSessionQuizAnswer> {
    private quizRepository: EventSessionQuizRepository | null;
    private callback: (quizAnswers: QuizAnswer[]) => void = (message) => {
    }

    constructor(quizRepository: EventSessionQuizRepository | null, callback: (quizAnswers: QuizAnswer[]) => void) {
        this.quizRepository = quizRepository;
        this.callback = callback;
    }

    handleMessage(message: EventSessionQuizAnswer): Promise<void> {
        const sender = message.sender
        const senderName = message.senderName
        const receivedAnswers = message.answers
        if (null === sender) {
            console.log('Sender is null', JSON.stringify(message))
            return Promise.reject(new Error('Sender is null'))
        }

        if (this.quizRepository) {
            this.quizRepository.loadQuizAnswer().then((savedQuizAnswers) => {
                const {
                    quizAnswer,
                    newQuizAnswers
                } = this.mkNewQuizAnswers(savedQuizAnswers, sender, senderName, receivedAnswers);
                this.quizRepository!.saveQuizAnswer(newQuizAnswers).then((saveResult) => {
                    if (saveResult.success) {
                        console.log('Saved quiz answer', JSON.stringify(quizAnswer))
                    } else {
                        console.log('Failed to save quiz answer', saveResult.error)
                    }
                    this.callback(newQuizAnswers)
                })
            })
        }

        return Promise.resolve(console.log(message))
    }

    private mkNewQuizAnswers(quizAnswers: QuizAnswer[], sender: string, senderName: string, answers: Answer[]) {
        const otherAnswers = quizAnswers?.filter((quizAnswer) => quizAnswer.userId !== sender) ?? []
        const quizAnswer = {
            userId: sender,
            userName: senderName,
            answers: answers.map((answer) => {
                return {
                    questionNumber: answer.questionNumber,
                    actualAnswer: answer.answer,
                    expectedAnswer: []
                }
            })
        }
        const newQuizAnswers = [...otherAnswers, quizAnswer]
        return {quizAnswer, newQuizAnswers};
    }
}