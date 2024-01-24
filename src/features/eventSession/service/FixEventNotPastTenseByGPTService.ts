import {WorkshopCard} from "../../../application/spi/WorkshopBoardSPI";
import {cleanHtmlTag} from "../../../application/service/utils/utils";
import {contentWithoutSpace} from "../../../utils/WorkshopCardUtils";
import {BaseGPTService} from "../../../application/service/gpt/BaseGPTService";

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

export class FixEventNotPastTenseByGPTService extends BaseGPTService<WorkshopCard[], ResponseData, FixCandidate> {
    parseResult(cards: WorkshopCard[], result: ResponseData): FixCandidate[] {
        return result.items.flatMap(item => {
                return Object.entries(item)
                    .flatMap(([key, value]) => {
                        let card = cards
                            .find(card => contentWithoutSpace(card.content) === contentWithoutSpace(key));
                        return card ? [{
                            eventCardId: card.id,
                            eventName: key,
                            fixCandidate: value,

                        }] : [];
                    })
            }
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

const PromptPrefix = `Find domain events not using PAST TENSE, and provide past tense fix. 
First only filter out events not using past tense, then provide past tense fix.
The response must only contain events not following past tense and ignore those already in past tense,
don't make up event does not exist in request,
and response should ONLY and STRICTLY follow the example JSON format but not content below [positive examples]:
{
    "incorrectQuantity" : 5,
    "items" : [
         {"Non Past Tense Event" : "<Possible Fix>", "confidence" : 0.7},
         {"Name Event Candidate" : "Event Candidate Named", "confidence" : 0.7},
         {"Order a Pizza" :"Pizza Ordered", "confidence" : 0.6},
         {"I received a payment notification": "Payment Notification Read", "confidence": 0.55},
         {"I placed an order on the platform": "Platform Order Placed", "confidence": 0.54},
         {"The customer placed an order on Douyin": "Douyin Platform Order Placed", "confidence": 0.53}
    ]
}
Here are some [counter examples] to avoid generating similar content:
{
    "incorrectQuantity" : 5,
    "items" : [
         {"<Past Tense Event>" : "<Past Tense Event>", ...},
         {"Pizza Ordered" :"Pizza Ordered", ...},
         {"<Past Tense Event>" : "<Same Past Tense Event>", ...},
         {"Pizza Ordered" :"Pizza Ordered", ...},
         {"<Past Tense Event w/o space>": "<Past Tense Event w/> Space>", ...},
         {"PizzaOrdered" :"Pizza Ordered", ...},
         {"<Past Tense Event>" : "<Was Format Same Past Tense Event>", ...},
         {"Pizza Ordered" :"Pizza Was Ordered", ...}
    ]
}
Please carefully compare the differences between [positive examples] and  [counter examples], and generate text that is similar to the  [positive examples] rather than text that is similar to the [counter examples].
Ignore the correct domain events, response only contains incorrect domain events.
Make your response as concise as possible, with no make up events outside the following real input, with no introduction or background at the start, no summary at the end, and outputting only code for answers where code is appropriate.
The real Input Event Names are as following:
`

const PromptPostfix = `
Your JSON ONLY response should be:
`