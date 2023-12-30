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