import {WorkshopBoardSPI, WorkshopCard} from "../../../../../application/spi/WorkshopBoardSPI";
import React, {useEffect, useRef, useState} from "react";
import {
    ClusterSimilarDomainEventByGPTService,
    SimilarityGroup
} from "../../../service/ClusterSimilarDomainEventByGPTService";
import {SimilarEventsGroupLayoutService} from "../../../service/SimilarEventsGroupLayoutService";
import {SaveActions} from "../../../../../application/repository";
import {OperationLogChannel} from "../../../../operationLogs/types/OperationLogChannels";
import {OperationLogDeleted, OperationLogRestore} from "../../../../operationLogs/types/OperationLogEvent";
import {SaveOperation} from "../SaveOperation";
import {cleanHtmlTag} from "../../../../../application/service/utils/utils";
import {
    AzureOpenAIConfiguration,
    CopilotSession,
    GPTConfiguration,
    gptConfiguration$,
    manuallyAskGPTConfiguration,
    ManuallyAskGPTConfiguration,
    OpenAIGPTConfiguration
} from "../../../../../application/CopilotSession";
import {GPTConfigurationRepository} from "../../../../../application/repository/GPTConfigurationRepository";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faCopy} from '@fortawesome/free-solid-svg-icons'
import {analyzeSimilarityByGPT} from "../../../utils/RemoveDuplicatesUtils";

export type TEventDeduplicationProps = {
    boardSPI: WorkshopBoardSPI;
    cards: WorkshopCard[];
    setCards: (cards: WorkshopCard[]) => void;
    drawerOpen: boolean;
    toggleDrawer: () => void;
    copilotSession: CopilotSession;
}

export type ConfigureGPTProps = {
    copilotSession: CopilotSession,
    setShowGptConfiguration: (v: boolean) => void,
    setShowPrompt: (v: boolean) => void,
}

export type AzureOpenAIConfigurationProps = {
    gptConfiguration: GPTConfiguration,
    setShowGptConfiguration: (v: boolean) => void,
    gptConfigurationRepo: GPTConfigurationRepository
}
const AzureOpenAIConfigurePanel: React.FC<AzureOpenAIConfigurationProps> = ({
                                                                                gptConfiguration,
                                                                                setShowGptConfiguration,
                                                                                gptConfigurationRepo
                                                                            }) => {
    const [endpoint, setEndpoint] = React.useState(gptConfiguration.endpoint);
    const [deploymentId, setDeploymentId] = React.useState((gptConfiguration as AzureOpenAIConfiguration).deploymentId);
    const [apiKey, setApiKey] = React.useState(gptConfiguration.apiKey);
    return <div className="w-full flex flex-col py-2">
        <table>
            <thead>
            <tr className="w-full flex flex-row">
                <th className="w-1/4"></th>
                <th className="flex-grow"></th>
            </tr>
            </thead>
            <tbody>
            <tr>
                <td><span className="my-1">Endpoint:</span></td>
                <td><input className="flex-grow mx-2 my-1 px-2 text-end bg-gray-50
                                    outline-none ring focus:ring-offset-2 border-gray-300 rounded-sm"
                           type="text"
                           value={endpoint}
                           onChange={(e) => setEndpoint(e.target.value)}
                /></td>
            </tr>

            <tr>
                <td><span>Deployment ID:</span></td>
                <td><input className="flex-grow mx-2 my-1 px-2 text-end bg-gray-50
                                    outline-none ring focus:ring-offset-2 border-gray-300 rounded-sm"
                           type="text"
                           value={deploymentId}
                           onChange={(e) => setDeploymentId(e.target.value)}
                /></td>
            </tr>

            <tr>
                <td><span>API Key:</span></td>
                <td><input className="flex-grow mx-2 my-1 px-2 text-end bg-gray-50
                                    outline-none ring focus:ring-offset-2 border-gray-300 rounded-sm"
                           type="password"
                           value={apiKey}
                           onChange={(e) => setApiKey(e.target.value)}
                /></td>
            </tr>
            <tr>
                <td>
                    <button className="btn btn-primary btn-primary-panel px-2 mt-2"
                            disabled={endpoint === "" || deploymentId === "" || apiKey === ""}
                            onClick={() => {
                                const gptConfiguration = new AzureOpenAIConfiguration(deploymentId, endpoint, apiKey)
                                console.log("tsx", gptConfiguration)
                                gptConfiguration$.next(gptConfiguration)
                                setShowGptConfiguration(false)
                            }}
                    >
                        Only In Session
                    </button>
                </td>
                <td className="flex-grow flex flex-row justify-center">
                    <button
                        className="btn btn-primary btn-primary-panel px-1 mx-1 mt-2"
                        disabled={endpoint === "" || deploymentId === "" || apiKey === ""}
                        onClick={() => {
                            const gptConfiguration = new AzureOpenAIConfiguration(deploymentId, endpoint, apiKey)
                            gptConfigurationRepo.saveGPTConfiguration(gptConfiguration)
                                .then(() => {
                                    gptConfiguration$.next(gptConfiguration)
                                    setShowGptConfiguration(false)
                                })
                        }}>
                        Save in Local Storage
                    </button>
                    <button className="btn btn-secondary btn-secondary-panel px-1 mx-1 mt-2"
                            onClick={() => {
                                setEndpoint("")
                                setDeploymentId("")
                                setApiKey("")
                                gptConfigurationRepo.removeGPTConfiguration().then(r => {
                                    gptConfiguration$.next(manuallyAskGPTConfiguration)
                                })
                            }}
                    >
                        Clear Storage
                    </button>
                </td>
            </tr>
            </tbody>
        </table>
    </div>;
}

