import {SaveResult} from "./SaveResult";

export class StateSaveResult {
    ignored: boolean;
    incrementalStorageUtilization: string;
    saveResult: SaveResult | null;

    constructor(ignored: boolean, saveResult: SaveResult | null, incrementalStorageUtilization: string = "0 KB") {
        this.ignored = ignored;
        this.incrementalStorageUtilization = incrementalStorageUtilization;
        this.saveResult = saveResult;
    }
}