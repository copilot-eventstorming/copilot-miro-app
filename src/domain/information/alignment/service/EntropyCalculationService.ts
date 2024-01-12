export class Reaction {
    constructor(
        public item: string,
        public reaction: string,
    ) {
    }
}

export class KnowledgeReaction {
    constructor(
        public knowledge: string,
        public reactions: Reaction[],
    ) {
    }
}

export class Participant {
    constructor(
        public id: string,
        public name: string,
    ) {
    }
}

export class ParticipantKnowledgeReaction {
    constructor(
        public participant: Participant,
        public reactions: KnowledgeReaction[]) {
    }
}

export class EntropyCalculationRequest {
    constructor(
        public knowledgeSet: string[],
        public items: string[],
        public participantKnowledgeReactions: ParticipantKnowledgeReaction[]) {
    }
}

export class KnowledgeItemEntropy {
    constructor(
        public knowledge: string,
        public item: string,
        public entropy: number,
    ) {
    }
}

export class KnowledgeEntropy {
    constructor(
        public knowledge: string,
        public entropy: number,
        public entropyPerKnowledgeItem: KnowledgeItemEntropy[],
    ) {
    }
}

export class EntropyCalculationResult {
    constructor(
        public totalEntropy: number,
        public entropyPerKnowledge: KnowledgeEntropy[],
    ) {
    }
}

export class EntropyCalculationService {
    constructor() {
    }

    calculateEntropy(request: EntropyCalculationRequest): EntropyCalculationResult {
        console.log(request)
        const uniqueReactions = this.calculateUniqueReactions(request);
        console.log(uniqueReactions)
        const entropyPerKnowledgeItem = this.calculateEntropyPerKnowledgeItem(uniqueReactions);
        console.log(entropyPerKnowledgeItem)
        const entropyPerKnowledge = this.calculateEntropyPerKnowledge(entropyPerKnowledgeItem);
        console.log(entropyPerKnowledge)
        const totalEntropy = this.calculateTotalEntropy(entropyPerKnowledge);
        return {
            totalEntropy,
            entropyPerKnowledge: Array.from(entropyPerKnowledge.entries())
                .map(([knowledge, entropy]) => {
                    return {
                        knowledge,
                        entropy,
                        entropyPerKnowledgeItem: Array.from(entropyPerKnowledgeItem.get(knowledge)!.entries()).map(([item, entropy]) => {
                            return {
                                knowledge,
                                item,
                                entropy
                            }
                        })
                    }
                }).sort((a, b) => b.entropy - a.entropy)
        }
    }

    //从外到内，最外层string 为 knowledge -> itemName -> itemValue, number 为该itemValue 出现的次数
    calculateUniqueReactions(request: EntropyCalculationRequest): Map<string, Map<string, Map<string, number>>> {
        const uniqueReactions = new Map<string, Map<string, Map<string, number>>>();

        for (const participantKnowledgeReaction of request.participantKnowledgeReactions) {
            for (const knowledgeReaction of participantKnowledgeReaction.reactions) {
                for (const reaction of knowledgeReaction.reactions) {
                    const reactionValues = typeof reaction.reaction === 'string' ? [reaction.reaction] : reaction.reaction;
                    for (const reactionValue of reactionValues) {
                        if (uniqueReactions.has(knowledgeReaction.knowledge)) {
                            const items = uniqueReactions.get(knowledgeReaction.knowledge)!;
                            if (items.has(reaction.item)) {
                                const itemValues = items.get(reaction.item)!;
                                itemValues.set(reactionValue, (itemValues.get(reactionValue) || 0) + 1);
                            } else {
                                items.set(reaction.item, new Map([[reactionValue, 1]]));
                            }
                        } else {
                            uniqueReactions.set(knowledgeReaction.knowledge, new Map([[reaction.item, new Map([[reactionValue, 1]])]]));
                        }
                    }
                }
            }
        }

        return uniqueReactions;
    }

    private calculateEntropyPerKnowledgeItem(uniqueReactions: Map<string, Map<string, Map<string, number>>>): Map<string, Map<string, number>> {
        const entropyPerKnowledgeItem = new Map<string, Map<string, number>>();
        for (const [knowledge, items] of uniqueReactions.entries()) {
            const entropyMap = new Map<string, number>();
            for (const [item, itemValues] of items.entries()) {
                const totalItemValues = Array.from(itemValues.values()).reduce((total, count) => total + count, 0);
                for (const [itemValue, count] of itemValues.entries()) {
                    const probability = count / totalItemValues;
                    const entropy = -probability * Math.log2(probability);
                    entropyMap.set(item, entropy);
                }
            }
            entropyPerKnowledgeItem.set(knowledge, entropyMap);
        }
        return entropyPerKnowledgeItem;
    }

    private calculateEntropyPerKnowledge(entropyPerKnowledgeItem: Map<string, Map<string, number>>): Map<string, number> {
        const entropyPerKnowledge = new Map<string, number>();
        for (const [knowledge, reactions] of entropyPerKnowledgeItem) {
            const entropy = Array.from(reactions.values()).reduce((a, b) => a + b, 0);
            entropyPerKnowledge.set(knowledge, entropy);
        }
        return entropyPerKnowledge;
    }

    private calculateTotalEntropy(entropyPerKnowledge: Map<string, number>): number {
        return Array.from(entropyPerKnowledge.values()).reduce((a, b) => a + b, 0);
    }
}