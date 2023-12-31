interface LayoutOpResult {
    failureCount: number;
    successCount: number;
    targetCardsNum: number;
}

interface SaveResult {
    success?: boolean;
    error?: string;
    storageUtilization?: string;
}

interface StateSaveResult {
    ignored: boolean;
    saveResult: SaveResult | null;
    incrementalStorageUtilization: string;
}

interface ApiCalls {
    totalCount: number;
}

export function mkLayoutChangeResult(layoutOpResult: LayoutOpResult, stateSaveResult: StateSaveResult, apiCalls: ApiCalls): string {
    console.log(apiCalls);
    if (layoutOpResult.failureCount === 0 && layoutOpResult.successCount >= 0) {
        const {ignored, saveResult, incrementalStorageUtilization} = stateSaveResult;
        return `Operation completed successfully.
        Totally ${layoutOpResult.targetCardsNum} cards coordinates are optimized.
        At least saved you ${layoutOpResult.targetCardsNum * 2} seconds.
        Miro WebSDK API called: ${layoutOpResult.targetCardsNum} times, rate limit cost ${((apiCalls.totalCount * 50) / 1000).toFixed(2)}% Credits/Minute.
        ${(!ignored && saveResult && saveResult.success) ? `Board Items' Coordinates are locally saved successfully in ${incrementalStorageUtilization}, and local storage totally used: ${saveResult.storageUtilization}.`
            : (!ignored && saveResult && saveResult.error) ? `Board Items' Coordinates locally saved failed due to ${saveResult.error}`
                : ignored ? `Board Items' Coordinates are not saved locally due to already saved before.` : `Board Items' Coordinates are not saved locally due to unknown error.`}
        `;
    } else if (layoutOpResult.successCount === 0 && layoutOpResult.failureCount === 0) {
        return 'No cards coordinates changed, ignore this operation to save local storage and Miro WebSDK API calls.';
    } else {
        return `Operation completed with ${layoutOpResult.successCount} cards coordinates optimized, ${layoutOpResult.failureCount} cards coordinates failed to optimize.
        Totally ${layoutOpResult.successCount} cards coordinates are optimized.
        At least saved you ${layoutOpResult.targetCardsNum * 2} seconds.
        Miro WebSDK API called: ${layoutOpResult.targetCardsNum} times, rate limit cost ${((apiCalls.totalCount * 50) / 1000).toFixed(2)}% Credits/Minute.
        `;
    }
}