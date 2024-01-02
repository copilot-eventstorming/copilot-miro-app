import {findLocally, saveLocally} from "../../utils/localStorage";
import _ from 'lodash';
import {SaveResult} from "./SaveResult";
import {StateSaveResult} from "./StateSaveResult";
import {sizeof} from "../service/utils/utils";

export class SaveActionState {
    boardId: string;
    undoStack: any[] = [];
    redoStack: any[] = [];

    constructor(boardId: string) {
        this.boardId = boardId;
        this.loadFromLocalStorage();
    }

    stateHistoryKey(): string {
        return `stateHistory-${this.boardId}`;
    }

    async saveState(title: string, sessionType: string, state: any[], short: boolean = true): Promise<StateSaveResult> {
        console.log("performing save state action");

        if (this.redoStack.length > 0 && hasSameState(this.redoStack, state, short)) {
            console.log("state not changed, found in redo stack");
            return new StateSaveResult(true, new SaveResult(true, null, sizeof({})), sizeof({}));
        }

        if (this.undoStack.length > 0 && hasSameState(this.undoStack, state, short)) {
            console.log("state not changed, found in undo stack");
            return new StateSaveResult(true, new SaveResult(true, null, sizeof({})), sizeof({}));
        }

        console.log("state changed");
        const stateObject = this.mkStateObject(title, sessionType, state, short);
        this.undoStack.push(stateObject);
        this.redoStack = [];
        return this.saveToLocalStorage().then(saveResult => {
            this.saveStateToServer(stateObject.id, state);
            return new StateSaveResult(false, saveResult, sizeof(stateObject));
        })
    }

    async saveToLocalStorage(): Promise<SaveResult> {
        return await saveLocally(this.stateHistoryKey(), {
            undoStack: this.undoStack,
            redoStack: this.redoStack,
        });
    }

    async loadFromLocalStorage(): Promise<void> {
        const savedState = await findLocally(this.stateHistoryKey());
        if (savedState && savedState.undoStack && savedState.redoStack) {
            this.undoStack = savedState.undoStack;
            this.redoStack = savedState.redoStack;
        }
    }

    saveStateToServer(stateId: string, state: any): void {
        // fetch('http://localhost:8080/state', {
        //     method: 'POST',
        //     headers: {'Content-Type': 'application/json'},
        //     body: JSON.stringify(state)
        // });
    }

    async undo(): Promise<any> {
        console.log("performing undo action");
        const stateObject = this.undoStack.pop();
        if (stateObject) {
            this.redoStack.push(stateObject);
            this.saveToLocalStorage();
        }
        return this.undoStack[this.undoStack.length - 1];
    }

    async redo(): Promise<any | null> {
        console.log("performing redo action");
        const stateObject = this.redoStack.pop();
        if (stateObject) {
            this.undoStack.push(stateObject);
            await this.saveToLocalStorage();
            return stateObject;
        }
        return null;
    }

    findByLogId(logId: string): any | null {
        if (logId) {
            return this.redoStack.concat(this.undoStack)
                .find(state => state.id === logId);
        }
        return null;
    }

    deleteByLogId(logId: string): void {
        const undoIndex = this.undoStack.findIndex(state => state.id === logId);
        const redoIndex = this.redoStack.findIndex(state => state.id === logId);

        if (undoIndex !== -1) {
            this.undoStack.splice(undoIndex, 1);
        }

        if (redoIndex !== -1) {
            this.redoStack.splice(redoIndex, 1);
        }

        this.saveToLocalStorage();
    }

    undoable(): boolean {
        return this.undoStack.length > 0;
    }

    redoable(): boolean {
        return this.redoStack.length > 0;
    }

    mkStateObject(workshopTitleStr: string, sessionType: string, state: any[], short: boolean): LayoutRecord {
        let date = new Date();
        let itemStates = state.map(makeShortBoardItem(short));
        return {
            id: mkStateId(),
            workshopTitle: workshopTitleStr,
            state: itemStates,
            sessionType: sessionType,
            timestamp: date.getTime(),
            createdOn: formatDateTime(date)
        };
    }
}

function mkStateId() {
    return crypto.randomUUID();
}

function hasSameState(stack: { state: any }[], state: any[], short: boolean): boolean {
    for (let i = 0; i < stack.length; i++) {
        if (_.isEqual(stack[i].state, state.map(item => makeShortBoardItem(short)))) {
            return true;
        }
    }
    return false;
}

interface Item {
    id: string;
    type: string;
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    start?: any;
    end?: any;
}

function makeShortBoardItem(short: boolean): (item: Item) => Item {
    return (item: Item) => {
        if (!short) {
            return item;
        }
        let itemState: Item = {
            id: item.id,
            type: item.type,
        };
        switch (item.type) {
            case 'sticky_note':
                itemState = {
                    ...itemState,
                    x: item.x,
                    y: item.y,
                    width: item.width,
                    height: item.height,
                }
                break;
            case 'shape':
                itemState = {
                    ...itemState,
                    x: item.x,
                    y: item.y,
                    width: item.width,
                    height: item.height,
                }
                break;
            case 'connector':
                itemState = {
                    ...itemState,
                    start: item.start,
                    end: item.end,
                }
                break;
            default:
                break;
        }
        return itemState;
    };
}

function formatDateTime(date: Date): string {
    const year = date.getFullYear().toString().padStart(1, '0');
    const month = (date.getMonth()).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(1, '0');
    const hours = date.getHours().toString().padStart(1, '0');
    const minutes = date.getMinutes().toString().padStart(1, '0');
    const seconds = date.getSeconds().toString().padStart(1, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

class LayoutRecord {
    id: string;
    workshopTitle: string;
    state: any[];
    sessionType: string;
    timestamp: number;
    createdOn: string;

    constructor(workshopTitleStr: string, sessionType: string, state: any[], short: boolean) {
        let date = new Date();
        this.id = mkStateId();
        this.workshopTitle = workshopTitleStr;
        this.state = state.map(makeShortBoardItem(short));
        this.sessionType = sessionType;
        this.timestamp = date.getTime();
        this.createdOn = formatDateTime(date);
    }
}