//POST: creating grid
export const createGrid = async (array) => {
    try {
        const response = await fetch('/grid', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ array }),
        });
        if (!response.ok) {
            throw new Error('Failed to create Grid');
        }
        const newGrid = await response.json();
        console.log('Created Grid:', newGrid);
    } catch (error) {
        console.error('Error creating Grid:', error);
    }
};

//POST: updating grid
export const updateGrid = async (array) => {
    try {
        const response = await fetch('/update/:grid', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ array }),
        });
        if (!response.ok) {
            throw new Error('Failed to update Grid');
        }
        const newGrid = await response.json();
        console.log('Updated Grid:', newGrid);
    } catch (error) {
        console.error('Error updating Grid:', error);
    }
};

//GET: get all the grids
export const getAllGrids = async () => {
    try {
        const response = await fetch('/grid', {
            method: 'GET',
        });
        if (!response.ok) {
            throw new Error('Failed to fetch Grid');
        }
        const grid = await response.json();
        console.log('Fetched Grid:', grid);
    } catch (error) {
        console.error('Error fetching Grid:', error);
    }
};

//DELETE: delete all the grids
export const deleteAllGridStates = async () => {
    try {
        const response = await fetch('/grid', {
            method: 'DELETE',
        });

        if (!response.ok) {
            throw new Error('Failed to delete all Grid');
        }

        const result = await response.json();
        console.log(result.message); 
    } catch (error) {
        console.error('Error deleting all Grid:', error);
    }
};