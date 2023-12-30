import * as React from "react";
import {Dispatch, SetStateAction, useContext} from "react";
import {GraphOptimizerContext} from "./GraphOptimizerButtonGroup";
import {mkLayoutChangeResult} from "../../../common/ConsoleMessageMaker";
import {miroProxy} from "../../../gateway/MiroProxy";
import {StateSaveResult} from "../../../../application/repository/StateSaveResult";
import {UndoRedoResult} from "../../../../application/repository/SaveActions";

function mkUndoRedoConsoleOutput(setConsoleOutput: Dispatch<SetStateAction<string>>, layoutResult: UndoRedoResult | null, stateSaveResult: StateSaveResult | null) {
    const apiCalls = miroProxy.getApiCallsInLastMinute()
    if (null !== layoutResult) {
        setConsoleOutput(mkLayoutChangeResult(layoutResult, {
            ignored: true,
            saveResult: null,
            incrementalStorageUtilization: '0'
        }, apiCalls))
    } else {
        const ignored = stateSaveResult?.ignored;
        const incrementalStorageUtilization = stateSaveResult?.incrementalStorageUtilization;
        const saveResult = stateSaveResult?.saveResult;
        const output = `${(!ignored && saveResult && saveResult.success) ? `Board Items' Coordinates are locally saved successfully in ${incrementalStorageUtilization}, and local storage totally used: ${saveResult.storageUtilization}.`
            : (!ignored && saveResult) ? `Board Items' Coordinates locally saved failed due to ${saveResult.error}`
                : `Board Items' Coordinates are not saved locally due to already saved before.`}`
        setConsoleOutput(output)
    }
}

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

async function openOperationLogsPage() {
    if (await miro.board.ui.canOpenModal()) {
        await miro.board.ui.openModal({
            url: 'modals/savedOperationLog.html', width: 800, height: 640, fullscreen: false,
        });
    }
}

export {SaveOperation};