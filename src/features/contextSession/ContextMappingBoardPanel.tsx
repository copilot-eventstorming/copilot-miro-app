import * as React from "react";
import { BlueprintDashboard } from './components/BlueprintDashboard';

export const ContextMappingBoardPanel: React.FC = () => {
    return (
        <div className="agenda">
            <div className="title title-panel">Blueprint Analysis</div>
            <BlueprintDashboard />
        </div>
    );
}