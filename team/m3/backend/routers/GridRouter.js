import express from "express";
import {
  createGrid,
  getAllGrids,
  deleteGrid,
  updateGrid,
} from "../controllers/GridController.js"

class GridRoutes {
    constructor() {
      this.router = express.Router();
      this.initializeRoutes();
    }
  
    initializeRoutes() {
      // Define the routes and connect them to controller methods
  
      // DESCRIPTION
      //   Get grid. This endpoint returns an object with a 'grid' property
      //   containing an array of grids.
      // REQUEST
      //   GET /grid
      // RESPONSE
      //   {
      //     "grid": [ ... ]
      //   }
      // STATUS CODES
      //   200 - OK: The request was successful
      //   500 - Internal Server Error: The server encountered an error
      this.router.get("/grid", async (req, res) => {
        await getAllGrids(req, res);
      });
  
      // DESCRIPTION
      //   Add a new grid. This endpoint creates a new grid with the provided
      //   width and height and returns the created grid.
      // REQUEST
      //   POST /grid
      //   {
      //     "gridWidth": "width of grid"
      //     "gridHeight": "height of grid"
      //   }
      // RESPONSE
      //   {
      //     "id": generated id,
      //     "gridWidth": "width of grid"
      //     "gridHeight": "height of grid"
      //   }
      // STATUS CODES
      //   200 - OK: The grid was created successfully
      //   400 - Bad Request: The request was invalid or missing required data
      //   500 - Internal Server Error: The server encountered an error
      this.router.post("/grid", async (req, res) => {
        await createGrid(req, res);
      });
  
      // DESCRIPTION
      //   Update grid. This endpoint updates the 
      // REQUEST
      //   POST /update/:grid
      //   {
      //     "gridWidth": "width of grid"
      //     "gridHeight": "height of grid"
      //   }
      // RESPONSE
      //   {
      //     "id": generated id,
      //     "gridWidth": "width of grid"
      //     "gridHeight": "height of grid"
      //   }
      // STATUS CODES
      //   200 - OK: The grid was created successfully
      //   400 - Bad Request: The request was invalid or missing required data
      //   500 - Internal Server Error: The server encountered an error
      this.router.post("/update/:grid", async (req, res) => {
        await updateGrid(req, res);
      });

      // DESCRIPTION
      //   Clear grid. This endpoint deletes grids and returns an empty
      //   response. This operation cannot be undone.
      // REQUEST
      //   DELETE /grid
      // RESPONSE
      //   { }
      // STATUS CODES
      //   200 - OK: The grid was cleared successfully
      //   500 - Internal Server Error: The server encountered an error
      this.router.delete("/grid", async (req, res) => {
        await deleteGrid(req, res);
      });
    }
  
    getRouter() {
      return this.router;
    }
  }
  
  export default new GridRoutes().getRouter();
