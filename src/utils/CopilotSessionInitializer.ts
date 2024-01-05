import {copilotSession$} from "../application/CopilotSession";

// each html file's js application, needs to be initialized
export function initializeSession() {
    miro.board.getUserInfo().then((user) => {
        copilotSession$.next({
            miroUserId: user.id,
            miroUsername: user.name,
        })
        console.log('init copilot session', copilotSession$.value)
    })
}
