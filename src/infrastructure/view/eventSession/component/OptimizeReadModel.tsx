import {ExploreAnalysisResultTable} from "./ExploreAnalysisResultTable";
import {ProblemTable} from "./ProblemTable";
import * as React from "react";
import {useContext} from "react";
import {GraphOptimizerContext} from "./GraphOptimizerButtonGroup";
import {WorkshopBoardSPI} from "../../../../application/gateway/WorkshopBoardSPI";

interface AnalysisResultProps {
    boardSPI: WorkshopBoardSPI;
    clusterAnalysisResult: any[];
}

const AnalysisResult: React.FC<AnalysisResultProps> = ({boardSPI, clusterAnalysisResult}) => <>
    <div className="divider mx-4"/>
    <ExploreAnalysisResultTable boardSPI={boardSPI} clusterAnalysisResult={clusterAnalysisResult} />
</>;

const OptimizeReadModel: React.FC = () => {
    const {
        boardSPI,
        showClusterAnalysisResult,
        clusterAnalysisResult,
        showMaybeProblems,
        maybeProblems,
        setConsoleOutput
    } = useContext(GraphOptimizerContext);

    const ProblemDiagnoseResult: React.FC = () => <>
        <div className="divider mx-5"/>
        <ProblemTable boardSPI={boardSPI} problems={maybeProblems} setConsoleOutput={setConsoleOutput}/>
    </>;

    return <>
        {showClusterAnalysisResult && <AnalysisResult boardSPI={boardSPI} clusterAnalysisResult={clusterAnalysisResult} />}
        {showMaybeProblems && <ProblemDiagnoseResult />}
    </>;
}

export {OptimizeReadModel}