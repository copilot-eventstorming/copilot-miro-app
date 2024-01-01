import {WorkshopBoardSPI} from "../../../application/spi/WorkshopBoardSPI";

export type TClusterAnalysisResult = {
    itemId: string;
    percentileName: string;
    distance: string;
    itemName: string;
}

export type TExploreAnalysisResultTableProps = {
    boardSPI: WorkshopBoardSPI;
    clusterAnalysisResult: TClusterAnalysisResult[];
}