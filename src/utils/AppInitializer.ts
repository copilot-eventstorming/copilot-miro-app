import {initializeSession} from "./CopilotSessionInitializer";
import {initializeMessaging} from "./MessagingBroadcastingInitializer";

export function initialize() {
    initializeSession();
    initializeMessaging();
}