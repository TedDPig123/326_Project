import megaDatabase from "../models/sqliteMegadatabase.js";
import Tile from "../models/SQLiteTile.js";
import gridState from "../models/sqliteGridState.js";
import SQLiteGrid from "../models/SQLiteGrid.js";
import SQLiteToken from "../models/sqliteToken.js";

// Helper function to create response objects
const factoryResponse = (status, message) => ({ status, message });


//keep in mind, this should be findall
// POST: Creates or updates a MegaDatabase for a user
export const createOrUpdateMegaDatabase = async (req, res) => {
    const { userId, gridData, gridStateData, tileData, tokenData} = req.body;

    console.log("Received MegaDatabase data:", req.body);

    try {
        // Validate required data
        if (!userId || !gridData || !gridStateData || !tileData || !tokenData) {
            return res.status(400).json(factoryResponse(400, "All fields (userId, gridData, gridStateData, tileData, tokenData) are required"));
        }

        // Check if MegaDatabase already exists for the user
        const existingMegaDatabase = await megaDatabase.findOne({ where: { userId } });

        if (existingMegaDatabase) {
            // Update the existing MegaDatabase
            await existingMegaDatabase.update({ gridData, gridStateData, tileData, tokenData});
            console.log("MegaDatabase updated:", existingMegaDatabase);
            res.status(200).json(existingMegaDatabase);
        } else {
            // Create a new MegaDatabase entry for the user
            const newMegaDatabase = await megaDatabase.create({
                userId,
                gridData,
                gridStateData,
                tileData,
                tokenData,
            });
            console.log("MegaDatabase created:", newMegaDatabase);
            res.status(201).json(newMegaDatabase);
        }
    } catch (error) {
        console.error("Error creating or updating MegaDatabase:", error);
        res.status(500).json(factoryResponse(500, "Unable to create or update MegaDatabase: " + error.message));
    }
};

// GET: Retrieves the MegaDatabase for a user
export const getMegaDatabase = async (req, res) => {
    const { userId } = req.params;

    try {
        const megaData = await megaDatabase.findOne({ where: { userId } });

        if (!megaData) {
            return res.status(404).json(factoryResponse(404, "MegaDatabase not found for this user"));
        }

        res.status(200).json(megaData);
    } catch (error) {
        console.error("Error fetching MegaDatabase:", error);
        res.status(500).json(factoryResponse(500, "Unable to fetch MegaDatabase: " + error.message));
    }
};

// DELETE: Deletes the MegaDatabase for a user
export const deleteMegaDatabase = async (req, res) => {
    const { userId } = req.params;

    try {
        const deletedRows = await megaDatabase.destroy({
            where: { userId },
        });

        if (deletedRows === 0) {
            return res.status(404).json(factoryResponse(404, "No MegaDatabase found for this user"));
        }

        res.status(200).json(factoryResponse(200, "MegaDatabase deleted successfully"));
    } catch (error) {
        console.error("Error deleting MegaDatabase:", error);
        res.status(500).json(factoryResponse(500, "Unable to delete MegaDatabase: " + error.message));
    }
};

//THIS IS RISKY BUSINESS!!
//Function to synchronize data across all databases based on MegaDatabase entry
export const syncWithMegaDatabase = async (req, res) => {
    const { userId } = req.params;

    try {
        const megaData = await megaDatabase.findOne({ where: { userId } });

        if (!megaData) {
            return res.status(404).json(factoryResponse(404, "MegaDatabase not found for this user"));
        }

        //replace all databases with stuff from megadatabase
        await updateOtherDatabasesWithMegaData(userId);

        res.status(200).json(factoryResponse(200, "Databases synchronized successfully"));

    } catch (error) {
        console.error("Error syncing databases:", error);
        res.status(500).json(factoryResponse(500, "Unable to sync databases: " + error.message));
    }
};

// Helper function to update other databases with MegaDatabase data
async function updateOtherDatabasesWithMegaData(userId) {
    try {
        const megaData = await megaDatabase.findOne({ where: { userId } });
        if (!megaData) {
            return { status: 404, message: "MegaDatabase not found for this user" };
        }

        //Update SQLite Grid
        await SQLiteGrid.deleteAll();
        const newGridData = megaData.gridData;
        await SQLiteGrid.create({
            gridWidth: newGridData.gridWidth,
            gridHeight: newGridData.gridHeight,
        });

        //Update gridState
        await gridState.destroy({ where: {} });
        const newGridState = megaData.gridStateData;
        if (newGridState) {
            for (const state of newGridState) {
                await GridState.create({
                    array: state.array,
                });
            }
        }

        //update tile
        await Tile.destroy({ where: {} });
        const newTileData = megaData.tileData;
        if (newTileData) {
            for (const tile of newTileData) {
                await Tile.create({
                    IDBtileID: tile.IDBtileID,
                    type: tile.type,           
                    details: tile.details, 
                    imgData: tile.imgData,
                });
            }
        }

        //update tokenData
        await SQLiteToken.destroy({ where: {} });
        const newTokenData = megaData.tokenData;
        if (newTokenData) {
            for (const token of newTokenData) {
                await Token.create({
                    tokenid: token.tokenid,
                    name: token.name,
                    description: token.description,
                    column: token.column,
                    row: token.row,
                    top: token.top,
                    left: token.left,
                    img: token.img,
                    mime: token.mime
                });
            }
        }

        console.log(`Updated all other databases with MegaDatabase data for userId: ${userId}`);
    } catch (error) {
        console.error("Error updating other databases with MegaDatabase data:", error);
        throw new Error("Unable to update other databases with MegaDatabase data");
    }
}