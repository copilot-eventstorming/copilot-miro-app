import {IMessageHandler} from "../../../application/messaging/IMessageHandler";
import {ProblemFixSuggestionApplied} from "../message/ProblemFixSuggestionApplied";
import {FixSuggestion} from "../../types/FixSuggestion";

export class UpdateFixSuggestionHandler implements IMessageHandler<ProblemFixSuggestionApplied> {
    private readonly fixSuggestions: () => FixSuggestion[];
    private readonly setFixSuggestions: (gptData: FixSuggestion[]) => void;

    constructor(fixSuggestions: () => FixSuggestion[], setFixSuggestions: (gptData: FixSuggestion[]) => void) {
        this.fixSuggestions = fixSuggestions;
        this.setFixSuggestions = setFixSuggestions;
    }

    handleMessage(message: ProblemFixSuggestionApplied): Promise<void> {
        const unfixed = this.fixSuggestions().filter((suggestion) => suggestion.id !== message.fixSuggestion.id)
        console.log('fixSuggestions', this.fixSuggestions(), 'message', message, 'unfixed', unfixed)
        if (unfixed) {
            this.setFixSuggestions([...unfixed])
        }
        return Promise.resolve();
    }

    release() {
    }
}

