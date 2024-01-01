import {Dispatch, SetStateAction} from "react";
import {StateSaveResult, UndoRedoResult} from "../../../application/repository";
import {miroProxy} from "../../../api/MiroProxy";
import {mkLayoutChangeResult} from "./ConsoleMessageMaker";

export async function openOperationLogsPage() {
    if (await miro.board.ui.canOpenModal()) {
        await miro.board.ui.openModal({
            url: 'modals/savedOperationLog.html', width: 800, height: 640, fullscreen: false,
        });
    }
}

export function mkUndoRedoConsoleOutput(setConsoleOutput: Dispatch<SetStateAction<string>>, layoutResult: UndoRedoResult | null, stateSaveResult: StateSaveResult | null) {
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