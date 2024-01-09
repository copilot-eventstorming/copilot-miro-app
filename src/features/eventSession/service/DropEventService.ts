import {WorkshopBoardSPI, WorkshopCard} from "../../../application/spi/WorkshopBoardSPI";

export class DropEventService {
    private boardSPI: WorkshopBoardSPI;
    constructor(boardSPI: WorkshopBoardSPI) {
        this.boardSPI = boardSPI;
    }

    async perform(card: WorkshopCard) {
        await this.boardSPI.dropCard(card);
    }
}