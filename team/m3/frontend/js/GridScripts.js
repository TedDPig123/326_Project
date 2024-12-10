import { createGrid } from "./GridClientRequests";

const createGridButton = document.getElementById('create-grid');

createGridButton.addEventListener('click', createGrid);