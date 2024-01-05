import {BehaviorSubject} from "rxjs";

export interface CopilotSession {
    miroUserId: string;
    miroUsername: string;
    miroBoardId: string;
}

export const copilotSession$ = new BehaviorSubject<CopilotSession | null>(null);