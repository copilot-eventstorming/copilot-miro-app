import {sizeof} from "../application/service/utils/utils";
import {get, set} from 'idb-keyval';

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

export async function saveLocally(id: string, object: any): Promise<SaveResult> {
    try {
        await set(id, object);
        return new SaveResult(true, null, sizeof(object))
    } catch (e) {
        console.log(e);
        return new SaveResult(false, e, sizeof(object));
    }
}

export async function findLocally(id: string): Promise<any> {
    try {
        return await get(id);
    } catch (e) {
        console.log(e);
        return null;
    }
}