import {Drawer} from "../../../../component/drawer";
import * as React from "react";

import {GraphOptimizerContext} from "../context/GraphOptimizerContext";

interface OptimizerOptionsProps {
    handleAmbiguousDistanceThresholdChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const OptimizerOptions: React.FC<OptimizerOptionsProps> = ({handleAmbiguousDistanceThresholdChange}) => {
    const {
        optionsDrawerOpen,
        setOptionsDrawerOpen,
        widthPadding,
        heightPadding,
        horizontalOverlapThreshold,
        verticalOverlapThreshold,
        showClusterAnalysisResult,
        showMaybeProblems,
        minDistanceDiff,
        maxDistanceDiff,
        step,
        ambiguousDistanceThreshold,
        handleHeightPaddingChange,
        handleWidthPaddingChange,
        handleHorizontalOverlapThresholdChange,
        handleVerticalOverlapThresholdChange,
    } = React.useContext(GraphOptimizerContext);
    const toggleDrawer = () => {
        setOptionsDrawerOpen(!optionsDrawerOpen);
    };

    return <div className="w-full">
        <div className="flex items-center w-full">
            <Drawer isOpen={optionsDrawerOpen} style={{marginRight: '10px'}} toggleDrawer={toggleDrawer}/>
            <div className="text-sm text-gray-900 text-center w-full">More Options</div>
        </div>
        <div>
            {!optionsDrawerOpen ? <div/> :
                (showClusterAnalysisResult || showMaybeProblems) ?
                    problemDiagnoseOptions(minDistanceDiff, maxDistanceDiff, step, ambiguousDistanceThreshold, handleAmbiguousDistanceThresholdChange)
                    : layoutOptions(widthPadding, handleWidthPaddingChange, heightPadding, handleHeightPaddingChange, horizontalOverlapThreshold, handleHorizontalOverlapThresholdChange, verticalOverlapThreshold, handleVerticalOverlapThresholdChange)
            }
        </div>
    </div>
}

function layoutOptions(widthPadding: number, handleWidthPaddingChange: (event: React.ChangeEvent<HTMLInputElement>) => void, heightPadding: number, handleHeightPaddingChange: (event: React.ChangeEvent<HTMLInputElement>) => void, horizontalOverlapThreshold: number, handleHorizontalOverlapThresholdChange: (event: React.ChangeEvent<HTMLInputElement>) => void, verticalOverlapThreshold: number, handleVerticalOverlapThresholdChange: (event: React.ChangeEvent<HTMLInputElement>) => void) {
    return <div>
        <div className="flex justify-between items-center py-1 odd_row">
            <label className="text-left text-gray-900 text-xs" htmlFor="widthPadding">Width Padding</label>
            <div className="w-full pl-10 pr-3">
                <input id="widthPadding" type="range" min="0" max="5" step="0.1" value={widthPadding}
                       className="slider bg-amber-500"
                       style={{"width": "100%"}}
                       onChange={handleWidthPaddingChange}/>
            </div>
            <label className="text-left text-gray-900 text-xs mr-2">{widthPadding}</label>
        </div>
        <div className="flex justify-between items-center py-1 even_row">
            <label className="text-left text-gray-900 text-xs " htmlFor="heightPadding">Height Padding</label>
            <div className="w-full pl-10 pr-3">
                <input id="heightPadding" type="range" min="0" max="5" step="0.1" value={heightPadding}
                       className="slider bg-amber-500"
                       style={{"width": "100%"}}
                       onChange={handleHeightPaddingChange}/>
            </div>
            <label className="text-left text-gray-900 text-xs mr-2">{heightPadding}</label>
        </div>
        <div className="flex justify-between items-center py-1 odd_row">
            <label className="text-left text-gray-900 text-xs " htmlFor="horizontalOverlapThreshold">Horizontal
                Overlap Threshold</label>
            <div className="w-full pl-0 pr-3">
                <input id="horizontalOverlapThreshold" type="range" min="0.1" max="5" step="0.1"
                       value={horizontalOverlapThreshold}
                       className="slider bg-amber-500"
                       style={{"width": "100%"}}
                       onChange={handleHorizontalOverlapThresholdChange}/>
            </div>
            <label className="text-left text-gray-900 text-xs mr-2">{horizontalOverlapThreshold}</label>
        </div>
        <div className="flex justify-between items-center py-1 even_row">
            <label className="text-left text-gray-900 text-xs" htmlFor="verticalOverlapThreshold">Vertical Overlap
                Threshold</label>
            <div className="w-full pl-2 pr-3">
                <input id="verticalOverlapThreshold" type="range" min="0.1" max="5" step="0.1"
                       value={verticalOverlapThreshold}
                       className="slider bg-amber-500"
                       style={{"width": "100%"}}
                       onChange={handleVerticalOverlapThresholdChange}/>
            </div>
            <label className="text-left text-gray-900 text-xs mr-2">{verticalOverlapThreshold}</label>
        </div>
    </div>;
}

function problemDiagnoseOptions(minDistanceDiff: number, maxDistanceDiff: number, step: number, ambiguousDistanceThreshold: number, handleAmbiguousDistanceThresholdChange: (event: React.ChangeEvent<HTMLInputElement>) => void) {
    return <div>
        <div className="flex justify-between items-center">
            <label className="text-left text-gray-900 text-xs" htmlFor="ambiguousDiffThreshold">Affiliation
                Distinction Threshold</label>
            <div style={{"width": "100%", "padding": 10}}>
                <input id="ambiguousDiffThreshold" type="range" min="0" max={maxDistanceDiff}
                       step="0.01"
                       value={ambiguousDistanceThreshold}
                       className="slider bg-amber-500"
                       style={{"width": "100%"}}
                       onChange={handleAmbiguousDistanceThresholdChange}/>
            </div>
            <label className="text-left text-gray-900 text-xs mr-2">{ambiguousDistanceThreshold}</label>
        </div>
    </div>;
}

export {OptimizerOptions};