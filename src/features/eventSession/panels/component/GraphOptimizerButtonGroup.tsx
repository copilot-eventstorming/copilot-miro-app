import * as React from "react";
import {OptimizeReadModel} from "./OptimizeReadModel";
import {OperationLogDeleted, OperationLogRestore} from "../../../operationLogs/types/OperationLogEvent";
import {SaveActions} from "../../../../application/repository/SaveActions";
import {OptimizerButtons} from "./OptimizerButtons";
import {OptimizerOptions} from "./OptimizerOptions";
import {SaveOperation} from "./SaveOperation";
import {OperationLogChannel} from "../../../operationLogs/types/OperationLogChannels";
import {GraphOptimizerButtonGroupProps} from "../../types/GraphOptimizerTypes";
import {GraphOptimizerContext} from "../context/GraphOptimizerContext";
import {useState} from "react";
import {ClusterAnalysisResult} from "./ExploreAnalysisResultTable";
import {ProblematicCard} from "../../../../application/service/graph/AffiliationDistinctionProblemDiagnoseService";

export const GraphOptimizerButtonGroup: React.FC<GraphOptimizerButtonGroupProps> = ({
                                                                                        boardSPI,
                                                                                        consoleOutput,
                                                                                        setConsoleOutput
                                                                                    }) => {
    const [optionsDrawerOpen, setOptionsDrawerOpen] = React.useState(false);
    const [widthPadding, setWidthPadding] = useState(0.5); // 添加这一行
    const [heightPadding, setHeightPadding] = useState(0.5); // 添加这一行
    const [horizontalOverlapThreshold, setHorizontalOverlapThreshold] = useState(0.5); // 添加这一行
    const [verticalOverlapThreshold, setVerticalOverlapThreshold] = useState(0.5); // 添加这一行
    const [showClusterAnalysisResult, setShowClusterAnalysisResult] = useState(false); // 添加这一行
    const [clusterAnalysisResult, setClusterAnalysisResult] = useState([
        {percentileName: 'min', distance: '0', itemName: "-", itemId: "-"} as ClusterAnalysisResult,
        {percentileName: '25', distance: '0', itemName: "-", itemId: "-"} as ClusterAnalysisResult,
        {percentileName: '50', distance: '0', itemName: "-", itemId: "-"} as ClusterAnalysisResult,
        {percentileName: '75', distance: '0', itemName: "-", itemId: "-"} as ClusterAnalysisResult,
        {percentileName: 'max', distance: '0', itemName: "-", itemId: "-"} as ClusterAnalysisResult,
    ]); // 添加这一行
    const [ambiguousDistanceThreshold, setAmbiguousDistanceThreshold] = useState(0.5); // 添加这一行
    const [minDistanceDiff, setMinDistanceDiff] = useState(0); // 添加这一行
    const [maxDistanceDiff, setMaxDistanceDiff] = useState(5); // 添加这一行
    const [step, setStep] = useState(0.1); // 添加这一行

    const [showMaybeProblems, setShowMaybeProblems] = useState(false); // 添加这一行
    const [maybeProblems, setMaybeProblems] = useState([] as ProblematicCard[]); // 添加这一行

    const [saveActions, setSaveActions] = React.useState(null as SaveActions | null);
    const [undoDisabled, setUndoDisabled] = React.useState(true);
    const [redoDisabled, setRedoDisabled] = React.useState(true);
    const [undoQty, setUndoQty] = React.useState(0);
    const [redoQty, setRedoQty] = React.useState(0);
    const context = React.useContext(GraphOptimizerContext)
    const operationLogEventChannel = new BroadcastChannel(OperationLogChannel);
    React.useEffect(() => {
        const handleEvent = async (event: MessageEvent) => {
            console.log('GraphOptimizerButtonGroup: receiveMessage', event)
            switch (event.data.type) {
                case OperationLogDeleted:
                    if (saveActions) {
                        saveActions.deleteLogById(event.data.id)
                    }
                    break;
                case OperationLogRestore:
                    if (saveActions) {
                        await saveActions.loadByLogId(event.data.id)
                        await miro.board.ui.closeModal();
                    }
                    break;
            }
        };

        operationLogEventChannel.addEventListener("message", handleEvent)

        // 在 useEffect 的清理函数中移除事件监听器
        return () => {
            operationLogEventChannel.removeEventListener("message", handleEvent);
        };
    }, [saveActions]);
    React.useEffect(() => {
            if (saveActions == null) {
                const f = async () => {
                    const board = await boardSPI.fetchBoardInfo()
                    const actions = new SaveActions(board.id,
                        setUndoDisabled,
                        setRedoDisabled,
                        setUndoQty,
                        setRedoQty,
                        setConsoleOutput,
                        boardSPI);
                    setSaveActions(actions);
                }
                f()
            }
        }
    )
    const handleWidthPaddingChange = (event: React.ChangeEvent<HTMLInputElement>) => { // 添加这个函数
        setWidthPadding(Number(event.target.value));
    };
    const handleHeightPaddingChange = (event: React.ChangeEvent<HTMLInputElement>) => { // 添加这个函数
        setHeightPadding(Number(event.target.value));
    };
    const handleHorizontalOverlapThresholdChange = (event: React.ChangeEvent<HTMLInputElement>) => { // 添加这个函数
        setHorizontalOverlapThreshold(Number(event.target.value));
    };
    const handleVerticalOverlapThresholdChange = (event: React.ChangeEvent<HTMLInputElement>) => { // 添加这个函数
        setVerticalOverlapThreshold(Number(event.target.value));
    };

    const Title = () => <div className="w-full flex items-center">
        <div className="sub-title sub-title-panel">Graph Optimizer</div>
    </div>;
    return (
        <GraphOptimizerContext.Provider value={{
            optionsDrawerOpen,
            setOptionsDrawerOpen,
            widthPadding,
            setWidthPadding,
            heightPadding,
            setHeightPadding,
            horizontalOverlapThreshold,
            setHorizontalOverlapThreshold,
            verticalOverlapThreshold,
            setVerticalOverlapThreshold,
            showClusterAnalysisResult,
            setShowClusterAnalysisResult,
            clusterAnalysisResult,
            setClusterAnalysisResult,
            ambiguousDistanceThreshold,
            setAmbiguousDistanceThreshold,
            minDistanceDiff,
            setMinDistanceDiff,
            maxDistanceDiff,
            setMaxDistanceDiff,
            step,
            setStep,
            showMaybeProblems,
            setShowMaybeProblems,
            maybeProblems,
            setMaybeProblems,
            saveActions,
            setSaveActions,
            undoDisabled,
            setUndoDisabled,
            redoDisabled,
            setRedoDisabled,
            undoQty,
            setUndoQty,
            redoQty,
            setRedoQty,
            boardSPI,
            consoleOutput,
            setConsoleOutput,
            handleWidthPaddingChange,
            handleHeightPaddingChange,
            handleHorizontalOverlapThresholdChange,
            handleVerticalOverlapThresholdChange,
        }}>
            <div>
                <Title/>
                <OptimizerButtons/>
                <OptimizerOptions
                    handleAmbiguousDistanceThresholdChange={handleAmbiguousDistanceThresholdChange(setAmbiguousDistanceThreshold)}
                />
                <OptimizeReadModel/>
                <div className="divider"/>
                <SaveOperation/>
            </div>
        </GraphOptimizerContext.Provider>

    );
}

function handleAmbiguousDistanceThresholdChange(setAmbiguousDistanceThreshold: (value: number) => void) {
    return (event: React.ChangeEvent<HTMLInputElement>) => {
        setAmbiguousDistanceThreshold(Number(event.target.value));
    }
}