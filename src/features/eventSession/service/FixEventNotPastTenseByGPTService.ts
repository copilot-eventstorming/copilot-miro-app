import {WorkshopCard} from "../../../application/spi/WorkshopBoardSPI";
import {cleanHtmlTag} from "../../../application/service/utils/utils";
import {contentWithoutSpace} from "../../../utils/WorkshopCardUtils";
import {BaseGPTService} from "./BaseGPTService";

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

export class FixEventNotPastTenseByGPTService extends BaseGPTService<WorkshopCard[], ResponseData, FixCandidate[]> {
    parseResult(cards: WorkshopCard[], result: ResponseData): FixCandidate[] {
        return result.items.flatMap(item =>
            Object.entries(item)
                .flatMap(([key, value]) => {
                    let card = cards
                        .find(card => contentWithoutSpace(card.content) === contentWithoutSpace(key));
                    return card ? [{
                        eventCardId: card.id,
                        eventName: key,
                        fixCandidate: value
                    }] : [];
                })
        );
    }

    emptyResult(): FixCandidate[] {
        return []
    }

    promptPrefix(): string {
        return PromptPrefix;
    }

    promptMiddle(cards: WorkshopCard[]): string {
        return cards.map(card => cleanHtmlTag(card.content)).join('\n');
    }

    promptPostfix(): string {
        return PromptPostfix;
    }
}

const PromptPrefix = `Domain Event Syntax Issue Fix: 
The real Input Event Names are as following:
`

const PromptPostfix = `
Find domain events not using PAST TENSE, and provide possible fix. The response must only contains events not following past tense, and response should ONLY and STRICTLY follow the example JSON format below:
{
   "incorrectQuantity" : 2
   "items" : [
        {"Name Event Candidate" :  "Event Candidate Named"}
        {"Order a Pizza" :"Pizza Ordered"}
   ]
}
The JSON Response is:
`