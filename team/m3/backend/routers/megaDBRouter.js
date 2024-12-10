import express from "express";
import { 
    createOrUpdateMegaDatabase, 
    getMegaDatabase, 
    deleteMegaDatabase, 
    syncWithMegaDatabase 
} from "../controllers/megaDatabaseController.js"; 

const megaDatabaseRouter = new express.Router();

megaDatabaseRouter.post('/', createOrUpdateMegaDatabase);
megaDatabaseRouter.get('/:userId', getMegaDatabase);
megaDatabaseRouter.delete('/:userId', deleteMegaDatabase);
megaDatabaseRouter.put('/:userEmail/sync', syncWithMegaDatabase);

export default megaDatabaseRouter;