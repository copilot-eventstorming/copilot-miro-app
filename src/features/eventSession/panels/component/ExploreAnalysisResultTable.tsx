import * as React from "react";
import {WorkshopBoardSPI} from "../../../../application/spi/WorkshopBoardSPI";

export interface ClusterAnalysisResult {
    itemId: string;
    percentileName: string;
    distance: string;
    itemName: string;
}

interface ExploreAnalysisResultTableProps {
    boardSPI: WorkshopBoardSPI;
    clusterAnalysisResult: ClusterAnalysisResult[];
}

export const ExploreAnalysisResultTable: React.FC<ExploreAnalysisResultTableProps> = ({
                                                                                          boardSPI,
                                                                                          clusterAnalysisResult
                                                                                      }) => {
    return (<>
            <div className="w-full">
                <div className="sub-title text-sm w-full text-center">Affiliation Distinction Statistics</div>
                <table className="mx-2 w-full">
                    <thead>
                    <tr>
                        <th className="header text-xs w-1/4">Percentile</th>
                        <th className="header text-xs w-1/4"> Affiliation Distinction</th>
                        <th className="header text-xs w-1/2">Card</th>
                    </tr>
                    </thead>
                    <tbody>
                    {clusterAnalysisResult.map((result, index) => (
                        <tr key={index} className={index % 2 === 0 ? "odd_row" : "even_row"}
                            onClick={() => result.itemId ? boardSPI.zoomToCard(result.itemId) : {}}>
                            <td className="text-cell" style={{"fontSize": 12}}>{result.percentileName}</td>
                            <td className="text-cell" style={{"fontSize": 12}}>{result.distance}</td>
                            <td className="text-cell flex" style={{"fontSize": 12}}>
                                <label className="clickable-label">
                                    {result.itemName}
                                </label>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </>

    )
}