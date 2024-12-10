import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import tileRouter from "./routers/TileRouter.js"
import TokenRoutes from './routers/tokenRoutes.js'
import gridStateRouter from './routers/gridStateRouter.js';
import userRouter from './routers/userRouter.js';
import SQLiteUser from './models/user.js';
import GridRouter from './routers/GridRouter.js';
import megaDatabaseRouter from './routers/megaDBRouter.js';
import BackgroundImageRoutes from './routers/backgroundImageRouter.js';
import canvasRouter from './routers/CanvasRouter.js';

class Server {
    constructor(){
        this.app = express();
        this.configureMiddleware();
        this.setupRoutes();
        this.initializeDatabase();
    }
    
    configureMiddleware(){
        //To get the absolute path of the directory
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = dirname(dirname(__filename));
        this.app.use(express.static(path.join(__dirname, 'frontend')));
        this.app.use(express.json({ limit: "500mb" }));
    }

    //Each person adds their routes here
    setupRoutes() {
        this.app.use('/tiles', tileRouter);
        this.app.use("/gridState", gridStateRouter);
        this.app.use("/tokens", TokenRoutes)
        this.app.use("/users", userRouter)
        this.app.use("/grid", GridRouter)
        this.app.use("/megaDB", megaDatabaseRouter);
        this.app.use("/backgroundImage", BackgroundImageRoutes)
        this.app.use("/canvas", canvasRouter)
    }

    // Initialize the database
    async initializeDatabase() {
        try {
            await SQLiteUser.init();
            console.log('Database initialized successfully');
        } catch (error) {
            console.error('Error initializing database:', error);
        }
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
