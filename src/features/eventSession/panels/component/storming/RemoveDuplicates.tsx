import {WorkshopBoardSPI, WorkshopCard} from "../../../../../application/spi/WorkshopBoardSPI";
import React, {useEffect, useState} from "react";
import {
    GroupByDuplicationDomainEventService,
    SimilarityGroup
} from "../../../service/GroupByDuplicationDomainEventService";
import {SimilarEventsGroupLayoutService} from "../../../service/SimilarEventsGroupLayoutService";
import {SaveActions} from "../../../../../application/repository";
import {OperationLogChannel} from "../../../../operationLogs/types/OperationLogChannels";
import {OperationLogDeleted, OperationLogRestore} from "../../../../operationLogs/types/OperationLogEvent";
import {Drawer} from "../../../../../component/drawer";
import {SaveOperation} from "../SaveOperation";
import {cleanHtmlTag} from "../../../../../application/service/utils/utils";

export type TEventDeduplicationProps = {
    boardSPI: WorkshopBoardSPI;
    cards: WorkshopCard[];
    drawerOpen: boolean;
    toggleDrawer: () => void;
}
export const RemoveDuplicates: React.FC<TEventDeduplicationProps> = ({boardSPI, drawerOpen, toggleDrawer, cards}) => {
    const groupingService = new GroupByDuplicationDomainEventService()
    const layoutService: SimilarEventsGroupLayoutService = new SimilarEventsGroupLayoutService(boardSPI)
    const [isLoading, setIsLoading] = useState(false) // 新增一个状态来跟踪异步操作是否正在进行
    const [groupedCards, setGroupedCards] = useState([] as WorkshopCard[][]) // 新增一个状态来保存分组后的卡片
    const [similarityGroups, setSimilarityGroups] = useState([] as SimilarityGroup[]) // 新增一个状态来保存分组后的卡片

    const [consoleOutput, setConsoleOutput] = useState("");
    const [saveActions, setSaveActions] = React.useState(null as SaveActions | null);
    const [undoQty, setUndoQty] = React.useState(0);
    const [redoQty, setRedoQty] = React.useState(0);

    useEffect(() => {
        const operationLogEventChannel = new BroadcastChannel(OperationLogChannel);

        const handleEvent = async (event: MessageEvent) => {
            console.log('GraphOptimizerButtonGroup: receiveMessage', event)
            switch (event.data.type) {
                case OperationLogDeleted:
                    if (saveActions) {
                        saveActions.deleteLogById(event.data.id)
                    }
                    break;
                case OperationLogRestore:
                    if (saveActions) {
                        await saveActions.loadByLogId(event.data.id)
                        await miro.board.ui.closeModal();
                    }
                    break;
            }
        };

        operationLogEventChannel.addEventListener("message", handleEvent)

        // 在 useEffect 的清理函数中移除事件监听器
        return () => {
            operationLogEventChannel.removeEventListener("message", handleEvent);
            operationLogEventChannel.close();
        };
    }, [saveActions]);


    useEffect(() => {
            if (saveActions == null) {
                boardSPI.fetchBoardInfo().then(board => {
                    const actions = new SaveActions(board.id,
                        setUndoQty,
                        setRedoQty,
                        setConsoleOutput,
                        boardSPI);
                    setSaveActions(actions);
                })
            }
        }
    )
    return (<div className="w-full">

        <div className="flex items-center w-full px-1.5">
            <Drawer isOpen={drawerOpen} style={{marginRight: '10px'}} toggleDrawer={toggleDrawer}/>
            <div className="sub-title sub-title-panel text-sm">Deduplicating Similar Events</div>
        </div>

        {drawerOpen && (
            <div className="w-full">
                <div className="w-full centered my-2 flex flex-row justify-center space-x-4 px-1.5">
                    <button className="btn btn-primary btn-primary-panel px-2"
                            disabled={isLoading}
                            onClick={() => {
                                groupingService.perform(cards)
                                    .then(cardGroups => {
                                        setSimilarityGroups(cardGroups)
                                        return cardGroups.map(group => group.groupMembers)
                                    })
                                    .then(setGroupedCards)
                                    .catch(reason => {
                                        console.log("deduplication Failed", reason)
                                    })
                            }}>Similarity Analysis
                    </button>
                    <button className="btn btn-primary btn-primary-panel mx-1"
                            onClick={() => {
                                saveActions?.save('Auto-save before cluster similar events', 'Event Storming Session')
                                    .then(async () => await layoutService.perform(similarityGroups))
                                    .then(() => saveActions?.save('Auto-save after cluster similar events', 'Event Storming Session'))
                            }}
                            disabled={groupedCards.length === 0}>Cluster Similar Events
                    </button>
                </div>
                <SaveOperation saveActions={saveActions} redoQty={redoQty} undoQty={undoQty}
                               setConsoleOutput={setConsoleOutput}/>
                <table className="w-full">
                    <thead>
                    <tr>
                        <th className="head header-panel">Quantity</th>
                        <th className="head header-panel">Similar Event Candidates</th>
                    </tr>
                    </thead>
                    <tbody>
                    {
                        groupedCards.map((group, index) => (
                            <tr key={index} className={index % 2 === 0 ? 'odd_row' : 'even_row'}>
                                <td className="text-cell text-cell-panel text-center">{group.length}</td>
                                <td>
                                    <div>
                                        {
                                            <div>{group.map(card => (
                                                <div key={card.id}
                                                     className="clickable-label text-cell text-cell-panel text-left"
                                                     onClick={() => boardSPI.zoomToCard(card.id)}
                                                >{cleanHtmlTag(card.content)}</div>
                                            ))}
                                            </div>
                                        }
                                    </div>
                                </td>
                            </tr>
                        ))
                    }
                    </tbody>
                </table>

            </div>
        )}
    </div>)
}
