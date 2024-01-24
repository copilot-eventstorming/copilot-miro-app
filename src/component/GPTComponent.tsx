import React, {useEffect, useRef, useState} from 'react';
import {WorkshopBoardSPI, WorkshopCard} from "../application/spi/WorkshopBoardSPI";
import {BaseGPTService} from "../application/service/gpt/BaseGPTService";
import {
    AzureOpenAIConfiguration,
    CopilotSession,
    gptConfiguration$,
    manuallyAskGPTConfiguration,
    ManuallyAskGPTConfiguration,
    OpenAIGPTConfiguration
} from "../application/CopilotSession";
import {GPTConfigurationRepository} from "../application/repository/GPTConfigurationRepository";
import {
    AzureOpenAIConfigurationProps,
    ConfigureGPTProps
} from "../features/eventSession/panels/component/storming/RemoveDuplicates";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCopy} from "@fortawesome/free-solid-svg-icons";

function MainButtons<R, O>(cards: WorkshopCard[],
                           actionName: string,
                           showGptConfiguration: boolean,
                           isLoading: boolean,
                           showPrompt: boolean,
                           copilotSession: CopilotSession,
                           boardSPI: WorkshopBoardSPI,
                           gptService: BaseGPTService<WorkshopCard[], R, O>,
                           setGptData: (data: O[]) => void,
                           setIsLoading: (value: boolean) => void,
                           setShowGptConfiguration: (value: boolean) => void) {
    const [maxTokens, setMaxTokens] = React.useState(1000);
    const [temperature, setTemperature] = React.useState(0.3);
    const handleAnalyze = async () => {
        setIsLoading(true);
        boardSPI.fetchEventCards().then(async (updatedCards) => {
            const data = await gptService.perform(updatedCards, copilotSession.gptConfiguration, {
                maxTokens: 1000,
                temperature: 0.3
            });
            setGptData(data);
            setIsLoading(false);
        });
    };
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
                                handleAnalyze()
                                    .then(() => setIsLoading(false))
                            }
                        }}> {actionName}
                </button>
            </div>
            {
                copilotSession.gptConfiguration.provider !== ManuallyAskGPTConfiguration.Provider &&
                <div className="w-full flex flex-col">
                    <div className="flex justify-between items-center py-1 odd_row">
                        <label className="text-left text-gray-900 text-xs pr-2 mr-5" htmlFor="maxTokens">Max
                            Tokens</label>
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
interface ManuallyCopyPastePromptProps<R, O> {
    boardSPI: WorkshopBoardSPI;
    setCards: (cards: WorkshopCard[]) => void;
    gptService: BaseGPTService<WorkshopCard[], R, O>;
    cards: WorkshopCard[];
    setGptData: (value: O[]) => void;
}
const ManuallyCopyPastePrompt = <R, O>({
                                           boardSPI,
                                           setCards,
                                           gptService,
                                           cards,
                                           setGptData
                                       }: ManuallyCopyPastePromptProps<R, O>) => {

    const textareaRef = useRef<HTMLTextAreaElement | null>(null);

    const handleCopy = () => {
        const textarea = textareaRef?.current;
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
                                         value={gptService.generatePrompt(cards)}>
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
                              let cardGroups = gptService.parseResponse(cards, response);
                              setGptData(cardGroups)
                          } catch (e) {
                              console.log(e)
                          }
                      }}>
            </textarea>
        </div>
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
interface GPTAnalysisBaseProps<R, O> {
    boardSPI: WorkshopBoardSPI,
    copilotSession: CopilotSession,
    cards: WorkshopCard[],
    setGptData: (data: O[]) => void,
    setCards: (cards: WorkshopCard[]) => void,
    gptService: BaseGPTService<WorkshopCard[], R, O>,
    actionName: string
}
export const GPTAnalysisBase = <R, O>({
       boardSPI, copilotSession, cards, setGptData, setCards, gptService, actionName
    }: GPTAnalysisBaseProps<R, O>)=> {

    const [isLoading, setIsLoading] = useState(false);
    const [showPrompt, setShowPrompt] = React.useState(false);
    const [showGptConfiguration, setShowGptConfiguration] = React.useState(false);

    return (
        <div className="w-full my-2 mb-4">

            {MainButtons(cards, actionName, showGptConfiguration, isLoading, showPrompt, copilotSession, boardSPI, gptService, setGptData, setIsLoading, setShowGptConfiguration)}

            {isLoading && (<div className="spinner"/>)}

            {showGptConfiguration &&
                <ConfigureGPT copilotSession={copilotSession}
                              setShowGptConfiguration={setShowGptConfiguration}
                              setShowPrompt={setShowPrompt}/>}
            {showPrompt &&
                <ManuallyCopyPastePrompt
                    boardSPI={boardSPI}
                    setCards={setCards}
                    gptService={gptService}
                    cards={cards}
                    setGptData={setGptData} />
            }

        </div>
    );
}