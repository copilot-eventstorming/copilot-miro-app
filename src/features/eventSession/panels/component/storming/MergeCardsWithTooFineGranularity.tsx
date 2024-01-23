import {WorkshopBoardSPI, WorkshopCard} from "../../../../../application/spi/WorkshopBoardSPI";
import {
    TInvalidDomainEventCandidate,
    TValidateDomainEventResponse, TValidDomainEventCandidate,
    ValidateDomainEventService
} from "../../../service/ValidateDomainEventService";
import {cleanHtmlTag} from "../../../../../application/service/utils/utils";
import {contentEquals} from "../../../../../utils/WorkshopCardUtils";
import {DropEventService} from "../../../service/DropEventService";
import {Tab, TabList, TabPanel, Tabs} from "react-tabs";
import React, {useEffect, useState} from "react";


function analysisByCopilot(eventCards: WorkshopCard[], service: ValidateDomainEventService, setAnalysisResult: (value: (((prevState: TValidateDomainEventResponse) => TValidateDomainEventResponse) | TValidateDomainEventResponse)) => void): Promise<void> {
    const cardNames: string[] = eventCards.map((card) => cleanHtmlTag(card.content))
    return service.perform(cardNames).then(setAnalysisResult)
}

function dropEvent(eventCards: WorkshopCard[], event: TInvalidDomainEventCandidate, boardSPI:
    WorkshopBoardSPI) {
    const card = eventCards
        .find(card => contentEquals(card.content, event.name))
    if (card) {
        const service = new DropEventService(boardSPI)
        service.perform(card)
            .then(() => console.log("dropEvent Success", cleanHtmlTag(card.content)))
            .catch(reason => console.log("dropEvent Failed", reason))
    } else {
        boardSPI.showFailure("Event name might contain special chars")
            .then(() => {/*ignored*/
            })
    }
}


function zoomToEvent(eventCards: WorkshopCard[], event: TInvalidDomainEventCandidate |
    TValidDomainEventCandidate, boardSPI: WorkshopBoardSPI) {
    const card = eventCards
        .find(card => contentEquals(card.content, event.name))
    if (card) boardSPI.zoomToCard(card.id)
}
function AnalysisResult(analysisResult: TValidateDomainEventResponse, keptEvents: string[], eventCards:
    WorkshopCard[], boardSPI: WorkshopBoardSPI, setKeptEvents: (value: (((prevState: string[]) => string[]) |
    string[])) => void) {
    return <Tabs>
        <TabList>
            <Tab>
                <div className="text-cell text-cell-panel font-bold">Invalid Candidates</div>
            </Tab>
            <Tab>
                <div className="text-cell text-cell-panel font-bold">Valid Candidates</div>
            </Tab>
        </TabList>
        <TabPanel>
            <table>
                <thead>
                <tr>
                    <th className='header header-panel'>Name</th>
                    <th className='header header-panel'>Reason</th>
                    <th className='header header-panel'>Action</th>
                </tr>
                </thead>
                <tbody>
                {analysisResult.invalidDomainEvents
                    .filter(candidate => !keptEvents.includes(candidate.name))
                    .map((event: TInvalidDomainEventCandidate, index: number) => (
                        <tr key={index} className={index % 2 === 0 ? 'odd_row' : 'even_row'}>
                            <td className="text-cell text-cell-panel clickable-label" onClick={
                                () => {
                                    zoomToEvent(eventCards, event, boardSPI);
                                }
                            }>{event.name}</td>
                            <td className="text-cell text-cell-panel">{event.reason}</td>
                            <td>
                                <button className="btn btn-secondary btn-secondary-panel" onClick={() => {
                                    if (event.fix.action === 'drop') {
                                        dropEvent(eventCards, event, boardSPI)
                                    }
                                }}>{event.fix.action}
                                </button>
                                <button className="btn btn-secondary btn-secondary-panel" onClick={() => {
                                    setKeptEvents([...keptEvents, event.name])
                                }}>Keep
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </TabPanel>
        <TabPanel>
            <table>
                <thead>
                <tr>
                    <th className='header header-panel'>Name</th>
                    <th className='header header-panel'>Comment</th>
                </tr>
                </thead>
                <tbody>
                {analysisResult.validDomainEvents
                    .concat(keptEvents.map((name) => ({name, comments: 'Kept'})))
                    .map((event: TValidDomainEventCandidate, index: number) => (
                        <tr key={index} className={index % 2 === 0 ? 'odd_row' : 'even_row'}>
                            <td className="text-cell text-cell-panel  clickable-label" onClick={
                                () => {
                                    zoomToEvent(eventCards, event, boardSPI);
                                }
                            }>{event.name}</td>
                            <td className="text-cell text-cell-panel">{event.comments}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </TabPanel>
    </Tabs>
        ;
}


const EventAnalysis: React.FC<{ boardSPI: WorkshopBoardSPI }> = ({
                                                                     boardSPI
                                                                 }) => {
    const service = new ValidateDomainEventService()
    const [eventCards, setEventCards] = useState([] as WorkshopCard[])
    const [analysisResult, setAnalysisResult] = useState({
        validDomainEvents: [], invalidDomainEvents: []
    } as TValidateDomainEventResponse)
    const [keptEvents, setKeptEvents] = useState([] as string[])
    const [isLoading, setIsLoading] = useState(false) // 新增一个状态来跟踪异步操作是否正在进行

    useEffect(() => {
        boardSPI.fetchEventCards().then((cards) => {
            setEventCards(cards)
        })
    }, []);


    return (
        <div className="w-full">
            <div className="divider w-full"/>
            <div className="w-full centered relative"> {/* 添加 relative 类 */}
                <button className="btn btn-primary btn-secondary-panel centered" onClick={() => {
                    setIsLoading(true)
                    analysisByCopilot(eventCards, service, setAnalysisResult)
                        .then(() => setIsLoading(false))
                }
                }>Analysis by Copilot
                </button>
                {isLoading && <div className="spinner" style={{
                    position: 'absolute',
                    top: 'calc(100%)',
                    left: '42%',
                    transform: 'translateX(-50%)'
                }}></div>}
            </div>
            <div className="w-full">
                {
                    !isLoading && (analysisResult.validDomainEvents.length > 0 || analysisResult.invalidDomainEvents.length > 0)
                    && AnalysisResult(analysisResult, keptEvents, eventCards, boardSPI, setKeptEvents)}
            </div>
        </div>
    )
}
