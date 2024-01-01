import {WorkshopBoardSPI} from "../../../application/spi/WorkshopBoardSPI";
import {ProblematicCard} from "../../../application/service/graph/AffiliationDistinctionProblemDiagnoseService";

export type TProblemTableProps = {
    boardSPI: WorkshopBoardSPI;
    problems: ProblematicCard[];
    setConsoleOutput: (output: string) => void;
}