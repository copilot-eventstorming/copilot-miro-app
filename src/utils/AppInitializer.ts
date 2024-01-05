import {initializeSession} from "./CopilotSessionInitializer";
import {initializeMessaging, releaseMessaging} from "./MessagingBroadcastingInitializer";

export function initialize() {
    initializeSession();
    initializeMessaging();
}

export function release() {
    releaseMessaging();
}