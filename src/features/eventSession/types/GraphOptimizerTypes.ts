import {WorkshopBoardSPI} from "../../../application/spi/WorkshopBoardSPI";
import * as React from "react";
import {Dispatch, SetStateAction} from "react";
import {ProblematicCard} from "../../../application/service/graph/AffiliationDistinctionProblemDiagnoseService";
import {SaveActions} from "../../../application/repository";
import {TClusterAnalysisResult} from "./ExploreAnalysisResultTableTypes";

export interface GraphOptimizerContextProps {
    boardSPI: WorkshopBoardSPI;
    consoleOutput: string;
    showClusterAnalysisResult: boolean;
    setShowClusterAnalysisResult: Dispatch<SetStateAction<boolean>>;

    clusterAnalysisResult: TClusterAnalysisResult[];
    setClusterAnalysisResult: Dispatch<SetStateAction<TClusterAnalysisResult[]>>;

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
    undoQty: number;
    setUndoQty: Dispatch<SetStateAction<number>>;
    redoQty: number;
    setRedoQty: Dispatch<SetStateAction<number>>;

    handleWidthPaddingChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    handleHeightPaddingChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    handleHorizontalOverlapThresholdChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    handleVerticalOverlapThresholdChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export interface GraphOptimizerButtonGroupProps {
    boardSPI: WorkshopBoardSPI;
    consoleOutput: string;
    setConsoleOutput: Dispatch<SetStateAction<string>>;
}