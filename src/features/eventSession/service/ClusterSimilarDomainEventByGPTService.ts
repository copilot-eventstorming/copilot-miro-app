import {WorkshopCard} from "../../../application/spi/WorkshopBoardSPI";
import {cleanHtmlTag} from "../../../application/service/utils/utils";
import {contentWithoutSpace} from "../../../utils/WorkshopCardUtils";
import {BaseGPTService} from "../../../application/service/gpt/BaseGPTService";

export type DynamicObject = {
    [key: string]: string[];
};

export type SimilarityGroup = {
    groupName: string;
    groupMembers: WorkshopCard[];
}

export class ClusterSimilarDomainEventByGPTService extends BaseGPTService<WorkshopCard[], DynamicObject, SimilarityGroup[]> {
    parseResult(cards: WorkshopCard[], result: DynamicObject): SimilarityGroup[] {
        console.log("result", result)
        return Object.entries(result).flatMap(([key, values]) => ({
                groupName: key,
                groupMembers:
                    [...new Set(values)].flatMap(value => {
                        let uniqueCardIds = new Set(cards
                            .filter(card => contentWithoutSpace(card.content) === contentWithoutSpace(value)).map(card => card.id));
                        let cardsFiltered = cards.filter(card => uniqueCardIds.has(card.id))
                        return uniqueCardIds ? cardsFiltered : [];
                    })
            })
        );
    }

    emptyResult(): SimilarityGroup[] {
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

const PromptPrefix = `Domain Event Duplication Detection: Cluster the following domain event candidates into groups by the identity of their meaning, if you think they are duplicated events, then group them together, naming the cluster with any event candidate full name in the group, 
The example event candidate list cluster request is as following:
Order Created
Order Created
Order Placed
Create Order
Place Order 
Order Paid
Pay Order
Order Payment Completed
Order Delivered

The example response should ONLY and STRICTLY follow the JSON format below:
{
   "Order Created" : ["Order Created", "Order Created", "Order Placed", "Create Order", "Place Order"],
   "Order Paid" : ["Order Paid", "Pay Order", Order Payment Completed],
   "Order Delivered" : ["Order Delivered"]
}

The real Input Event Names are List as following:
`

const PromptPostfix = `
The JSON Response is:`