import {findLocally, saveLocally, SaveResult} from "../../../utils/localStorage";

export class ItemFeedback {
    constructor(
        public item: string,
        public feedback: string) {
    }
}

export class EventFeedback {
    constructor(public eventName: string,
                public items: ItemFeedback[]) {
    }
}

export class ParticipantFeedback {
    constructor(public participantId: string, public participantName: string, public feedback: EventFeedback[]) {
    }
}

export class EventSessionVoteRepository {
    private readonly boardId: string;

    constructor(boardId: string) {
        this.boardId = boardId;
    }

    key(boardId: string): string {
        return `event-session-vote-${boardId}`;
    }

    saveVotes(feedbacks: ParticipantFeedback[]): Promise<SaveResult> {
        return saveLocally(this.key(this.boardId), feedbacks);
    }

    loadVotes(): Promise<ParticipantFeedback[]> {
        return findLocally(this.key(this.boardId))
    }

}