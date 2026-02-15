import * as React from "react";
import { SubdomainDashboard } from './components/SubdomainDashboard';

export const SubdomainExplorationBoardPanel: React.FC = () => {
    return (
        <div className="agenda">
            <div className="title title-panel">Subdomain Discovery</div>
            <SubdomainDashboard />
        </div>
    );
}