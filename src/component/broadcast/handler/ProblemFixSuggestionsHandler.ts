import {IMessageHandler} from "../../../application/messaging/IMessageHandler";
import {ProblemFixSuggestionsMessage} from "../message/ProblemFixSuggestionsMessage";

export class ProblemFixSuggestionsHandler implements IMessageHandler<ProblemFixSuggestionsMessage> {

    async handleMessage(message: ProblemFixSuggestionsMessage): Promise<void> {
        if (await miro.board.ui.canOpenPanel()) {
            const url = new URL('panels/ParticipantFixProblemPanel.html', window.location.href);
            url.searchParams.append('sender', message.sender);
            url.searchParams.append('senderName', message.senderName);
            url.searchParams.append('subjectHeader', message.subjectHeader);
            url.searchParams.append('fixSuggestions', JSON.stringify(message.fixSuggestions));
            await miro.board.ui.openPanel({
                url: url.toString(),
            });
        }
    }

    release() {
        console.log(`Releasing ${this.constructor.name}`);
    }
}