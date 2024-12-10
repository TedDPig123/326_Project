import { getAllTiles, getAllGridStates } from "./TileClientRequests.js";

export const getAllGridStates1 = async () => {
    try {
        const response = await fetch('/gridState', {
            method: 'GET',
        });
        if (!response.ok) {
            throw new Error('Failed to fetch GridStates');
        }
        const gridStates = await response.json();
        console.log('Fetched GridStates:', gridStates);
    } catch (error) {
        console.error('Error fetching GridStates:', error);
    }
};

export async function getAllDatabaseDataForRegistration(userEmail) {
    try {
        const tokenData = await getAllTokens();
        const tileData = await getAllTiles();
        const gridStateData = [];
        const gridData = []; //fix later
        return {userEmail, gridData, gridStateData, tileData, tokenData};
    } catch (error) {
        console.error("Error fetching data:", error);
    }
}

export async function getAllTokens() {
    try {
        const response = await fetch('/tokens/all', {
            method: 'GET',
        });
        if (!response.ok) {
            throw new Error('Failed to fetch all tokens');
        }
        const allTokens = await response.json();
        console.log('All tokens:', allTokens);
        return allTokens;
    } catch (error) {
        console.error('Error fetching tokens:', error);
        alert('Error fetching tokens from the server.');
    }
}

//get all database data
//note to self geri: megaDatabaseData structure should look like:
//{userID, gridData, gridStateData, tileData, tokenData}
//for updating
export async function getAllDatabaseData(){
    //get gridData
    const tokenData = await getAllTokens();
    const tileData = await getAllTiles();
    const gridStateData = [];
    const gridData = []; // fix later
    const userEmail = localStorage.getItem('userEmail');

    if(userEmail === null){
        return -1;
    }
    return {userEmail, gridData, gridStateData, tileData, tokenData};
}

//client call for updating megadatabase:
export async function updateMegaDB(){
    const retMegaDB = await getAllDatabaseData();
    console.log("retMegaDB:", retMegaDB);
    if(retMegaDB === -1){
        console.log("EMAIL NOT FOUND")
        return -1;
    }else{
        await createOrUpdateMegaDatabase(retMegaDB);
        return 1;
    }
}

// POST: Request for creating or updating the MegaDatabase
export async function createOrUpdateMegaDatabase(megaDatabaseData) {
    try {
        const response = await fetch('/megaDB', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(megaDatabaseData),
        });

        if (!response.ok) {
            throw new Error('Failed to create or update MegaDatabase');
        }

        const updatedMegaDatabase = await response.json();
        console.log('MegaDatabase created/updated:', updatedMegaDatabase);
        return updatedMegaDatabase;
    } catch (error) {
        console.error("Error creating or updating MegaDatabase:", error);
        alert("Error creating or updating MegaDatabase on the server.");
    }
}

// GET: Request to retrieve the MegaDatabase for a specific user
export async function getMegaDatabase(userId) {
    try {
        const response = await fetch(`/megaDB/${userId}`, {
            method: 'GET',
        });

        if (!response.ok) {
            throw new Error('Failed to retrieve MegaDatabase');
        }

        const megaDatabase = await response.json();
        console.log('MegaDatabase fetched:', megaDatabase);
        return megaDatabase;
    } catch (error) {
        console.error("Error fetching MegaDatabase:", error);
    }
}

// DELETE: Request to delete a MegaDatabase for a specific user
export async function deleteMegaDatabase(userId) {
    try {
        const response = await fetch(`/megaDB/${userId}`, {
            method: 'DELETE',
        });

        if (!response.ok) {
            throw new Error('Failed to delete MegaDatabase');
        }

        const message = await response.json();
        console.log(`MegaDatabase for user ${userId} deleted:`, message);
    } catch (error) {
        console.log('Error deleting MegaDatabase:', error);
    }
}

// PUT: Request to synchronize databases with MegaDatabase data
export async function syncWithMegaDatabase(userEmail) {
    try {
        const response = await fetch(`/megaDB/${userEmail}/sync`, {
            method: 'PUT',
        });

        if (!response.ok) {
            throw new Error('Failed to sync with MegaDatabase');
        }

        const result = await response.json();
        console.log('Databases synchronized:', result);
    } catch (error) {
        console.error("Error syncing with MegaDatabase:", error);
    }
}