const ConfigureGPT: React.FC<ConfigureGPTProps> = ({
                                                       copilotSession,
                                                       setShowGptConfiguration,
                                                       setShowPrompt
                                                   }) => {
    const [gptConfiguration, setGptConfiguration] = React.useState(copilotSession.gptConfiguration);

    const gptConfigurationRepo = new GPTConfigurationRepository()

    useEffect(() => {
        if (gptConfiguration.provider === ManuallyAskGPTConfiguration.Provider) {
            setShowPrompt(true)
        } else {
            setShowPrompt(false)
        }
    }, [gptConfiguration]);
    return <>
        <div
            className="border-orange-400 border-2 mx-2 my-4 px-4 py-2  border-opacity-50 rounded-sm text-cell text-cell-panel">
            <div>
                <label>
                    <input
                        type="radio" className="mr-2"
                        value={AzureOpenAIConfiguration.Provider}
                        checked={gptConfiguration.provider === AzureOpenAIConfiguration.Provider}
                        onChange={(e) => setGptConfiguration({
                            ...gptConfiguration,
                            provider: e.target.value
                        })}
                    />
                    Azure OpenAI
                </label>
            </div>
            <div>
                <label>
                    <input
                        type="radio" className="mr-2"
                        value={OpenAIGPTConfiguration.Provider}
                        checked={gptConfiguration.provider === OpenAIGPTConfiguration.Provider}
                        onChange={(e) => setGptConfiguration({
                            ...gptConfiguration,
                            provider: e.target.value
                        })}
                    />
                    OpenAI
                </label>
            </div>
            <div>
                <label>
                    <input
                        type="radio" className="mr-2"
                        value={ManuallyAskGPTConfiguration.Provider}
                        checked={gptConfiguration.provider === ManuallyAskGPTConfiguration.Provider}
                        onChange={(e) => {
                            setGptConfiguration({
                                ...gptConfiguration,
                                provider: e.target.value
                            })
                            gptConfiguration$.next(manuallyAskGPTConfiguration)
                        }
                        }
                    />
                    Manually Copy/Paste Prompt
                </label>
            </div>

            {gptConfiguration.provider === AzureOpenAIConfiguration.Provider &&
                <AzureOpenAIConfigurePanel gptConfiguration={gptConfiguration}
                                           setShowGptConfiguration={setShowGptConfiguration}
                                           gptConfigurationRepo={gptConfigurationRepo}/>}
            {gptConfiguration.provider === OpenAIGPTConfiguration.Provider && (
                <div>
                    {/* OpenAI configuration fields */}
                </div>
            )}
            {gptConfiguration.provider === ManuallyAskGPTConfiguration.Provider && (
                <div/>
            )}
        </div>
    </>;
}


