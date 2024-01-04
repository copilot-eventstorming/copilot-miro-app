import {
    BoardInfo,
    BoardNode,
    GetFilter,
    Item,
    OnlineUserInfo,
    Shape,
    ShapeProps,
    StickyNote,
    StickyNoteProps
} from "@mirohq/websdk-types";

interface ApiCalls {
    [key: string]: number[];
}

interface Result {
    [key: string]: number;
}

interface Counts {
    [key: string]: number;
}

class MiroProxy {
    apiCalls: ApiCalls;

    constructor() {
        this.apiCalls = {};
        this.fetchBoardItems = this.withErrorLogging(this.fetchBoardItems.bind(this));
        this.fetchBoardInfo = this.withErrorLogging(this.fetchBoardInfo.bind(this));
        this.fetchBoardById = this.withErrorLogging(this.fetchBoardById.bind(this));
        this.zoomToCard = this.withErrorLogging(this.zoomToCard.bind(this));
        this.syncBoard = this.withErrorLogging(this.syncBoard.bind(this));
        this.fetchOnlineUsers = this.withErrorLogging(this.fetchOnlineUsers.bind(this));
    }

    getNextAvailableTime(): number {
        const oneMinuteAgo = Date.now() - 60000;
        let earliestTimestamp: number | null = null;

        for (const apiName in this.apiCalls) {
            const timestamps = this.apiCalls[apiName];
            if (timestamps.length > 0) {
                const earliest = Math.min(...timestamps);
                if (earliestTimestamp === null || earliest < earliestTimestamp) {
                    earliestTimestamp = earliest;
                }
            }
        }

        if (earliestTimestamp === null) {
            return 0;
        } else {
            return Math.max(0, earliestTimestamp - oneMinuteAgo);
        }
    }

    updateApiCalls(apiName: string): void {
        const now = Date.now();
        if (!this.apiCalls[apiName]) {
            this.apiCalls[apiName] = [];
        }
        this.apiCalls[apiName].push(now);
    }

    getApiCallsInLastMinute(): { counts: Counts, totalCount: number } {
        const oneMinuteAgo = Date.now() - 60000;
        const result: Result = {};
        for (const apiName in this.apiCalls) {
            result[apiName] = this.apiCalls[apiName].filter(timestamp => timestamp >= oneMinuteAgo).length;
        }
        let counts: Counts = {};
        let totalCount = 0;

        for (let [key, value] of Object.entries(result)) {
            console.log('getApiCallsInLastMinute', value)
            counts[key] = value;
            totalCount += value;
        }

        console.log(counts); // Prints the count of each key
        console.log(totalCount); // Prints the tot
        return {counts, totalCount};
    }

    async fetchBoardItems(filter: GetFilter = {}): Promise<BoardNode[]> {
        this.updateApiCalls('fetchBoardItems');
        return await miro.board.get(filter);
    }

    async fetchBoardInfo(): Promise<BoardInfo> {
        this.updateApiCalls('fetchBoardInfo');
        return await miro.board.getInfo();
    }

    async fetchBoardById(id: string): Promise<BoardNode> {
        this.updateApiCalls('fetchBoardById');
        return await miro.board.getById(id);
    }

    async zoomToCard(cardId: string): Promise<void> {
        this.updateApiCalls('zoomToCard');
        const card: BoardNode = await miro.board.getById(cardId);
        if (card as Item) {
            const m: Item = card as Item;
            await miro.board.viewport.zoomTo(m);
        }
    }

    async syncBoard(widget: BoardNode): Promise<void> {
        this.updateApiCalls('boardItem.sync');
        console.log(widget)
        return await widget.sync();
    }

    async fetchOnlineUsers(): Promise<OnlineUserInfo[]> {
        this.updateApiCalls('getOnlineUsers');
        return miro.board.getOnlineUsers();
    }

    withErrorLogging<T extends (...args: any[]) => Promise<any>>(fn: T): T {
        const self = this;
        return (async function (...args: any[]): Promise<any> {
            try {
                return await fn(...args);
            } catch (error: any) {
                if (error.message.includes('The API rate limit was exceeded')) {
                    const waitTime = miroProxy.getNextAvailableTime();
                    console.log(`Rate limit exceeded, waiting...${100 + waitTime}`)
                    await new Promise(resolve => setTimeout(resolve, 100 + waitTime));
                    return await self.withErrorLogging(fn)(...args);
                }
                console.log('Error occurred:', error, fn);
                console.log('API calls:', self.apiCalls);
                return Promise.reject(error);
            }
        }) as T;
    }

    createStickyNote(stickyNote: StickyNoteProps): Promise<StickyNote> {
        return miro.board.createStickyNote(stickyNote);
    }

    createShape(shape: ShapeProps): Promise<Shape> {
        return miro.board.createShape(shape)
    }
}

export const miroProxy = new MiroProxy();

export {MiroProxy};