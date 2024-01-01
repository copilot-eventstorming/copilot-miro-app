import React, {useEffect, useState} from "react";
import ReactDOM from 'react-dom/client';
import {miroProxy} from "../../../api/MiroProxy";
import {WorkshopBoardService} from "../../../api/WorkshopBoardService";

import {OperationLogChannel} from "../types/OperationLogChannels";
import {concatLogs, deleteOperationLog, restoreLayout, sizeof, stateHistoryKey} from "../utils/OpLogUtils";
import {TLog} from "../types/TLog";


const OperationLogsModal: React.FC = () => {
    const boardSPI = new WorkshopBoardService(miroProxy)
    const [undoLogs, setUndoLogs] = useState<TLog[]>([])
    const [redoLogs, setRedoLogs] = useState<TLog[]>([])
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