import ReactDOM from "react-dom/client";
import * as React from "react";
import {useEffect} from "react";
import {initialize} from "../../utils/AppInitializer";
import {WorkshopBoardSPI, WorkshopCard} from "../../application/spi/WorkshopBoardSPI";
import {WorkshopBoardService} from "../../api/WorkshopBoardService";
import {miroProxy} from "../../api/MiroProxy";
import {Broadcaster} from "../../application/messaging/Broadcaster";
import {FixSuggestion, FixSuggestionTypeLabel} from "../types/FixSuggestion";
import {CopilotSession, copilotSession$} from "../../application/CopilotSession";
import {FixSuggestionApplicationService} from "../../application/service/correction/FixSuggestionApplicationService";


const boardSPI: WorkshopBoardSPI = new WorkshopBoardService(miroProxy);
const broadcaster: Broadcaster = new Broadcaster(miroProxy);


type FixProblemPanelProps = {}
const ProblemFixSuggestionsPanel: React.FC<FixProblemPanelProps> = () => {

    const url = new URL(window.location.href);
    const title = url.searchParams.get("title") || "Fix Problem";
    const sender = url.searchParams.get("sender") || "facilitator";
    const subjectHeader = url.searchParams.get("subjectHeader") || "Content";
    const [fixSuggestions, setFixSuggestions] = React.useState<FixSuggestion[]>(JSON.parse(url.searchParams.get("fixSuggestions") || "[]"));
    const [fixSuggestionTypeLabel, setFixSuggestionTypeLabel] = React.useState("Issues");
    const [cards, setCards] = React.useState<WorkshopCard[]>([]);
    const [copilotSession, setCopilotSession] = React.useState<CopilotSession>(copilotSession$.value);
    const fixService = new FixSuggestionApplicationService(boardSPI, broadcaster);
    useEffect(() => {
        initialize()
    }, []);

    useEffect(() => {
        boardSPI.fetchEventCards().then(setCards);
        const subscription = copilotSession$.subscribe(maybeCopilotSession => {
            if (maybeCopilotSession) {
                setCopilotSession(maybeCopilotSession);
            }
        })
        return () => {
            subscription.unsubscribe()
        }
    }, []);

    useEffect(() => {
        if (fixSuggestions.length >= 1) {
            setFixSuggestionTypeLabel(
                FixSuggestionTypeLabel[fixSuggestions[0].typeName]
            )
        } else {

        }
    }, [fixSuggestions]);


    return (
        <div className="w-full">
            <div className="title title-panel">{fixSuggestionTypeLabel}</div>
            {fixSuggestions.length > 0 && (
                <table className="w-full">
                    <thead>
                    <tr>
                        <th className="header header-panel w-[40%]">{subjectHeader}</th>
                        <th className="header header-panel w-[40%]">Suggestions</th>
                        <th className="header header-panel w-[20%]">Action</th>
                    </tr>
                    </thead>
                    <tbody>
                    {fixSuggestions.map((fixSuggestion, index) => (
                        <tr key={index} className={index % 2 === 0 ? "even_row" : "odd_row"}>
                            <td className="text-cell text-cell-panel clickable-label">{fixSuggestion.text.map(s =>
                                (<li key={s} className="list-none" onClick={() => {
                                    const target: WorkshopCard | null = cards.find(card => card.id === fixSuggestion.id
                                        && card.createdBy === copilotSession.miroUserId)
                                    if (target) {
                                        boardSPI.zoomToCard(target.id)
                                    }
                                }}>{s}</li>))}</td>
                            <td className="text-cell text-cell-panel ">
                                {fixSuggestion.suggestion.map((suggestion, index) => (
                                    <li key={index} className=" list-none">{suggestion}</li>))}
                            </td>
                            <td className="text-cell text-cell-panel centered">
                                <button className="btn btn-secondary btn-secondary-panel px-2"
                                        onClick={() =>
                                            fixService.performFixSuggestion(copilotSession.miroUserId,
                                                copilotSession.miroUsername, sender, fixSuggestion)
                                                .then(() => {
                                                    setFixSuggestions(fixSuggestions.filter(s => s.id !== fixSuggestion.id))
                                                })}> Fix
                                < /button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>)}
            {fixSuggestions.length === 0 && (
                <div className="w-full text-center">
                    <div className="text-cell text-cell-panel text-center">No {fixSuggestionTypeLabel} Left.</div>

                </div>
            )}
            <div className="w-full text-center">
                <button className="btn btn-primary-panel btn-primary px-4 my-4" onClick={() =>
                    miro.board.ui.closePanel()
                }> Close
                </button>
            </div>
        </div>
    );
}


const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(<ProblemFixSuggestionsPanel/>);