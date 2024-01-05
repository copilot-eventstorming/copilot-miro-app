import {TQuestion} from "../types/QuizTypes";

export class LoadEventSessionQuizService {
    constructor() {
    }

    async loadEventSessionQuiz() {
        const response = await fetch('/src/features/eventSession/resources/conceptIntroductionQuestions.json');
        const questions: TQuestion[] = await response.json();
        return questions;
    }
}