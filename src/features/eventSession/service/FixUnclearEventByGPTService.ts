import {WorkshopCard} from "../../../application/spi/WorkshopBoardSPI";
import {cleanHtmlTag} from "../../../application/service/utils/utils";
import {contentWithoutSpace} from "../../../utils/WorkshopCardUtils";
import {BaseGPTService} from "../../../application/service/gpt/BaseGPTService";
import {FixCandidate, ResponseData} from "./FixEventNotPastTenseByGPTService";

export class FixUnspecificMeaningEventByGPTService extends BaseGPTService<WorkshopCard[], ResponseData, FixCandidate[]> {
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

const PromptPrefix = `Find domain events no specific meaning, and provide possible fix. The response must ONLY contain events in real input event names, and response should ONLY and STRICTLY follow the example JSON format but not content below:
{
   "incorrectQuantity" : 5,
   "items" : [
        {"No Specific Meaning or No Specific Impact Event" :  "<Possible Fix>", "confidence" : 0.7},
        {"下单": "抖音电商订单已提交",  "confidence" : 0.53}
   ]
}
make your response as concise as possible, with no introduction or background at the start, no summary at the end, and outputting only JSON code for answers where code is appropriate.
The real Input Event Names are as following:
`

const PromptPostfix = `
Your JSON ONLY response should be:
`