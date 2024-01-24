import {WorkshopBoardSPI} from "../../../application/spi/WorkshopBoardSPI";
import {ShapeProps, StickyNote, StickyNoteProps} from "@mirohq/websdk-types";
// @ts-ignore
import events from '@/features/eventSession/resources/events.json';
// @ts-ignore
import PNEvents from '@/features/eventSession/resources/PNEvents.json';
// @ts-ignore
import hotspots from '@/features/eventSession/resources/hotspots.json';

export class AddEventStormingSampleService {
    private boardSPI: WorkshopBoardSPI;

    constructor(boardSPI: WorkshopBoardSPI) {
        this.boardSPI = boardSPI;
    }

    async addPNEventSample() {
        await this.loadPositiveNegativeEvents().then(props => {
            console.log(props)
            return Promise.allSettled(props.map(item => {
                return this.boardSPI.createStickyNote(item);
            }))
        }).then(this.aimToCenter())
    }

    async addSample() {
        await this.loadExampleData().then(props => {
                return Promise.allSettled(props.map(item => {
                    return this.boardSPI.createStickyNote(item);
                })).then(this.aimToCenter()).then(() => {
                    this.loadHotspots()
                        .then(xs => {
                            Promise.allSettled(xs.map(x => {
                                this.boardSPI.createShapes(x);
                            }))
                        })
                })
            }
        )
    }

    private aimToCenter() {
        return (xs: Array<PromiseSettledResult<Awaited<Promise<StickyNote>>>>) => {
            // calculate top left corner coordinates from xs

            // calculate top left corner coordinates from xs
            const leftMost = xs.reduce((acc, curr) => {
                // Check if the promise is fulfilled before accessing the value property
                if (curr.status === 'fulfilled') {
                    return Math.min(curr.value.x, acc)
                }
                return acc;
            }, Infinity)
            const topMost = xs.reduce((acc, curr) => {
                // Check if the promise is fulfilled before accessing the value property
                if (curr.status === 'fulfilled') {
                    return Math.min(curr.value.y, acc)
                }
                return acc;
            }, Infinity);
            // calculate bottom right corner coordinates from xs
            const rightMost = xs.reduce((acc, curr) => {
                // Check if the promise is fulfilled before accessing the value property
                if (curr.status === 'fulfilled') {
                    return Math.max(acc, curr.value.x);
                }
                return acc;
            }, -Infinity)
            const bottomMost = xs.reduce((acc, curr) => {
                // Check if the promise is fulfilled before accessing the value property
                if (curr.status === 'fulfilled') {
                    return Math.max(acc, curr.value.y);
                }
                return acc;
            }, -Infinity)
            return miro.board.viewport.set({
                viewport: {
                    x: leftMost,
                    y: topMost,
                    width: rightMost - leftMost,
                    height: bottomMost - topMost
                }
            })
        };
    }

    private async loadExampleData(): Promise<StickyNoteProps[]> {
        // const response = await fetch('src/features/eventSession/resources/events.json');
        // return await response.json();
        return Promise.resolve(events)
    }

    private async loadPositiveNegativeEvents(): Promise<StickyNoteProps[]> {
        // const response = await fetch('src/features/eventSession/resources/events.json');
        // return await response.json();
        return Promise.resolve(PNEvents)
    }


    async clearBoard() {
        await this.boardSPI.clearBoard();
    }

    private async loadHotspots(): Promise<ShapeProps[]> {
        // const response = await fetch('src/features/eventSession/resources/hotspots.json');
        // return await response.json();
        return Promise.resolve(hotspots)
    }
}