type ManuallyCopyPastePromptProps = {
    boardSPI: WorkshopBoardSPI,
    setCards: (cards: WorkshopCard[]) => void,
    groupingService: ClusterSimilarDomainEventByGPTService,
    cards: WorkshopCard[],
    setSimilarityGroups: (value: SimilarityGroup[]) => void,
    setGroupedCards: (value: WorkshopCard[][]) => void

}
const ManuallyCopyPastePrompt: React.FC<ManuallyCopyPastePromptProps> = ({
                                                                             boardSPI,
                                                                             setCards,
                                                                             groupingService,
                                                                             cards,
                                                                             setSimilarityGroups,
                                                                             setGroupedCards
                                                                         }) => {
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);

    const handleCopy = () => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.select();
            document.execCommand('copy');
        }
    };
    return <div>
        <div className="w-full centered my-1 flex flex-col"
             title="Manually Copy/Paste Prompt">
            <div className="flex flex-row py-1 justify-between items-center relative">
                <label className="font-lato mx-2 sub-title py-1 centered flex-grow">Prompt:</label>
                <button className="btn btn-secondary btn-secondary-panel px-2"
                        onClick={() => {
                            boardSPI.fetchEventCards().then(setCards)
                        }}
                >Reload
                </button>
            </div>
            <div className="w-full flex flex-col relative">
                               <textarea ref={textareaRef} className="w-auto h-48 px-1 my-1 mx-2 bg-gray-50 font-lato text-xs
                                    outline-none ring focus:ring-offset-0 border-gray-300 rounded-sm"
                                         onChange={(e) => {
                                         }}
                                         value={groupingService.generatePrompt(cards)}>
                               </textarea>
                <button className="absolute top-0 right-0 mx-6 my-3" onClick={handleCopy}>
                    <FontAwesomeIcon icon={faCopy} className="text-orange-400"/>
                </button>
            </div>
        </div>
        <div className="w-full flex flex-col py-2">
            <label className="font-lato mx-2 sub-title py-1">GPT Response:</label>
            <textarea className="w-auto h-48 px-1 my-1 mx-2 bg-gray-50 font-lato text-xs
                                    outline-none ring focus:ring-offset-0 border-gray-300 rounded-sm"
                      onChange={(e) => {
                          let response = e.target.value;
                          try {
                              let cardGroups = groupingService.parseResponse(cards, response);
                              setSimilarityGroups(cardGroups)
                              const grouped = cardGroups
                                  .map(group => group.groupMembers)
                                  .filter(group => group.length > 1)
                                  .sort((a, b) => b.length - a.length)
                              setGroupedCards(grouped)
                          } catch (e) {
                              console.log(e)
                          }
                      }}>
                            </textarea>
        </div>
    </div>;
}

type LayoutOptimizationProps = {
    boardSPI: WorkshopBoardSPI,
    similarityGroups: SimilarityGroup[],
    groupedCards: WorkshopCard[][]

}
const LayoutOptimization: React.FC<LayoutOptimizationProps> = ({
                                                                   boardSPI,
                                                                   similarityGroups,
                                                                   groupedCards
                                                               }) => {
    const layoutService: SimilarEventsGroupLayoutService = new SimilarEventsGroupLayoutService(boardSPI)
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

    return <div className="w-full centered py-2">
        <button className="btn btn-primary btn-primary-panel mx-1 px-2"
                onClick={() => {
                    saveActions?.save('Auto-save before cluster similar events', 'Event Storming Session')
                        .then(async () => await layoutService.perform(similarityGroups))
                        .then(() => saveActions?.save('Auto-save after cluster similar events', 'Event Storming Session'))
                }}
                disabled={groupedCards.length === 0}>Cluster Similar Events
        </button>
        <SaveOperation saveActions={saveActions} redoQty={redoQty} undoQty={undoQty}
                       setConsoleOutput={setConsoleOutput}/>
    </div>;
}

