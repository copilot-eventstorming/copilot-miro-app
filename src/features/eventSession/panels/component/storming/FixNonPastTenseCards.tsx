import React from "react";
import {GPTAnalysisBase} from "../../../../../component/GPTComponent";
import {WorkshopBoardSPI, WorkshopCard} from "../../../../../application/spi/WorkshopBoardSPI";
import {CopilotSession} from "../../../../../application/CopilotSession";
import {FixCandidate, FixEventNotPastTenseByGPTService} from "../../../service/FixEventNotPastTenseByGPTService";
import {prettifyContent} from "../../../../../application/service/utils/utils";

interface FixNonPastTenseCardsProps {
    boardSPI: WorkshopBoardSPI;
    cards: WorkshopCard[];
    setCards: (cards: WorkshopCard[]) => void;
    copilotSession: CopilotSession;
}

export const FixNonPastTenseCards: React.FC<FixNonPastTenseCardsProps> = ({
                                                                       boardSPI, copilotSession, cards, setCards
                                                                   }) => {

    const gptService = new FixEventNotPastTenseByGPTService()
    const [gptData, setGptData] = React.useState<FixCandidate[]>([])
    return (<div className="w-full my-2 mb-4">

            <GPTAnalysisBase
                boardSPI={boardSPI}
                copilotSession={copilotSession}
                cards={cards}
                setGptData={setGptData}
                setCards={setCards}
                gptService={gptService}
             actionName = "Fix Non Past Tense Cards" />
            <div className="w-full">
                <table className="w-full">
                    <thead>
                    <tr>
                        <th className='header header-panel'>Event Name</th>
                        <th className='header header-panel'>Solution</th>
                        <th className={'header header-panel'}>Action</th>
                    </tr>
                    </thead>
                    <tbody>
                    {gptData.map((data, index) => (
                        <tr key={index} className={index % 2 === 0 ? 'odd_row' : 'even_row'}>
                            <td className="text-cell text-cell-panel  clickable-label"
                                onClick={() => {
                                    boardSPI.zoomToCard(data.eventCardId)
                                }}>{data.eventName}</td>
                            <td className="text-cell text-cell-panel">{data.fixCandidate}</td>
                            <td className="text-cell text-cell-panel">
                                <button className="btn btn-secondary btn-secondary-panel" onClick={() => {
                                    const targetCard = cards.find((card) => card.id === data.eventCardId)
                                    console.log("targetCard", targetCard, data.eventCardId)
                                    if (targetCard) {
                                        prettifyContent(targetCard, data.fixCandidate)
                                        miro.board.sync(targetCard)
                                            .catch((err) => {
                                                console.log(err)
                                            })
                                    }
                                }}>Fix
                                </button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}