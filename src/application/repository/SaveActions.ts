import {SaveActionState} from "./SaveActionState";
import {WorkshopBoardSPI} from "../gateway/WorkshopBoardSPI";
import {SaveResult} from "./SaveResult";
import {StateSaveResult} from "./StateSaveResult";
import {sizeof} from "../service/utils";

export class SaveActions {
    boardId: string;
    undoDisabledSetter: (disabled: boolean) => void;
    redoDisabledSetter: (disabled: boolean) => void;
    setUndoQty: (qty: number) => void;
    setRedoQty: (qty: number) => void;
    consoleOutputSetter: (output: string) => void;
    boardSpi: WorkshopBoardSPI;
    stateManager: SaveActionState;

    constructor(boardId: string,
                undoDisabledSetter: (disabled: boolean) => void,
                redoDisabledSetter: (disabled: boolean) => void,
                setUndoQty: (qty: number) => void,
                setRedoQty: (qty: number) => void,
                consoleOutputSetter: (output: string) => void,
                boardSpi: WorkshopBoardSPI) {
        this.boardId = boardId;
        this.undoDisabledSetter = undoDisabledSetter;
        this.redoDisabledSetter = redoDisabledSetter;
        this.setUndoQty = setUndoQty;
        this.setRedoQty = setRedoQty;
        this.consoleOutputSetter = consoleOutputSetter;
        this.boardSpi = boardSpi;
        this.stateManager = new SaveActionState(boardId);
        this.invalidButtonState();
    }

    async save(title: string = 'manually saving', sessionType: string = 'Event Storming Session'): Promise<StateSaveResult> {
        console.log("saving: " + title);
        return await this.boardSpi.fetchCurrentLayout()
            .then(async (layout: any[]) => {
                return await this.stateManager.saveState(title, sessionType, layout);
            }).then((stateSaveResult: StateSaveResult) => {
                this.invalidButtonState();
                return stateSaveResult;
            }).catch((e: any) => {
                return new StateSaveResult(false, new SaveResult(false, e, sizeof({})));
            });
    }

    async undo(): Promise<UndoRedoResult> {
        const previousState = this.stateManager.undo();
        if (previousState) {
            this.consoleOutputSetter(`undoing ${previousState.state.length} elements in graph...`);
            const result = await this.boardSpi.restoreBoardLayout(previousState.state, this.consoleOutputSetter);
            this.invalidButtonState();
            return {
                targetCardsNum: result.targetCardsNum,
                targetTotalDistance: result.targetTotalDistance.reduce((a, b) => a + b, 0),
                successCount: result.successCount,
                failureCount: result.failureCount
            }
        } else {
            this.invalidButtonState();
            return {
                targetCardsNum: 0,
                targetTotalDistance: 0,
                successCount: 0,
                failureCount: 0,
            };
        }
    }

    async redo(): Promise<UndoRedoResult> {
        const nextState = this.stateManager.redo();
        console.log("redo", nextState);
        if (nextState) {
            this.consoleOutputSetter(`redoing ${nextState.state.length} elements in graph...`);
            const result = await this.boardSpi.restoreBoardLayout(nextState.state, this.consoleOutputSetter);
            this.invalidButtonState();
            return {
                targetCardsNum: result.targetCardsNum,
                targetTotalDistance: result.targetTotalDistance.reduce((a, b) => a + b, 0),
                successCount: result.successCount,
                failureCount: result.failureCount
            };
        } else {
            return {
                targetCardsNum: 0,
                targetTotalDistance: 0,
                successCount: 0,
                failureCount: 0,
            };
        }
    }

    async loadByLogId(logId: string) {
        const stateObject = this.stateManager.findByLogId(logId);
        if (stateObject) {
            const result = await this.boardSpi.restoreBoardLayout(stateObject.state, this.consoleOutputSetter);
            const utilized = localStorageUtilization();
            if (result.failureCount > 0) {
                this.consoleOutputSetter(`Load Layout Finished:\n\n    Totally Cards Restored: ${result.successCount}\n\n    Warnings: \n${result.failureCount}\n\n    Local Storage Utilized: ${utilized} MB\n\n This action occupied: ${(result.successCount * 50) / 1000}% rate limiting per min for API.`);
            } else {
                this.consoleOutputSetter(`Load Layout Finished:\n\n    Totally Cards Restored: ${result.successCount}\n\n    Local Storage Utilized: ${utilized} MB\n\n This action occupied: ${(result.successCount * 50) / 1000}% rate limiting per min for API.`);
            }
        }
        this.invalidButtonState();
    }

    deleteLogById(logId: string): void {
        this.stateManager.deleteByLogId(logId);
        this.invalidButtonState();
    }

    invalidButtonState(): void {
        this.undoDisabledSetter(!this.stateManager.undoable());
        this.redoDisabledSetter(!this.stateManager.redoable());
        this.setUndoQty(this.stateManager.undoStack.length);
        this.setRedoQty(this.stateManager.redoStack.length);
    }
}

function localStorageUtilization() {
    let total = 0;
    for (let x in localStorage) {
        let amount = (localStorage[x].length * 2) / 1024 / 1024;
        if (!isNaN(amount) && localStorage.hasOwnProperty(x)) {
            total += amount;
        }
    }
    return total.toFixed(2)
}

export class UndoRedoResult {

    constructor(public targetCardsNum: number, public targetTotalDistance: number, public successCount: number, public failureCount: number) {
    }
}