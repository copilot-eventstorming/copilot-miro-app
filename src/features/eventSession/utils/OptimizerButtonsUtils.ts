import {Dispatch, SetStateAction} from "react";
import {SaveActions, SaveResult, StateSaveResult} from "../../../application/repository";
import {WorkshopBoardSPI} from "../../../application/spi/WorkshopBoardSPI";
import {EventSessionPrettifyLayoutService} from "../service/EventSessionPrettifyLayoutService";
import {miroProxy} from "../../../api/MiroProxy";
import {mkLayoutChangeResult} from "./ConsoleMessageMaker";
import {sizeof} from "../../../application/service/utils/utils";
import {BuildAggregateCausalChainService} from "../../aggregateSession/service/BuildAggregateCausalChainService";
import {OptimizeConnectorsService} from "../../../application/service";
import {HotspotAffiliationDistinctionAnalysisService} from "../service/HotspotAffiliationDistinctionAnalysisService";
import {ProblematicCard} from "../../../application/service/graph/AffiliationDistinctionProblemDiagnoseService";
import {HotspotAffiliationDistinctionDiagnoseService} from "../service/HotspotAffiliationDistinctionDiagnoseService";
import {
    AggregateSessionPrettifyLayoutService
} from "../../aggregateSession/service/AggregateSessionPrettifyLayoutService";

export function handleOptimizeLayout(widthPaddingFactor = 1, heightPaddingFactor = 1,
                              verticalOverlapThreshold = 0.5, horizontalOverlapThreshold = 0.5,
                              setConsoleOutput: Dispatch<SetStateAction<string>>, consoleOutput: string,
                              setShowClusterAnalysisResult: Dispatch<SetStateAction<boolean>>, setShowMaybeProblems: Dispatch<SetStateAction<boolean>>,
                              saveActions: SaveActions | null, boardSPI: WorkshopBoardSPI): () => void {

    return () => {
        saveActions?.save('Auto-save before layout', 'Event Storming Session')
            .then(() => {
                setShowClusterAnalysisResult(false)
                setShowMaybeProblems(false)
                // const service = new EventSessionPrettifyLayoutService(boardSPI)
                const service = new AggregateSessionPrettifyLayoutService(boardSPI)
                service
                    .perform(widthPaddingFactor, heightPaddingFactor, verticalOverlapThreshold, horizontalOverlapThreshold)
                    .then(async layoutOpResult => {
                        if (layoutOpResult.successCount > 0) {
                            const stateSaveResult = await saveActions.save('Auto-save after layout', 'Event Storming Session')
                            const apiCalls = miroProxy.getApiCallsInLastMinute()
                            const consoleMessage = mkLayoutChangeResult(layoutOpResult, stateSaveResult, apiCalls)
                            console.log('apiCalls:', apiCalls)
                            setConsoleOutput(consoleMessage)
                        } else {
                            setConsoleOutput(
                                mkLayoutChangeResult(
                                    layoutOpResult,
                                    new StateSaveResult(true,
                                        new SaveResult(false, null, sizeof({})), sizeof({})),
                                    {totalCount: 0})
                            )
                        }
                    })
                    .then(() => {
                        new BuildAggregateCausalChainService(boardSPI)
                            .perform()
                            .then((result) => {
                                const xs = generateGroupStrings(groupByEdges(result.edges)).join('\n\t')
                                const aggs = `Aggregates: \n\t${result.nodeNames.map(xy => xy[1]).join(',\n\t ')}`
                                const rels = `Relations: \n\t${result.edges.map(e => `${e[0]} -> ${e[1]}`).join(',\n\t ')}`
                                console.log(`\n${aggs}\n${rels}`)
                                console.log(`Composed Relationship:\n\t${xs}`)
                            })
                    });
            }).catch((e) => {
            setConsoleOutput(e)
        })
    }
}

export function groupByEdges(edges: string[][]): Record<string, string[]> {
    return edges.reduce((acc: Record<string, string[]>, edge: string[]) => {
        const key = edge[1];
        if (!acc[key]) {
            acc[key] = [];
        }
        acc[key].push(edge[0]);
        return acc;
    }, {});
}

export function generateGroupStrings(groupedEdges: Record<string, string[]>): string[] {
    return Object.entries(groupedEdges).map(([key, values]) => {
        return `(${values.join(', ')}) -> ${key}`;
    });
}

