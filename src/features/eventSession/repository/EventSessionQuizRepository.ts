import {findLocally, saveLocally, SaveResult} from "../../../utils/localStorage";

export interface Answer {
    questionNumber: number;
    actualAnswer: string[];
    expectedAnswer: string[];
}

export interface QuizAnswer {
    userId: string;
    userName: string;
    answers: Answer[];
}

export class EventSessionQuizRepository {
    private readonly boardId: string;

    constructor(boardId: string) {
        this.boardId = boardId;
    }

    key(boardId: string): string {
        return `event-session-quiz-${boardId}`;
    }

    saveQuizAnswer(quizAnswer: QuizAnswer[]): Promise<SaveResult> {
        return saveLocally(this.key(this.boardId), quizAnswer);
    }

    loadQuizAnswer(): Promise<QuizAnswer[]> {
        return findLocally(this.key(this.boardId))
    }

}