import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import tileCoordRouter from "./routers/TileCoordRouter.js"
import tileRouter from "./routers/TileRouter.js"
import TokenRoutes from './routers/tokenRoutes.js'
import GridRouter from './routers/GridRouter.js';

class Server {
    constructor(){
        this.app = express();
        this.configureMiddleware();
        this.setupRoutes();
    }
    
    configureMiddleware(){
        //To get the absolute path of the directory
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = dirname(dirname(__filename));
        this.app.use(express.static(path.join(__dirname, 'frontend')));
        this.app.use(express.json({ limit: "10mb" }));
    }

    //Each person adds their routes here
    setupRoutes() {
        // this.app.use('/tiles', tileRouter);
        // this.app.use('/tileCoordinates', tileCoordRouter);
        this.app.use("/tokens", TokenRoutes)
        this.app.use("/grid", GridRouter)
    }


    start(port = 3000) {
        this.app.listen(port, () => {
          console.log(`Server started on http://localhost:${port}`);
        });
    }
}
console.log("Starting Server")
const server = new Server();
server.start();