export function handleOptimizeConnector(
    setConsoleOutput: Dispatch<SetStateAction<string>>,
    setOptionsDrawerOpen: Dispatch<SetStateAction<boolean>>,
    setShowClusterAnalysisResult: Dispatch<SetStateAction<boolean>>,
    setShowMaybeProblems: Dispatch<SetStateAction<boolean>>,
    boardSPI: WorkshopBoardSPI
) {
    return () => {
        setShowClusterAnalysisResult(false);
        setShowMaybeProblems(false);
        const service = new OptimizeConnectorsService(boardSPI)
        service.perform()
            .then((xs) => {
                setOptionsDrawerOpen(false);
                setConsoleOutput(`Optimize Connectors Finished.\n\n    Totally ${xs.length} connectors optimized.`);
            })
    }
}

export function handleClusterAnalysis(
    setConsoleOutput: Dispatch<SetStateAction<string>>,
    setOptionsDrawerOpen: Dispatch<SetStateAction<boolean>>,
    setShowClusterAnalysisResult: Dispatch<SetStateAction<boolean>>,
    setClusterAnalysisResult: Dispatch<SetStateAction<any[]>>,
    setShowMaybeProblems: Dispatch<SetStateAction<boolean>>,
    setAmbiguousDistanceThreshold: Dispatch<SetStateAction<number>>,
    setMaxDistanceDiff: Dispatch<SetStateAction<number>>,
    setMinDistanceDiff: Dispatch<SetStateAction<number>>,
    setStep: Dispatch<SetStateAction<number>>,
    boardSPI: WorkshopBoardSPI
) {
    return () => {
        setConsoleOutput("Cluster Analysis Started ...");
        const service = new HotspotAffiliationDistinctionAnalysisService(boardSPI)

        service.perform().then(resultItems => {
            const distance25 = resultItems[1].distance;
            const distanceMin = resultItems[0].distance;
            resultItems.forEach((item) => {
                if (item.percentileName === '25') {
                    setAmbiguousDistanceThreshold(parseFloat(item.distance));
                } else if (item.percentileName === 'min') {
                    setMinDistanceDiff(parseFloat(item.distance));
                } else if (item.percentileName === 'max') {
                    setMaxDistanceDiff(parseFloat(item.distance));
                }
            });

            let possibleStep = (parseFloat(distance25) - parseFloat(distanceMin));
            if (possibleStep === 0) possibleStep = 0.0001;
            setStep(possibleStep);
            setOptionsDrawerOpen(true);
            setShowClusterAnalysisResult(true);
            setClusterAnalysisResult(resultItems);
            setShowMaybeProblems(false);
            setConsoleOutput(`Explore Analysis Finished. \n
        Notice: This operation is used to investigate the degree of affiliation distinction among the cards on the board. The smaller the value, the lower the degree of distinction, and the larger the value, the greater the degree of distinction. It will affect the maximum value of the distinction threshold.
        \n
        Pick a proper 'Affiliation Distinction Threshold' for 'Problem Diagnose'.`);
        });

    }
}

export function handleMaybeProblems(
    setConsoleOutput: Dispatch<SetStateAction<string>>,
    setOptionsDrawerOpen: Dispatch<SetStateAction<boolean>>,
    setShowClusterAnalysisResult: Dispatch<SetStateAction<boolean>>,
    setShowMaybeProblems: Dispatch<SetStateAction<boolean>>,
    ambiguousDistanceThreshold: number,
    setMaybeProblems: Dispatch<SetStateAction<ProblematicCard[]>>,
    boardSPI: WorkshopBoardSPI
) {
    return () => {
        setShowClusterAnalysisResult(false)
        setShowMaybeProblems(true)
        setOptionsDrawerOpen(true)
        setConsoleOutput("Problem diagnosis started ...");
        const service = new HotspotAffiliationDistinctionDiagnoseService(boardSPI)
        service.perform(ambiguousDistanceThreshold).then(resultItems => {
            const [ambiguousProblems, tooFarProblems] = resultItems
            setMaybeProblems(resultItems[0].concat(resultItems[1]))
            setConsoleOutput(`Problem diagnosis finished.\n\n    Totally ${ambiguousProblems.length + tooFarProblems.length} problems detected.`);
        })
    }
}