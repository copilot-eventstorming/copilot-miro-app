import {WorkshopBoardSPI, WorkshopCard} from "../../../application/spi/WorkshopBoardSPI";
import {Hotspot} from "../types/Hotspot";
import {cleanHtmlTag} from "../../../application/service/utils/utils";
import {Shape} from "@mirohq/websdk-types";

export class FetchHotspotsService {
    private boardSPI: WorkshopBoardSPI;

    constructor(boardSPI: WorkshopBoardSPI) {
        this.boardSPI = boardSPI;
    }

    async fetchHotspots(): Promise<Hotspot[]> {
        return this.boardSPI.fetchWorkshopUsers().then(async users => {
            const idNameMap = users.reduce((acc, user) => {
                acc.set(user.id, user.name);
                return acc;
            }, new Map<string, string>());

            let cards = await this.boardSPI.fetchHotSpotCards();
            return cards.map(this.mkHotspots(idNameMap));
        })

    }

    private mkHotspots(idNameMap: Map<string, string>) {
        return (card: WorkshopCard) => {
            const userName: string = idNameMap.get(card.createdBy) || 'Anonymous';
            return new Hotspot(card.id, cleanHtmlTag(card.content), card,
                card.style.fillColor === "#8fd14f",
                userName);
        };
    }

    async unresolveHotspot(card: Shape) {
        card.style.fillColor = "#da0063";
        card.style.color = '#ffffff';
        return this.boardSPI.updateHotspot(card).then(() => this.fetchHotspots())
    }

    async resolveHotspot(card: Shape) {
        card.style.fillColor = '#8fd14f';
        card.style.color = '#1a1a1a';
        return this.boardSPI.updateHotspot(card).then(() => this.fetchHotspots())
    }
}