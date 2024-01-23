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

export class FixEventNotPastTenseByGPTService extends BaseGPTService<WorkshopCard[], ResponseData, FixCandidate[]> {
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

const PromptPrefix = `Find domain events not using PAST TENSE, and provide possible fix. The response must only contains events not following past tense, and response should ONLY and STRICTLY follow the example JSON format but not content below:
{
   "incorrectQuantity" : 5,
   "items" : [
        {"Non Past Tense Event" :  "<Possible Fix>", "confidence" : 0.7},
        {"Name Event Candidate" :  "Event Candidate Named", "confidence" : 0.7}, 
        {"Order a Pizza" :"Pizza Ordered",  "confidence" : 0.6}, 
        {"我收到账款通知": "账款通知已阅读", "confidence" : 0.55}, 
        {"我在平台下单完成": "平台订单已提交", "confidence" : 0.54}, 
        {"客户在抖音上下订单完成": "抖音平台订单已提交",  "confidence" : 0.53}
   ]
}
make your response as concise as possible, with no introduction or background at the start, no summary at the end, and outputting only code for answers where code is appropriate.
The real Input Event Names are as following:
`

const PromptPostfix = `Your JSON ONLY response should be:
`