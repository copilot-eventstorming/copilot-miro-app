import * as React from "react";
import {useContext} from "react";
import {GraphOptimizerContext} from "../context/GraphOptimizerContext";
import {mkUndoRedoConsoleOutput, openOperationLogsPage} from "../../utils/SaveOpUtils";


const SaveOperation = () => {
    const {
        setConsoleOutput,
        saveActions,
        undoDisabled,
        redoDisabled,
        undoQty,
        redoQty
    } = useContext(GraphOptimizerContext)
    return <>
        <div>
            <div className="btn-container-panel">
                <button disabled={undoDisabled} className="btn btn-secondary btn-secondary-panel"
                        onClick={() => {
                            if (saveActions) {
                                saveActions.undo()
                                    .then(layoutResult => {
                                        mkUndoRedoConsoleOutput(setConsoleOutput, layoutResult, null);
                                    })
                            }
                        }}> Undo Layout
                    {(saveActions == null || undoQty <= 0) ? <div/> :
                        <span className="badge">{undoQty}</span>}

                </button>
                <button disabled={redoDisabled} className="btn btn-secondary btn-secondary-panel"
                        onClick={() => {
                            if (saveActions) {
                                saveActions.redo().then(layoutResult => {
                                    mkUndoRedoConsoleOutput(setConsoleOutput, layoutResult, null);
                                })
                            }
                        }}> redo Layout
                    {(saveActions == null || redoQty <= 0) ? <div/> :
                        <span className="badge">{redoQty}</span>}
                </button>
                <button className="btn btn-secondary btn-secondary-panel" onClick={() => {
                    if (saveActions) saveActions.save('Save Manually', 'Event Storming Session').then((stateSaveResult) => {
                        mkUndoRedoConsoleOutput(setConsoleOutput, null, stateSaveResult)
                    });
                }}> Local Save
                </button>
                <button className="btn btn-secondary btn-secondary-panel" onClick={() => {
                }}> Cloud Save
                </button>
            </div>

        </div>
        {
            (redoQty + undoQty) > 0 && (
                <a className={"btn btn-secondary btn-secondary-panel shadow-none text-center w-full underline underline-offset-1"}
                   onClick={() => {
                       (async () => openOperationLogsPage())()
                   }}>Operation Log</a>
            )
        }
        <div>
        </div>
    </>
}



export {SaveOperation};