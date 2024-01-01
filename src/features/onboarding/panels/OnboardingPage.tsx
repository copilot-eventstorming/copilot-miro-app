import * as React from "react";
import {ImportBoardLandingPanel} from "./component/ImportBoardLandingPanel";
import {AnalyzingStateLandingPanel} from "./component/AnalyzingStateLandingPanel";
import {EmptyBoardLandingPanel} from "./component/EmptyBoardLandingPanel";
import {WorkshopBoardSPI} from "../../../application/spi/WorkshopBoardSPI";
import {NonEventStormingBoardLandingPanel} from "./component/NonEventStormingBoard";

type TAnalyzeBoard = {
    analyzed: boolean;
    setAnalyzing: React.Dispatch<React.SetStateAction<boolean>>;
    setMaybeWorkshop: React.Dispatch<React.SetStateAction<boolean>>;
    setEmptyBoard: React.Dispatch<React.SetStateAction<boolean>>;
    setAnalyzed: React.Dispatch<React.SetStateAction<boolean>>;
    boardSPI: WorkshopBoardSPI;
}

type TOnboardingPageProps = {
    boardSPI: WorkshopBoardSPI;
}

const OnboardingPage: React.FC<TOnboardingPageProps> = ({boardSPI}) => {

    const [analyzing, setAnalyzing] = React.useState(true);
    const [maybeWorkshop, setMaybeWorkshop] = React.useState(false);
    const [emptyBoard, setEmptyBoard] = React.useState(false);
    const [analyzed, setAnalyzed] = React.useState(false);

    React.useEffect(() => {
        analyzeBoard({analyzed, setAnalyzing, setMaybeWorkshop, setEmptyBoard, setAnalyzed, boardSPI})();
    }, []);


    return (<div>
        {analyzing ? <AnalyzingStateLandingPanel/> :
            maybeWorkshop ? <ImportBoardLandingPanel/>
                : emptyBoard ? <EmptyBoardLandingPanel/> :
                    <NonEventStormingBoardLandingPanel/>}
    </div>)
}
function analyzeBoard({analyzed, setAnalyzing, setMaybeWorkshop, setEmptyBoard, setAnalyzed, boardSPI}: TAnalyzeBoard) {
    return async () => {
        if (!analyzed) {
            console.log('Analyzing board...')
            try {
                const maybe = await boardSPI.maybeEventStormingSession()
                const empty = await boardSPI.isBoardEmpty()
                setAnalyzing(false)
                setMaybeWorkshop(maybe)
                setEmptyBoard(empty)
                setAnalyzed(true)
            } catch (e) {
                console.log(e)
            }
        }
    };
}

export {OnboardingPage};