import {WorkshopCard} from "../../../application/spi/WorkshopBoardSPI";
import {cleanHtmlTag} from "../../../application/service/utils/utils";
import {contentWithoutSpace} from "../../../utils/WorkshopCardUtils";
import {BaseGPTService} from "../../../application/service/gpt/BaseGPTService";

export interface Item {
    event: string;
    fix: string[];
    confidence: number;
    reason: string;
}

export interface ResponseData {
    incorrectQuantity: number;
    items: Item[];
}

export interface IndependenceFixCandidate {
    eventCardId: string;
    eventName: string;
    fixCandidate: string[];
    confidence: number;
    reason: string;
}

export class FixEventNotIndependentByGPTService extends BaseGPTService<WorkshopCard[], ResponseData, IndependenceFixCandidate> {
    parseResult(cards: WorkshopCard[], result: ResponseData): IndependenceFixCandidate[] {
        return result.items.flatMap(item => {
                let card = cards
                    .find(card => contentWithoutSpace(card.content) === contentWithoutSpace(item.event));
                if (card) {
                    return [{
                        eventCardId: card.id,
                        eventName: item.event,
                        fixCandidate: item.fix,
                        confidence: item.confidence,
                        reason: item.reason
                    }]
                } else {
                    return [];
                }
            }
        );
    }

    emptyResult(): IndependenceFixCandidate[] {
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

const PromptPrefix = `Find domain events violate INDEPENDENCE, and provide possible fixes, reason and your confidence. Ignore independent domain events. The response should ONLY contain the non-independence events and STRICTLY follow the example JSON format but not example content below:
{
   "incorrectQuantity" : 4,
   "items" : [
        {"event":"Event Name Violate independence", "fix" :  ["<Possible Fix>"], "confidence" : <confidence>, "reason": "<reason>"},
        {"event":"Order Created And Paid" , "fix":  ["OrderCreated", "OrderPaid"], "confidence" : 0.7, "reason":"This event combines two different business actions, leading to coupling and confusion. It should be split into two independent events."}, 
        {"event":"Payment Failed Due To Insufficient Balance" , "fix":["PaymentFailed"],  "confidence" : 0.6, "reason": "This event includes the reason for payment failure and depends on the internal logic of the payment service. It should be simplified to PaymentFailed, with the failure reason as an event attribute instead of part of the event name."}, 
        {"event":"Item Shipped By FedEx", "fix": ["ItemShipped"], "confidence" : 0.55, "reason": "This event includes information about the logistics company and depends on the implementation of an external system. It should be abstracted to ItemShipped, with the logistics company as an event attribute instead of part of the event name."}
   ]
}
Ignore the correct domain events, response only contains incorrect domain events.
Make your response as concise as possible, with no introduction or background at the start, no summary at the end, and outputting only code for answers where code is appropriate.
The real Input Event Names are as following:
`

const PromptPostfix = `
Your JSON ONLY response should be:
`