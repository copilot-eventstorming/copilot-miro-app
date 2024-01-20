import {IMessageHandler} from "../../../../application/messaging/IMessageHandler";
import {EventSessionVoteResult} from "../message/EventSessionVoteResult";
import {
    EventFeedback,
    EventSessionVoteRepository,
    ItemFeedback,
    ParticipantFeedback
} from "../../repository/EventSessionVoteRepository";
import {VoteItem} from "../../types/VoteItem";
import {Familiarity, Impact, Independent, PastTense, Specific} from "../../types/EventFeedbackMetricNames";

export class EventSessionVoteResultHandler implements IMessageHandler<EventSessionVoteResult> {
    private voteRepository: EventSessionVoteRepository;
    private callback: (feedbacks: ParticipantFeedback[]) => void;

    constructor(voteRepository: EventSessionVoteRepository, callback: (feedbacks: ParticipantFeedback[]) => void) {
        this.voteRepository = voteRepository;
        this.callback = callback;
    }

    private mapItemFeedback(voteItem: VoteItem): ItemFeedback[] {
        return [
            new ItemFeedback(Familiarity, voteItem.familiarity?.toString() ?? ''),
            new ItemFeedback(PastTense, voteItem.pastTense?.toString() ?? ''),
            new ItemFeedback(Specific, voteItem.specific?.toString() ?? ''),
            new ItemFeedback(Independent, voteItem.independent?.toString() ?? ''),
            new ItemFeedback(Impact, voteItem.impact?.toString() ?? ''),
        ]
    }

    handleMessage(message: EventSessionVoteResult): Promise<void> {
        console.log(message)
        const participantFeedback = new ParticipantFeedback(
            message.sender!,
            message.senderName,
            message.results.map((result) => {
                return new EventFeedback(
                    result.eventName,
                    this.mapItemFeedback(result))
            })
        )
        this.voteRepository.loadVotes().then((savedFeedbacks) => {
            const otherFeedbacks = savedFeedbacks?.filter((feedback) => feedback.participantId !== message.sender) ?? []
            const newFeedbacks = [...otherFeedbacks, participantFeedback]
            this.voteRepository
                .saveVotes(newFeedbacks)
                .then((saveResult) => {
                    if (saveResult.success) {
                        console.log('Saved vote result', JSON.stringify(participantFeedback))
                    } else {
                        console.log('Failed to save vote result', saveResult.error)
                    }
                    this.callback(newFeedbacks)
                })
        })

        return Promise.resolve(undefined);
    }

    release(): void {
    }

}