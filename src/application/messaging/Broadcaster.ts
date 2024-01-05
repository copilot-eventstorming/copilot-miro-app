import {MiroProxy} from "../../api/MiroProxy";
import {IMessage} from "./IMessage";

export class Broadcaster {
    miroProxy: MiroProxy

    constructor(miroProxy: MiroProxy) {
        this.miroProxy = miroProxy;
    }

    async broadcast(message: IMessage) {
        console.log('Broadcaster is broadcasting', message)
        await this.miroProxy.broadcast(message);
    }

}