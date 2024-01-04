import React, {useEffect, useState} from "react"
import {AddEventStormingSampleService} from "../../service/AddEventStormingSampleService";
import {WorkshopBoardSPI} from "../../../../application/spi/WorkshopBoardSPI";
import {Hotspot} from "../../types/Hotspot";
import {FetchHotspotsService} from "../../service/FetchHotspotsService";
import {Shape} from "@mirohq/websdk-types";


type TConceptIntroductionPanelProps = {
    boardSPI: WorkshopBoardSPI
}
function truncateString(str: string, maxLength: number): string {
    if (str.length > maxLength) {
        return str.slice(0, maxLength) + '...';
    } else {
        return str;
    }
}
export const ConceptIntroductionPanel: React.FC<TConceptIntroductionPanelProps> = ({boardSPI}) => {
    const sampleService = new AddEventStormingSampleService(boardSPI)
    const hotspotService = new FetchHotspotsService(boardSPI)
    const [hotspots, setHotspots] = useState<Hotspot[]>([])
    useEffect(() => {
        hotspotService.fetchHotspots().then(setHotspots)
    }, [])
    return (<div className="flex flex-col w-full">
        <div className="flex flex-col w-full my-4 px-4 py-2 font-lato text-sm">
            <b>Core Concepts</b>
            <li>Domain Event and Granularity</li>
            <b>Notions</b>
            <li>Domain Event Sticky Note</li>
            <li>Hotspot Shape</li>
            <b>Processes</b>
            <li>Resolve Hotspot</li>
            <li>Vote for Domain Event Acceptance</li>
        </div>
        <div className="flex flex-row w-full centered">
            <div className="px-2 py-2">
                <button className="btn btn-primary btn-primary-panel px-2" onClick={() => {
                    sampleService.addSample()
                }}>Add Sample
                </button>
            </div>
            <div className="px-2 py-2">
                <button className="btn btn-primary btn-primary-panel px-2" onClick={() => {
                    sampleService.clearBoard()
                }}>Clear Board
                </button>
            </div>
        </div>
        <div className="divider"/>

        <div>
            <div className="sub-title sub-title-panel">Hotspot List</div>
            <table className="w-full">
                <thead>
                <tr>
                    <th className="header header-panel">Hotspot Content</th>
                    <th className="header header-panel">Created By</th>
                    <th className="header header-panel">Resolved</th>
                </tr>
                </thead>
                <tbody>
                {hotspots.map((item, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'odd_row' : 'even_row'}>
                        <td className="text-cell text-cell-panel clickable-label"
                            onClick={() => boardSPI.zoomToCard(item.id)} title={item.content}>{truncateString(item.content, 30)}</td>
                        <td className="text-cell text-cell-panel">{item.createdBy}</td>
                        <td className="text-cell text-cell-panel centered"><input type='checkbox'
                                                                                  checked={item.resolved}
                                                                                  onChange={() => {
                                                                                      if (item.resolved) {
                                                                                          hotspotService.unresolveHotspot(item.card as Shape).then(setHotspots)
                                                                                      } else {
                                                                                          hotspotService.resolveHotspot(item.card as Shape).then(setHotspots)
                                                                                      }
                                                                                  }}/>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
        <div>

        </div>
    </div>)
}