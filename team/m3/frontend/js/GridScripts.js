import { createGrid } from "./GridClientRequests";

document.getElementById('create-grid').addEventListener('click', async () => {
    const gridWidth = document.getElementById('grid-width').value;
    const gridHeight = document.getElementById('grid-height').value;

    if (!gridWidth || !gridHeight) {
        alert("Please provide both grid width and height.");
        return;
    }

    try {
        const grid = { gridWidth: parseInt(gridWidth), gridHeight: parseInt(gridHeight) };
        await createGrid(grid);
        alert('Grid created successfully!');
    } catch (error) {
        console.error('Error creating grid:', error);
    }
});