import {TQuestion} from "../types/QuizTypes";
// @ts-ignore
import conceptIntroductionQuestions from "@/features/eventSession/resources/conceptIntroductionQuestions.json";
export class LoadEventSessionQuizService {
    constructor() {
    }

    async loadEventSessionQuiz() {
        // const response = await fetch('/src/features/eventSession/resources/conceptIntroductionQuestions.json');
        // const questions: TQuestion[] = await response.json();
        // return questions;
        return Promise.resolve(conceptIntroductionQuestions)
    }
}