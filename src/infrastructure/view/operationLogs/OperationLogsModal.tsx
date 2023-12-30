import React, {useEffect, useState} from "react";
import ReactDOM from 'react-dom/client';
import {OperationLogDeleted, OperationLogRestore} from "./OperationLogEvent";
import {miroProxy} from "../../gateway/MiroProxy";
import {WorkshopBoardService} from "../../gateway/WorkshopBoardService";
import {OperationLogChannel} from "../../channel/channelNames";

interface Log {
    id: string;
    workshopTitle: string;
    sessionType: string;
    state: any[];
    createdOn: string;
}

function stateHistoryKey(boardId: string): string {
    return `stateHistory-${boardId}`;
}

function deleteOperationLog(operationLogEventChannel: BroadcastChannel, boardId: string, logId: string, undoLogs: Log[], redoLogs: Log[], setUndoLogs: React.Dispatch<React.SetStateAction<Log[]>>, setRedoLogs: React.Dispatch<React.SetStateAction<Log[]>>): void {
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

function sizeof(object: any): string {
    const str = JSON.stringify(object);
    const size = new Blob([str]).size;
    return (size / 1024).toFixed(2) + " KB";
}

function concatLogs(undoLogs: Log[], redoLogs: Log[]): Log[] {
    let logs = undoLogs.concat(redoLogs);
    logs.sort((a, b) => new Date(a.createdOn).getTime() - new Date(b.createdOn).getTime());
    return logs
}

function restoreLayout(operationLogEventChannel: BroadcastChannel, id: string): void {
    console.log('OperationLogsModal: restoreLayout postMessage')
    operationLogEventChannel.postMessage({type: OperationLogRestore, id: id})
}

const OperationLogsModal: React.FC = () => {
    const boardSPI = new WorkshopBoardService(miroProxy)
    const [undoLogs, setUndoLogs] = useState<Log[]>([])
    const [redoLogs, setRedoLogs] = useState<Log[]>([])
    const [boardId, setBoardId] = useState<string>("")
    useEffect(() => {
        boardSPI.fetchBoardInfo().then(board => {
            setBoardId(board.id)
            const savedState = JSON.parse(localStorage.getItem(stateHistoryKey(board.id)) || '{}');
            if (savedState) {
                setUndoLogs(savedState.undoStack)
                setRedoLogs(savedState.redoStack)
            }
        })
    }, [])

    const operationLogEventChannel = new BroadcastChannel(OperationLogChannel);
    const totalSize = sizeof(undoLogs.concat(redoLogs))
    return (
        <div className="w-full">
            <div className="title title-modal">Operation Logs <span
                className="text-xs text-gray-800"> {totalSize}</span></div>
            <div className="flex justify-center items-center flex-col w-full">
                <table>
                    <thead>
                    <tr className="w-full">
                        <th className="header header-modal text-sm">Seq</th>
                        <th className="header header-modal text-sm">Log Title</th>
                        <th className="header header-modal text-sm">Session Type</th>
                        <th className="header header-modal text-sm">Item Count</th>
                        <th className="header header-modal text-sm">Size</th>
                        <th className="header header-modal text-sm">Created On</th>
                        <th className="header header-modal text-sm">Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {
                        concatLogs(undoLogs, redoLogs).map((log, index) => {
                                const rowClassName = index % 2 === 0 ? "even_row" : "odd_row";
                                return (<tr key={log.id} className={`${rowClassName} w-full`}>
                                    <td className="text-cell text-cell-modal text-sm">{index + 1}</td>
                                    <td className="text-cell text-cell-modal text-sm">{log.workshopTitle}</td>
                                    <td className="text-cell text-cell-modal text-sm">{log.sessionType}</td>
                                    <td className="number-cell number-cell-modal text-sm">{log.state.length}</td>
                                    <td className="number-cell number-cell-modal text-sm">{sizeof(log)}</td>
                                    <td className="text-cell text-cell-modal text-sm">{log.createdOn}</td>
                                    <td>
                                        <button className="btn btn-secondary btn-secondary-modal text-xs"
                                                onClick={() => restoreLayout(operationLogEventChannel, log.id)}
                                        >Load
                                        </button>
                                        <button className="btn btn-secondary btn-secondary-modal text-xs"
                                                onClick={
                                                    () =>
                                                        deleteOperationLog(operationLogEventChannel, boardId, log.id, undoLogs, redoLogs, setUndoLogs, setRedoLogs)
                                                }>Delete
                                        </button>
                                    </td>
                                </tr>)
                            }
                        )
                    }
                    </tbody>
                </table>
            </div>
        </div>
    )
}

const root = ReactDOM.createRoot(document.getElementById('operation-logs-root') as HTMLElement);
root.render(<OperationLogsModal/>);