import {WorkshopBoardSPI} from "../../../application/spi/WorkshopBoardSPI";
import {TClusterAnalysisResult} from "./ExploreAnalysisResultTableTypes";

export type TAnalysisResultProps = {
    boardSPI: WorkshopBoardSPI;
    clusterAnalysisResult: TClusterAnalysisResult[];
}