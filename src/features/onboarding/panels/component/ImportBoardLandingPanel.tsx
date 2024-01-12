import * as React from "react";
// @ts-ignore
import eventstorming from '@/assets/eventstorming.png';

const ImportBoardLandingPanel: React.FC = () => {
    return (
        <div>
            <div className="m-5">
                <div className="w-full font-lato text-orange-500 px-0 text-2xl font-bold mb-2">
                    This might be an EventStorming Board!
                </div>
                <img className="my-6 shadow-md rounded-md" src={eventstorming} alt="eventstorming"/>
            </div>
            <div className="bg-amber-600 my-10 px-4 py-8">
                <div className="text-white  text-xl text-left font-lato">
                    Import to
                </div>
                <div className="text-white font-bold text-1xl py-2 text-center font-lato">
                    Event Storming Copilot
                </div>
                <div className="text-white text-xl text-right font-lato">
                    to get better Experience.
                </div>
            </div>
            <div className="bg-white fixed inset-x-0 bottom-0 flex w-full py-5 px-2 m-0 justify-between ">
                <button className="btn btn-primary btn-primary-panel px-2"
                        onClick={openImportBoardPromptPage}>Import Guide
                </button>
                <button className="btn btn-secondary btn-secondary-panel">Learn more</button>
            </div>
        </div>
    );
}

async function openImportBoardPromptPage() {
    if (await miro.board.ui.canOpenModal()) {
        await miro.board.ui.openModal({
            url: 'modals/importBoardPrompt.html', width: 800, height: 640, fullscreen: false,
        });
    }
}


export {ImportBoardLandingPanel};