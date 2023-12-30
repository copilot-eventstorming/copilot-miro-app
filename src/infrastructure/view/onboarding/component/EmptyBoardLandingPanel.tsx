import * as React from "react";

const EmptyBoardLandingPanel: React.FC = () => {
    return <div>
        <div className="title title-panel">It's a empty board.</div>
        <div className="title title-panel">Want to create a Event Storming Board?</div>
        {/*<button className="btn btn-primary-panel">Create</button>*/}
    </div>;
}

export {EmptyBoardLandingPanel};