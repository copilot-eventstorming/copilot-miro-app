import {WorkshopBoardSPI} from "../../spi/WorkshopBoardSPI";
import {Connector} from "@mirohq/websdk-types";

export class OptimizeConnectorsService {
    private boardSPI: WorkshopBoardSPI;

    constructor(boardSPI: WorkshopBoardSPI) {
        this.boardSPI = boardSPI;
    }

    async perform(): Promise<Connector[]> {

        const connectors = await this.boardSPI.fetchConnectors();
        const xs = connectors.filter(c => c.start !== undefined && c.end !== undefined);

        for (const conn of xs) {
            conn.start!.snapTo = 'auto';
            conn.end!.snapTo = 'auto';
            await conn.sync();
        }

        return xs
    }
}