export class VoteItem {
    constructor(
        public eventName: string,
        public familiarity: number | null = null,
        public pastTense: boolean | null = null,
        public specific: boolean | null = null,
        public independent: boolean | null = null,
        public impact: number | null = null,
        public interest: number | null = null,
    ) {
    }
}
