import * as React from "react";
import {TProblemTableProps} from "../../types/ProblemTableTypes";
import {ProblematicCard} from "../../../../application/service/graph/AffiliationDistinctionProblemDiagnoseService";
import {WorkshopBoardSPI} from "../../../../application/spi/WorkshopBoardSPI";


function ProblemRow(index: number, rowClass: string, problem: ProblematicCard, boardSPI: WorkshopBoardSPI) {
    return (
        <tr key={index} className={rowClass}>
            <td className="nameCell text-xs text-gray-900 t">
                {problem.category}
            </td>
            <td className="nameCell text-xs ">
                <label className="clickable-label h-full content-center justify-center"
                       onClick={() => boardSPI.zoomToCard(problem.satelliteCardId)}>
                    {problem.satelliteCardName}
                </label>
            </td>
            <td className="nameCell">
                <div style={{display: 'flex', flexDirection: 'column'}}>
                    <label className="clickable-label" style={{fontSize: '12px'}}
                           onClick={() => boardSPI.zoomToCard(problem.candidateCentralOne.id)}>
                        {problem.candidateCentralOne.name}
                    </label>
                    {problem.candidateCentralOther && (
                        <label className="clickable-label" style={{fontSize: '12px'}}
                               onClick={() => boardSPI.zoomToCard(problem.candidateCentralOther!.id)}>
                            {problem.candidateCentralOther!.name}</label>)}
                </div>
            </td>
            <td className="number-cell" style={{fontSize: '12px'}}>{problem.diff}</td>
        </tr>
    );
}

export const ProblemTable: React.FC<TProblemTableProps> = ({boardSPI, problems, setConsoleOutput}) => {
    return (
        <div className="mx-4 overflow-y-auto max-h-60">
            <div className="sub-title text-lg w-full text-center ">Possible Problems</div>
            <div>
                <table style={{"width": "100%"}}>
                    <thead>
                    <tr>
                        <th className="header text-xs">Type</th>
                        <th className="header text-xs">Hotspot</th>
                        <th className="header text-xs">Events</th>
                        <th className="header text-xs">Distinction</th>
                    </tr>
                    </thead>
                    <tbody>
                    {
                        problems.map((problem, index) => {
                            const rowClass = index % 2 === 0 ? "even_row" : "odd_row";
                            return ProblemRow(index, rowClass, problem, boardSPI)
                        })
                    }
                    </tbody>
                </table>
            </div>
        </div>
    )
}