import * as React from "react";
import {GraphOptimizerContext} from "../context/GraphOptimizerContext";
import {
    handleClusterAnalysis,
    handleMaybeProblems,
    handleOptimizeConnector,
    handleOptimizeLayout
} from "../../utils/OptimizerButtonsUtils";

const OptimizerButtons = () => {
    const {
        boardSPI,
        widthPadding,
        heightPadding,
        verticalOverlapThreshold,
        horizontalOverlapThreshold,
        consoleOutput,
        setConsoleOutput,
        setShowClusterAnalysisResult,
        setShowMaybeProblems,
        saveActions,
        setOptionsDrawerOpen,
        setAmbiguousDistanceThreshold,
        setMaxDistanceDiff,
        setMinDistanceDiff,
        setStep,
        setClusterAnalysisResult,
        ambiguousDistanceThreshold,
        setMaybeProblems,
    } = React.useContext(GraphOptimizerContext);

    return <div className="btn-container-panel">
        <button className="btn btn-primary btn-primary-panel"
                onClick={
                    handleOptimizeLayout(widthPadding, heightPadding,
                        verticalOverlapThreshold, horizontalOverlapThreshold,
                        setConsoleOutput, consoleOutput,
                        setShowClusterAnalysisResult, setShowMaybeProblems,
                        saveActions, boardSPI)
                }

        >Optimize Layout
        </button>

        <button className="btn btn-primary btn-primary-panel"
                onClick={handleOptimizeConnector(setConsoleOutput,
                    setOptionsDrawerOpen, setShowClusterAnalysisResult, setShowMaybeProblems, boardSPI
                )}>Optimize
            Connector
        </button>

        <button className="btn btn-primary btn-primary-panel"
                onClick={handleClusterAnalysis(setConsoleOutput,
                    setOptionsDrawerOpen, setShowClusterAnalysisResult, setClusterAnalysisResult, setShowMaybeProblems,
                    setAmbiguousDistanceThreshold, setMaxDistanceDiff, setMinDistanceDiff, setStep, boardSPI
                )}>Explore Analysis
        </button>

        <button className="btn btn-primary btn-primary-panel"
                onClick={handleMaybeProblems(setConsoleOutput,
                    setOptionsDrawerOpen, setShowClusterAnalysisResult, setShowMaybeProblems,
                    ambiguousDistanceThreshold, setMaybeProblems, boardSPI
                )}>Problem Diagnose
        </button>
    </div>;
}



export {OptimizerButtons};