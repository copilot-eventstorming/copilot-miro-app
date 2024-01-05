import {copilotSession$} from "../application/CopilotSession";

// each html file's js application, needs to be initialized
export function initializeSession() {
    miro.board.getUserInfo().then((user) => {
        miro.board.getInfo().then((board) => {
            copilotSession$.next({
                miroUserId: user.id,
                miroUsername: user.name,
                miroBoardId: board.id
            })
        })
    })
}
