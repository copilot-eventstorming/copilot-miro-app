import {IMessageHandler} from "../../../application/messaging/IMessageHandler";
import {ClosePanelRequest} from "../message/ClosePanelRequest";

export class ClosePanelHandler implements IMessageHandler<ClosePanelRequest> {
    handleMessage(message: ClosePanelRequest): Promise<void> {
        if (!miro.board.ui.canOpenPanel()) {
            return miro.board.ui.closePanel()
        } else {
            return Promise.resolve()
        }
    }

    release() {
    }
}