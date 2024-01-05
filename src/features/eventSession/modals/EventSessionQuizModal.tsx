import React, {useEffect, useState} from 'react';
import {Broadcaster} from '../../../application/messaging/Broadcaster';
import ReactDOM from "react-dom/client";
import {miroProxy} from "../../../api/MiroProxy";
import {Answer, EventSessionQuizAnswer} from "../broadcast/message/EventSessionQuizAnswer";
import {CopilotSession, copilotSession$} from "../../../application/CopilotSession";
import {v4 as uuidv4} from 'uuid';
import {initialize} from "../../../utils/AppInitializer";

interface QuestionProps {
    question: string;
    answers: string[];
    questionNumber: number;
    selectedAnswers: string[];
    setSelectedAnswers: (questionNumber: number, answers: string[]) => void;
}

interface Question {
    question: string;
    answers: string[];
    correctAnswers: string[];
}

export async function loadQuestions(): Promise<Question[]> {
    const response = await fetch('/src/features/eventSession/resources/conceptIntroductionQuestions.json');
    const questions: Question[] = await response.json();
    return questions;
}

const Question: React.FC<QuestionProps> = ({
                                               question,
                                               answers,
                                               questionNumber,
                                               selectedAnswers,
                                               setSelectedAnswers
                                           }) => {
    const handleAnswerChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const answer = event.target.value;
        if (event.target.checked) {
            setSelectedAnswers(questionNumber, [...selectedAnswers, answer]);
        } else {
            setSelectedAnswers(questionNumber, selectedAnswers?.filter(a => a !== answer));
        }
    };

    return (
        <form>
            <div className="font-lato my-2 py-2">{questionNumber + 1}. {question}</div>
            {answers.map((answer, index) => (
                <div key={index}>
                    <input
                        className="mx-1 px-2"
                        type="checkbox"
                        id={`answer${index}`}
                        name="answer"
                        value={answer}
                        checked={selectedAnswers?.includes(answer)}
                        onChange={handleAnswerChange}
                    />
                    <label className="font-lato text-sm px-2" htmlFor={`answer${index}`}>{answer}</label>
                </div>
            ))}
        </form>
    );
};


const EventSessionQuizModal: React.FC = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const sender = urlParams.get('sender') ?? "facilitator";
    const senderName = urlParams.get('senderName') ?? "facilitator";

    console.log("sender", sender)
    console.log("senderName", senderName)

    const broadcaster = new Broadcaster(miroProxy);
    const [questions, setQuestions] = useState([] as any[])
    const [copilotSession, setCopilotSession] = useState(copilotSession$.value as CopilotSession);
    useEffect(() => {
        initialize()
    }, []);

    useEffect(() => {
        loadQuestions().then(setQuestions);
    }, []);

    useEffect(() => {
        const subscription = copilotSession$.subscribe(maybeCopilotSession => {
            console.log("maybeCopilotSession", maybeCopilotSession)
            if (maybeCopilotSession) {
                setCopilotSession(maybeCopilotSession);
            }
        })
        return () => {
            subscription.unsubscribe()
        }
    }, []);

    const [answers, setAnswers] = useState<Answer[]>([]);

    const setSelectedAnswers = (questionNumber: number, selection: string[]) => {
        const newAnswers = [...answers];
        newAnswers[questionNumber] = new Answer(questionNumber, selection);
        setAnswers(newAnswers);
    };

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        const message = new EventSessionQuizAnswer(
            uuidv4(), sender, null,
            copilotSession?.miroUserId,
            copilotSession?.miroUsername ?? "",
            answers);
        broadcaster.broadcast(message);
    };

    return (
        <div className="w-full">
            <div className="w-full title title-modal centered">Quiz</div>
            <div className="w-full text-left font-lato space-y-2">
                {questions.map((question, index) => (
                    <Question
                        key={index}
                        question={question.question}
                        answers={question.answers}
                        questionNumber={index}
                        selectedAnswers={answers[index]?.answer ?? []}
                        setSelectedAnswers={setSelectedAnswers}
                    />
                ))}
                <div className="w-full py-2 centered">
                    <button className="btn btn-primary btn-primary-modal px-2" onClick={handleSubmit}>Submit
                    </button>
                </div>
            </div>
        </div>
    );
};

const root = ReactDOM.createRoot(document.getElementById('quiz-root') as HTMLElement);
root.render(<EventSessionQuizModal/>);