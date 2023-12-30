import {sizeof} from "../../application/service/utils";

export class SaveResult {
    success: boolean;
    error: any | null;
    storageUtilization: string;

    constructor(success: boolean, error: any | null, storageUtilization: string) {
        this.success = success;
        this.error = error;
        this.storageUtilization = storageUtilization;
    }
}

export function saveLocally(id: string, object: any): SaveResult {
    try {
        localStorage.setItem(id, JSON.stringify(object));
        return new SaveResult(true, null, sizeof(object))
    } catch (e) {
        console.log(e);
        return new SaveResult(false, e, sizeof(object));
    }
}

export function findLocally(id: string): any {
    const str = localStorage.getItem(id);
    return JSON.parse(str || 'null');
}