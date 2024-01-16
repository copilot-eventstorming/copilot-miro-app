import {findLocally, removeLocally, saveLocally} from "../../utils/localStorage";
import {GPTConfiguration} from "../CopilotSession";

export class GPTConfigurationRepository {
    saveGPTConfiguration(gptConfiguration: GPTConfiguration) {
        return saveLocally("gptConfiguration", gptConfiguration)
    }

    loadGPTConfiguration(): Promise<GPTConfiguration | null> {
        return findLocally("gptConfiguration")
    }

    removeGPTConfiguration() {
        return removeLocally("gptConfiguration")
    }
}