type SimilarGroupsProps = {
    groupedCards: WorkshopCard[][],
    boardSPI: WorkshopBoardSPI
}
const SimilarGroups: React.FC<SimilarGroupsProps> = ({groupedCards, boardSPI}) => {
    console.log("SimilarGroups", groupedCards.length, groupedCards)
    return <table className="w-full py-2">
        <thead>
        <tr>
            <th className="head header-panel">Quantity</th>
            <th className="head header-panel">Similar Event Candidates</th>
        </tr>
        </thead>
        <tbody>
        {
            groupedCards
                .filter(group => group.length > 1)
                .map((group, index) => (
                <tr key={index} className={index % 2 === 0 ? 'odd_row' : 'even_row'}>
                    <td className="text-cell text-cell-panel text-center">{group.length}</td>
                    <td>
                        <div>
                            {
                                <div>{group.map(card => (
                                    <div key={`${card.id}-${index}`}
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
    </table>;
}

type TMainButtonsProps = {
    showGptConfiguration: boolean,
    isLoading: boolean,
    showPrompt: boolean,
    copilotSession: CopilotSession,
    boardSPI: WorkshopBoardSPI,
    groupingService: ClusterSimilarDomainEventByGPTService,
    setIsLoading: (value: boolean) => void,
    setSimilarityGroups: (value: SimilarityGroup[]) => void,
    setGroupedCards: (value: WorkshopCard[][]) => void
    setShowGptConfiguration: (value: boolean) => void,
}
const MainButtons: React.FC<TMainButtonsProps> = ({
                                                      setShowGptConfiguration,
                                                      showGptConfiguration,
                                                      isLoading,
                                                      showPrompt,
                                                      copilotSession,
                                                      setIsLoading,
                                                      boardSPI,
                                                      groupingService,
                                                      setSimilarityGroups,
                                                      setGroupedCards
                                                  }) => {
    const [maxTokens, setMaxTokens] = React.useState(1000);
    const [temperature, setTemperature] = React.useState(0.3);
    return (
        <div className="w-full flex flex-col">
            <div className="w-full centered my-2 flex flex-row justify-center space-x-4">
                <button className="btn btn-primary btn-primary-panel px-2"
                        onClick={() => {
                            setShowGptConfiguration(!showGptConfiguration)
                        }}
                >Configure GPT
                </button>
                <button className="btn btn-primary btn-primary-panel px-2"
                        disabled={isLoading || showPrompt || copilotSession.gptConfiguration.provider === ManuallyAskGPTConfiguration.Provider}
                        onClick={() => {
                            if (copilotSession && copilotSession.gptConfiguration.provider !== ManuallyAskGPTConfiguration.Provider) {
                                setIsLoading(true)
                                analyzeSimilarityByGPT(boardSPI, groupingService, copilotSession, setSimilarityGroups, setGroupedCards, {maxTokens, temperature})
                                    .then(() => setIsLoading(false))
                            }
                        }}>Similarity Analysis
                </button>
            </div>
            {
                copilotSession.gptConfiguration.provider !== ManuallyAskGPTConfiguration.Provider &&
                <div className="w-full flex flex-col">
                    <div className="flex justify-between items-center py-1 odd_row">
                        <label className="text-left text-gray-900 text-xs pr-2 mr-5" htmlFor="maxTokens">Max Tokens</label>
                        <div className="w-full pl-10 pr-3">
                            <input id="maxTokens" type="range" min="0" max="5000" step="1" value={maxTokens}
                                   className="slider bg-amber-500 flex-grow"
                                   // style={{"width": "100%"}}
                                   onChange={event => {
                                       setMaxTokens(parseInt(event.target.value))
                                   }}/>
                        </div>
                        <label className="text-left text-gray-900 text-xs mr-2">{maxTokens}</label>
                    </div>
                    <div className="flex justify-between items-center py-1 even_row">
                        <label className="text-left text-gray-900 text-xs" htmlFor="temperature">Temperature</label>
                        <div className="w-full pl-10 pr-3">
                            <input id="temperature" type="range" min="0" max="1" step="0.01" value={temperature}
                                   className="slider bg-amber-500"
                                   // style={{"width": "100%"}}
                                   onChange={event => {
                                       setTemperature(parseFloat(event.target.value))
                                   }}/>
                        </div>
                        <label className="text-left text-gray-900 text-xs mr-2">{temperature}</label>
                    </div>
                </div>
            }
        </div>)
}

export const RemoveDuplicates: React.FC<TEventDeduplicationProps> = ({
                                                                         boardSPI,
                                                                         copilotSession,
                                                                         drawerOpen,
                                                                         toggleDrawer,
                                                                         cards,
                                                                         setCards
                                                                     }) => {

    const groupingService = new ClusterSimilarDomainEventByGPTService()
    const [isLoading, setIsLoading] = useState(false) // 新增一个状态来跟踪异步操作是否正在进行
    const [groupedCards, setGroupedCards] = useState([] as WorkshopCard[][]) // 新增一个状态来保存分组后的卡片
    const [similarityLayoutGroups, setSimilarityLayoutGroups] = useState([] as SimilarityGroup[]) // 新增一个状态来保存分组后的卡片
    const [showPrompt, setShowPrompt] = React.useState(false);
    const [showGptConfiguration, setShowGptConfiguration] = React.useState(false);


    return (
        <div className="w-full my-2 mb-4">
            <div className="w-full divider"/>

            <div className="w-full">
                <MainButtons boardSPI={boardSPI} copilotSession={copilotSession}
                             setShowGptConfiguration={setShowGptConfiguration} groupingService={groupingService}
                             showGptConfiguration={showGptConfiguration} isLoading={isLoading}
                             setIsLoading={setIsLoading} showPrompt={showPrompt}
                             setSimilarityGroups={setSimilarityLayoutGroups} setGroupedCards={setGroupedCards}/>

                {isLoading && (<div className="spinner"/>)}

                {showGptConfiguration &&
                    <ConfigureGPT copilotSession={copilotSession}
                                  setShowGptConfiguration={setShowGptConfiguration}
                                  setShowPrompt={setShowPrompt}/>}
                {showPrompt &&
                    <ManuallyCopyPastePrompt boardSPI={boardSPI}
                                             setCards={setCards}
                                             groupingService={groupingService}
                                             cards={cards}
                                             setSimilarityGroups={setSimilarityLayoutGroups}
                                             setGroupedCards={setGroupedCards}/>}

                {similarityLayoutGroups.length > 0 &&
                    <LayoutOptimization boardSPI={boardSPI}
                                        groupedCards={groupedCards}
                                        similarityGroups={similarityLayoutGroups}/>}

                {groupedCards.length > 0 &&
                    <SimilarGroups groupedCards={groupedCards} boardSPI={boardSPI}/>}

                <div className="w-full divider"/>
            </div>
        </div>)
}

