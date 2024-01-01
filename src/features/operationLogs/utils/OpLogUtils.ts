import React from "react";
import {OperationLogDeleted, OperationLogRestore} from "../types/OperationLogEvent";
import {TLog} from "../types/TLog";


export function stateHistoryKey(boardId: string): string {
    return `stateHistory-${boardId}`;
}

export function deleteOperationLog(operationLogEventChannel: BroadcastChannel, boardId: string, logId: string, undoLogs: TLog[], redoLogs: TLog[], setUndoLogs: React.Dispatch<React.SetStateAction<TLog[]>>, setRedoLogs: React.Dispatch<React.SetStateAction<TLog[]>>): void {
    const undoStack = undoLogs.filter(log => log.id !== logId);
    const redoStack = redoLogs.filter(log => log.id !== logId);
    localStorage.setItem(stateHistoryKey(boardId), JSON.stringify({
        undoStack: undoStack,
        redoStack: redoStack
    }));
    setUndoLogs(undoStack)
    setRedoLogs(redoStack)
    operationLogEventChannel.postMessage({type: OperationLogDeleted, id: logId})
}

export function sizeof(object: any): string {
    const str = JSON.stringify(object);
    const size = new Blob([str]).size;
    return (size / 1024).toFixed(2) + " KB";
}

export function concatLogs(undoLogs: TLog[], redoLogs: TLog[]): TLog[] {
    let logs = undoLogs.concat(redoLogs);
    logs.sort((a, b) => new Date(a.createdOn).getTime() - new Date(b.createdOn).getTime());
    return logs
}

export function restoreLayout(operationLogEventChannel: BroadcastChannel, id: string): void {
    console.log('OperationLogsModal: restoreLayout postMessage')
    operationLogEventChannel.postMessage({type: OperationLogRestore, id: id})
}