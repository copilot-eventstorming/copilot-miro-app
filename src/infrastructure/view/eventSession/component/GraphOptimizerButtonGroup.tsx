import * as React from "react";
import {Dispatch, SetStateAction, useState} from "react";
import {OptimizeReadModel} from "./OptimizeReadModel";
import {OperationLogChannel} from "../../../channel/channelNames";
import {OperationLogDeleted, OperationLogRestore} from "../../operationLogs/OperationLogEvent";
import {SaveActions} from "../../../../application/repository/SaveActions";
import {WorkshopBoardSPI} from "../../../../application/gateway/WorkshopBoardSPI";
import {ClusterAnalysisResult} from "./ExploreAnalysisResultTable";
import {OptimizerButtons} from "./OptimizerButtons";
import {OptimizerOptions} from "./OptimizerOptions";
import {SaveOperation} from "./SaveOperation";
import {ProblematicCard} from "../../../../application/service/graph/AffiliationDistinctionProblemDiagnoseService";

interface GraphOptimizerContextProps {
    boardSPI: WorkshopBoardSPI;
    consoleOutput: string;
    showClusterAnalysisResult: boolean;
    setShowClusterAnalysisResult: Dispatch<SetStateAction<boolean>>;

    clusterAnalysisResult: ClusterAnalysisResult[];
    setClusterAnalysisResult: Dispatch<SetStateAction<ClusterAnalysisResult[]>>;

    maybeProblems: ProblematicCard[];
    setMaybeProblems: Dispatch<SetStateAction<ProblematicCard[]>>;

    showMaybeProblems: boolean;
    setShowMaybeProblems: Dispatch<SetStateAction<boolean>>;
    setConsoleOutput: Dispatch<SetStateAction<string>>;
    optionsDrawerOpen: boolean;
    setOptionsDrawerOpen: Dispatch<SetStateAction<boolean>>;
    widthPadding: number;
    setWidthPadding: Dispatch<SetStateAction<number>>;
    heightPadding: number;
    setHeightPadding: Dispatch<SetStateAction<number>>;
    horizontalOverlapThreshold: number;
    setHorizontalOverlapThreshold: Dispatch<SetStateAction<number>>;
    verticalOverlapThreshold: number;
    setVerticalOverlapThreshold: Dispatch<SetStateAction<number>>;
    ambiguousDistanceThreshold: number;
    setAmbiguousDistanceThreshold: Dispatch<SetStateAction<number>>;
    minDistanceDiff: number;
    setMinDistanceDiff: Dispatch<SetStateAction<number>>;
    maxDistanceDiff: number;
    setMaxDistanceDiff: Dispatch<SetStateAction<number>>;
    step: number;
    setStep: Dispatch<SetStateAction<number>>;
    saveActions: SaveActions | null;
    setSaveActions: Dispatch<SetStateAction<SaveActions | null>>;
    undoDisabled: boolean;
    setUndoDisabled: Dispatch<SetStateAction<boolean>>;
    redoDisabled: boolean;
    setRedoDisabled: Dispatch<SetStateAction<boolean>>;
    undoQty: number;
    setUndoQty: Dispatch<SetStateAction<number>>;
    redoQty: number;
    setRedoQty: Dispatch<SetStateAction<number>>;

    handleWidthPaddingChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    handleHeightPaddingChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    handleHorizontalOverlapThresholdChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    handleVerticalOverlapThresholdChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export const GraphOptimizerContext = React.createContext<GraphOptimizerContextProps>({} as GraphOptimizerContextProps);

interface GraphOptimizerButtonGroupProps {
    boardSPI: WorkshopBoardSPI;
    consoleOutput: string;
    setConsoleOutput: Dispatch<SetStateAction<string>>;
}

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
            boardSPI,
            consoleOutput,
            setConsoleOutput,
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