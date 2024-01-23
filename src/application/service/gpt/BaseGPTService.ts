import {AzureKeyCredential, OpenAIClient} from '@azure/openai';
import {Completions} from "@azure/openai/types/openai";
import {cleanHtmlTag} from "../utils/utils";
import {AzureOpenAIConfiguration, GPTConfiguration} from "../../CopilotSession";

export type TGPTOptions = {
    maxTokens: number,
    temperature: number,
}
export interface Item {
    [key: string]: string;
}

export interface ResponseData {
    incorrectQuantity: number;
    items: Item[];
}

export interface FixCandidate {
    eventCardId: string;
    eventName: string;
    fixCandidate: string;
}



export abstract class BaseGPTService<I, M, O> {

    private async openaiApiCall(gptConfiguration: GPTConfiguration, input: I, gptOptions: TGPTOptions): Promise<string> {
        const openai = new OpenAIClient(gptConfiguration.endpoint, new AzureKeyCredential(gptConfiguration.apiKey));
        // 构建输入文本
        const prompt = this.generatePrompt(input);
        console.log(prompt)
        if (gptConfiguration.provider === AzureOpenAIConfiguration.Provider) {
            const result: Completions = await openai.getCompletions(
                (gptConfiguration as AzureOpenAIConfiguration).deploymentId,
                [prompt], {
                    maxTokens: gptOptions.maxTokens,
                    temperature: gptOptions.temperature,
                });
            console.log(result.usage)
            for (const choice of result.choices) {
                console.log(choice.text);
            }
            // 返回生成的文本
            return result.choices[0].text.trim();
        } else {
            throw new Error("not supported provider")
        }
    }

    async perform(input: I, gptConfiguration: GPTConfiguration, gptOptions: TGPTOptions): Promise<O> {
        return this.openaiApiCall(gptConfiguration, input, gptOptions)
            .then(result => {
                return this.parseResponse(input, result)
            })
            .catch(error => {
                console.error(error);
                miro.board.notifications.showError(error)
                return this.emptyResult()
            })

    }

    generatePrompt(input: I): string {
        return this.promptPrefix() + this.promptMiddle(input) + this.promptPostfix();
    }

    parseResponse(input: I, response: string): O {
        try {
            let result: M = JSON.parse(cleanHtmlTag(response));
            return this.parseResult(input, result)
        } catch (error) {
            console.log(error)
            miro.board.notifications.showInfo("Failed to parse JSON" + JSON.stringify(error))
            throw error
        }
    }

    abstract parseResult(input: I, result: M): O

    abstract emptyResult(): O

    abstract promptPrefix(): string

    abstract promptMiddle(i: I): string

    abstract promptPostfix(): string

}

