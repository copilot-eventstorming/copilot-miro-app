import {BehaviorSubject} from "rxjs";

export interface CopilotSession {
    miroUserId: string;
    miroUsername: string;
}

export const copilotSession$ = new BehaviorSubject<CopilotSession | null>(null);