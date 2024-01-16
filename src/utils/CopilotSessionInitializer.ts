import {copilotSession$, gptConfiguration$, manuallyAskGPTConfiguration} from "../application/CopilotSession";
import {GPTConfigurationRepository} from "../application/repository/GPTConfigurationRepository";

// each html file's js application, needs to be initialized
const gptConfigurationRepo = new GPTConfigurationRepository()

export function initializeSession() {
    miro.board.getUserInfo().then((user) => {
        miro.board.getInfo().then((board) => {
            gptConfigurationRepo.loadGPTConfiguration().then((gptConfiguration) => {
                gptConfiguration$.next(gptConfiguration || manuallyAskGPTConfiguration)
                console.log("initializeSession", "gptConfiguration", gptConfiguration, "user", user, "board", board)
                copilotSession$.next({
                    miroUserId: user.id,
                    miroUsername: user.name,
                    miroBoardId: board.id,
                    gptConfiguration: gptConfiguration || manuallyAskGPTConfiguration
                })
            })
        })
    })
}
