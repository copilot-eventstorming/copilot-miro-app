import {WorkshopCard} from "../../../application/spi/WorkshopBoardSPI";

export class Hotspot {
    constructor(public id: string, public content: string, public card: WorkshopCard, public resolved: boolean, public createdBy: string) {
    }
}