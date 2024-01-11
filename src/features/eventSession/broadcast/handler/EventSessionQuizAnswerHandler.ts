import {IMessageHandler} from "../../../../application/messaging/IMessageHandler";
import {Answer, EventSessionQuizAnswer} from "../message/EventSessionQuizAnswer";
import {EventSessionQuizRepository, QuizAnswer} from "../../repository/EventSessionQuizRepository";

export class EventSessionQuizAnswerHandler implements IMessageHandler<EventSessionQuizAnswer> {
    release(): void {
    }

    private readonly quizRepository: EventSessionQuizRepository | null;
    private readonly callback: (quizAnswers: QuizAnswer[]) => void = (message) => {
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
        if (null === message.answers || undefined === message.answers || 0 >= message.answers.length) {
            return Promise.reject(new Error('Answers is null or undefined or empty'))
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

    private mkNewQuizAnswers(quizAnswers: QuizAnswer[], sender: string, senderName: string, receivedAnswers: Answer[]) {
        const otherAnswers = quizAnswers?.filter((quizAnswer) => quizAnswer.userId !== sender) ?? []
        const maybeOldAnswer = quizAnswers?.find((quizAnswer) => quizAnswer.userId === sender)
        const quizAnswer = {
            userId: sender,
            userName: senderName,
            answers: this.populate(receivedAnswers, maybeOldAnswer)
        }
        const newQuizAnswers = [...otherAnswers, quizAnswer]
        return {quizAnswer, newQuizAnswers};
    }

    private populate(updatedAnswers: Answer[], maybeOldAnswer: QuizAnswer | undefined) {
        if (maybeOldAnswer === undefined) {
            return updatedAnswers.map((answer, index) => {
                return {
                    questionNumber: answer?.questionNumber ?? index,
                    actualAnswer: answer?.answer ?? [],
                    expectedAnswer: []
                }
            });
        } else if (updatedAnswers.length >= maybeOldAnswer.answers.length) {
            return updatedAnswers.map((answer, index) => {
                return {
                    questionNumber: answer?.questionNumber ?? index,
                    actualAnswer: answer?.answer ?? maybeOldAnswer?.answers[index]?.actualAnswer ?? [],
                    expectedAnswer: []
                }
            });
        } else {
            return maybeOldAnswer.answers.map((oldAnswer, index) => {
                return {
                    questionNumber: oldAnswer?.questionNumber ?? index,
                    actualAnswer: updatedAnswers[index]?.answer ?? oldAnswer?.actualAnswer ?? [],
                    expectedAnswer: updatedAnswers[index]?.answer ?? maybeOldAnswer!.answers[index].expectedAnswer
                }
            });
        }
    }
}