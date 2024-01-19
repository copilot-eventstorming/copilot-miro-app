import {BehaviorSubject, combineLatest} from "rxjs";
import {GPTConfigurationRepository} from "./repository/GPTConfigurationRepository";

export interface CopilotSession {
    miroUserId: string;
    miroUsername: string;
    miroBoardId: string;
    gptConfiguration: GPTConfiguration;
}

export interface GPTConfiguration {
    provider: string;
    apiKey: string;
    endpoint: string;
}

export class ManuallyAskGPTConfiguration implements GPTConfiguration {
    static Provider = "manually-ask-gpt"
    provider: string = ManuallyAskGPTConfiguration.Provider;

    constructor() {
    }

    apiKey: string = 'none';
    endpoint: string = 'none';
}

export const manuallyAskGPTConfiguration: GPTConfiguration = new ManuallyAskGPTConfiguration()

export class OpenAIGPTConfiguration implements GPTConfiguration {
    static Provider = "openai"
    provider: string = OpenAIGPTConfiguration.Provider;

    constructor(public apiKey: string, public endpoint: string, public model: string) {
    }
}

export class AzureOpenAIConfiguration implements GPTConfiguration {
    static Provider = "azure-openai"
    provider: string = AzureOpenAIConfiguration.Provider;

    constructor(public deploymentId: string, public endpoint: string, public apiKey: string) {
    }

}

export const copilotSession$ = new BehaviorSubject<CopilotSession | null>(null);
export const gptConfiguration$ = new BehaviorSubject<GPTConfiguration>(manuallyAskGPTConfiguration)
combineLatest([copilotSession$, gptConfiguration$]).subscribe(([copilotSession, gptConfiguration]) => {
    if (copilotSession && copilotSession.gptConfiguration !== gptConfiguration) {
        copilotSession$.next({...copilotSession, gptConfiguration})
    }
})