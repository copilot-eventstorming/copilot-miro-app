export class FixSuggestion {
    constructor(public readonly id: string,
                public readonly text: string[],
                public readonly suggestion: string[],
                public readonly typeName: FixSuggestionType) {
    }
}

export enum FixSuggestionType {
    PastTensIssue = 0,
    IndependenceIssue = 1,
    SpecificMeaningIssue = 2,
}

export const FixSuggestionTypeLabel = {
    [FixSuggestionType.PastTensIssue]: 'Past Tense Issue',
    [FixSuggestionType.IndependenceIssue]: 'Independence Issue',
    [FixSuggestionType.SpecificMeaningIssue]: 'Specific Meaning Issue',
};
