import * as React from "react";

const AnalyzingStateLandingPanel: React.FC = () => {
    return (
        <div>
            <div className="title title-panel">Copilot is analyzing your board...</div>
            <div className="flex flex-row" style={{"height": 124}}>
                <div className="spinner"></div>
            </div>
        </div>
    );
}

export {AnalyzingStateLandingPanel};