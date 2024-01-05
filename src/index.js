import {initialize} from "./utils/AppInitializer";

export async function init() {
    miro.board.ui.on('icon:click', async () => {
        await miro.board.ui.openPanel({url: 'app.html'});
    });

    initialize();
}

init();
