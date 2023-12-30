import React from "react";
import {WorkshopBoardCoreCards, WorkshopCard} from "../../../../application/gateway/WorkshopBoardSPI";


interface ISummaryBoardProps {
    id: string;
    name: string;
    boardSummary: WorkshopBoardCoreCards;
}

interface SummaryItem {
    category: string;
    total: number;
    unique: number;
    blank: number;
}

const SummaryBoard: React.FC<ISummaryBoardProps> = ({id, name, boardSummary}) => {

    const summary: SummaryItem[] = [
        {
            category: 'Bounded Contexts',
            total: boardSummary.BoundedContexts.length,
            unique: new Set(boardSummary.BoundedContexts.map(card => card.content)).size,
            blank: boardSummary.BoundedContexts.filter((card: WorkshopCard) => card.content.length <= 0).length
        },
        {
            category: 'Subdomains',
            total: boardSummary.Subdomains.length,
            unique: new Set(boardSummary.Subdomains.map(card => card.content)).size,
            blank: boardSummary.Subdomains.filter((card: WorkshopCard) => card.content.length <= 0).length
        },
        {
            category: 'Aggregates',
            total: boardSummary.Aggregates.length,
            unique: new Set(boardSummary.Aggregates.map(card => card.content)).size,
            blank: boardSummary.Aggregates.filter((card: WorkshopCard) => card.content.length <= 0).length
        },
        {
            category: 'Commands',
            total: boardSummary.Commands.length,
            unique: new Set(boardSummary.Commands.map(card => card.content)).size,
            blank: boardSummary.Commands.filter((card: WorkshopCard) => card.content.length <= 0).length
        },
        {
            category: 'Events',
            total: boardSummary.Events.length,
            unique: new Set(boardSummary.Events.map(card => card.content)).size,
            blank: boardSummary.Events.filter((card: WorkshopCard) => card.content.length <= 0).length
        },
    ]

    return (
        <div className="flex justify-center items-center flex-col w-full">
            <div className="sub-title sub-title-modal">Board Summary</div>
            <div className="w-full flex flex-col justify-center px-36">
                <table>
                    <thead>
                    <tr className="w-full">
                        <th className="header-modal">Category</th>
                        <th className="header-modal text-right">Total</th>
                        <th className="header-modal text-right">Unique</th>
                        <th className="header-modal text-right">Blank</th>
                    </tr>
                    </thead>
                    <tbody>
                    {summary.map((item) => (<tr key={item.category}>
                        <td className="text-cell text-cell-modal">{item.category}</td>
                        <td className="number-cell number-cell-modal">{item.total}</td>
                        <td className="number-cell number-cell-modal">{item.unique}</td>
                        <td className="number-cell number-cell-modal">{item.blank}</td>
                    </tr>))}
                    </tbody>
                </table>
            </div>
        </div>)
}

export {SummaryBoard};