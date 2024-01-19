import {EventFeedback, ParticipantFeedback} from "../../../repository/EventSessionVoteRepository";
import {WorkshopBoardSPI, WorkshopCard} from "../../../../../application/spi/WorkshopBoardSPI";
import React, {useEffect, useState} from "react";
import {Familiarity, Impact, Interest} from "../../../types/EventFeedbackMetricNames";
import {cleanHtmlTag} from "../../../../../application/service/utils/utils";
import {contentWithoutSpace} from "../../../../../utils/WorkshopCardUtils";
import {convertToEventScore} from "../../../utils/IgnoreLowValueCardsUtils";
import {EventScore} from "../../../types/EventScore";

type IgnoreLowValueCardsProps = {
    boardSPI: WorkshopBoardSPI
    feedbacks: ParticipantFeedback[]
    cards: WorkshopCard[]
}


export const IgnoreLowValueCards: React.FC<IgnoreLowValueCardsProps> = ({boardSPI, feedbacks, cards}) => {
    const [eventScores, setEventScores] = useState<EventScore[]>([])
    useEffect(() => {
        setEventScores(convertToEventScore(feedbacks))
    }, [feedbacks])

    return (<div className="w-full">
        <table className="w-full">
            <thead>
            <tr>
                <td className="header header-panel">Event Name</td>
                <td className="header header-panel">Impact</td>
                <td className="header header-panel">Interest</td>
                <td className="header header-panel">Familiarity</td>
                <td className="header header-panel">Action</td>
            </tr>
            </thead>
            <tbody>
            {eventScores.map((eventScore, index) => {
                return (<tr key={index} className={`${index % 2 === 0 ? "even_row" : "odd_row"} w-full `}>
                    <td className="text-cell text-cell-panel clickable-label" onClick={
                        () => {
                            const card = cards.find(card => contentWithoutSpace(card.content) === contentWithoutSpace(eventScore.eventName))
                            if (card) {
                                boardSPI.zoomToCard(card.id)
                            }
                        }
                    }>{eventScore.eventName}</td>
                    <td className="number-cell number-cell-panel">{eventScore.importanceScore.toFixed(2)}</td>
                    <td className="number-cell number-cell-panel">{eventScore.interestScore.toFixed(2)}</td>
                    <td className="number-cell number-cell-panel">{eventScore.familiarScore.toFixed(2)}</td>
                    <td>
                        <button className="btn btn-secondary btn-secondary-panel mx-2">Call</button>
                    </td>
                </tr>)
            })}
            </tbody>
        </table>
    </div>)
}

