import { DatabaseConnection } from "./DatabaseConnection.js";
import { enableDragging } from "./grid.js";
import {createTile,
    getAllTiles,
    updateTile,
    deleteTile,
    changeTileID,
    clearAllTiles,
    createGridState,
    deleteAllGridStates,
    getAllGridStates
} from "./TileClientRequests.js";
import { updateMegaDB } from "./megaDBRequests.js";

//initialize indexedDB database for tile objects
const dbTileObject = new DatabaseConnection('tileDatabase');
export const dbGridState = new DatabaseConnection('gridStateDatabase');

//initialize indexedDB database for grid state
class gridObject{
    array;
    constructor(array){
        this.array = array;
    }
}

//create class for tile object
export class tileObject{
    type;
    details;
    imgData;
    constructor(type, details, imgData){
        this.type = type;
        this.details = details;
        this.imgData = imgData;
    }
}

// document.getElementById('logout-button').addEventListener('click', async () => {
//     try {
//         await updateMegaDB();
//         await clearTileObjectDB();
//     } catch (error) {
//         console.log(error);
//     }
// });
//ON-LOAD: Populate the tile types, update indexedDB

export async function tileRenderOnLoad() {
    await updateMegaDB();

    const allTiles = await getAllTiles();
    if (!allTiles) {
        console.error("Failed to retrieve tiles from server");
        return;
    }

    await dbTileObject.clearDatabase()

    // wait for all tiles to be added and synced first
    await Promise.all(
        allTiles.map(async (serverTile) => {
            const type = serverTile.type;
            const details = serverTile.details;
            const imgData = serverTile.imgData;
            const IDBtileID = serverTile.IDBtileID;

            await deleteTile(IDBtileID);

            const tileObj = new tileObject(type, details, imgData);
            const newTileID = await dbTileObject.addObject(tileObj);
            
            const newServerTile = {
                IDBtileID: parseInt(newTileID, 10),
                type: type,
                details: details,
                imgData: imgData
            }
            //backend syncing
            await createTile(newServerTile);

            // Add dropdown element
            const newTileOption = document.createElement("a");
            newTileOption.setAttribute("tile-id", newTileID);
            newTileOption.setAttribute("href", "#");
            newTileOption.textContent = type;
            document.querySelector(".edit-tile-dropdown-content").appendChild(newTileOption);
        })
    );

    initializeAvailableTiles();
    populateTileDropdown1();

    console.log("Final available tiles:", availableTiles);

    //also load in gridstate

    const serverGridStateObjects = await getAllGridStates();
    if(serverGridStateObjects && serverGridStateObjects.length > 0){
        const serverGridStateArray = serverGridStateObjects[0].array;
        const newGridState = new gridObject(serverGridStateArray);
        dbGridState.clearDatabase();
        dbGridState.addObject(newGridState);
    }
   
}

tileRenderOnLoad();
rerenderGrid();

//saving the grid state
export async function saveGridState() {
    const gridState = [];

    const tiles = document.querySelectorAll('.grid-tile');
    tiles.forEach((tile) => {
        const x = tile.dataset.x;
        const y = tile.dataset.y;
        const tileName = tile.getAttribute('data-tile-name') || null;
        const tileDetails = tile.getAttribute('data-tile-details') || null;
        const tileImage = tile.style.backgroundImage || null;

        gridState.push({
            x: parseInt(x),
            y: parseInt(y),
            tileName,
            tileDetails,
            tileImage: tileImage ? tileImage.slice(5, -2) : null, // to remove the `url("")` wrapper
        });
    });

    const gridStateObject = new gridObject(gridState);
    dbGridState.clearDatabase();
    dbGridState.addObject(gridStateObject);

    //backend sync
    await deleteAllGridStates();
    await createGridState(gridState);

    console.log("Grid state saved:", gridState);
}

//EMILY THIS IS WHERE I RERENDER!!!!
export async function rerenderGrid() {
    const arrayGridState = await dbGridState.getAllObject();
    const currGridState = arrayGridState[0];
    console.log("current grid state", currGridState);

    if (!currGridState || currGridState.length === 0) {
        console.log("No saved grid state found.");
        return;
    }

    const width = Math.max(...currGridState.array.map(tile => tile.x)) + 1;
    const height = Math.max(...currGridState.array.map(tile => tile.y)) + 1;

    const battleGrid = document.getElementById('battle-grid');
    battleGrid.innerHTML = ''; // Clear any existing grid
    battleGrid.style.gridTemplateColumns = `repeat(${width}, 1fr)`;
    battleGrid.style.gridTemplateRows = `repeat(${height}, 1fr)`;
    battleGrid.style.zIndex = 3;

    const objectGrid = document.getElementById('object-grid');
    objectGrid.innerHTML = ''; // Clear any existing grid
    objectGrid.style.gridTemplateColumns = `repeat(${width}, 1fr)`;
    objectGrid.style.gridTemplateRows = `repeat(${height}, 1fr)`;

    // Create and render the tiles based on the saved grid state
    for (let i = 0; i < currGridState.array.length; i++) {
        const tileCoord = currGridState.array[i];
        const tile = document.createElement('div');
        tile.classList.add('grid-tile');
        tile.dataset.x = tileCoord.x;
        tile.dataset.y = tileCoord.y;

        if (tileCoord.tileName) {
            tile.setAttribute('data-tile-name', tileCoord.tileName);
        }
        if (tileCoord.tileDetails) {
            tile.setAttribute('data-tile-details', tileCoord.tileDetails);
        }
        if (tileCoord.tileImage) {
            tile.style.backgroundImage = `url(${tileCoord.tileImage})`;
        }

        battleGrid.appendChild(tile);
    }

    initializeBattleGrid(battleGrid);
    enableDragging(battleGrid);
    enableDragging(battleGrid);
}


// ALL DATABASE STUFF!

//This gets the canvas image url from the tile-preview square
function getCanvasImageFromCustom() {
    const canvas = document.getElementById("tile-preview");
    return canvas.toDataURL("image/png");
}

//This gets the canvas image url from the edit-tile-preview square
//Makes it so the last thing the user chooses is saved to the tile
function getCanvasImageFromEdit() {
    const canvas = document.getElementById("edit-tile-preview");
    return canvas.toDataURL("image/png");
}

//This creates a new custom tile object
//TODO: PUT - check backend 
async function addNewCustomTile(){
    const type = document.getElementById("tile-name").value;
    const details = document.getElementById("details").value;
    const tileImage = getCanvasImageFromCustom();

    if(type === ""){
        alert("type cannot be empty");
        return;
    }

    const tileObj = new tileObject(type, details, tileImage);

    try {
        const tileID = await dbTileObject.addObject(tileObj);

        const newTileOption = document.createElement("a");
        newTileOption.setAttribute("tile-id", tileID);
        newTileOption.setAttribute("href", "#");
        newTileOption.textContent = type;

        const clone = newTileOption.cloneNode(true);

        const editTileDropdown = document.querySelector('.edit-tile-dropdown-content');
        editTileDropdown.appendChild(clone);

        hideCustom();
        initializeAvailableTiles();
        populateTileDropdown1();

        const serverTile = {
            IDBtileID: parseInt(tileID, 10),
            type: type,
            details: details,
            imgData: tileImage
        }
        //backend syncing
        await createTile(serverTile);
        await updateMegaDB();

    } catch (error) {
        console.error("tile not added", error);
    }
}

//TODO: PUT - Check backend
async function saveEditedTile(){
    const type = document.getElementById("edit-displayed-tile").textContent;
    const details = document.getElementById("edit-details").value;
    const tileImage = getCanvasImageFromEdit();

    let aTags = document.getElementsByTagName("a");
    let searchText = type;
    let found;

    for (let i = 0; i < aTags.length; i++) {
        if (aTags[i].textContent === searchText) {
            found = aTags[i];
            break;
        }
    }

    try {
        let tileID = found.getAttribute("tile-id");
        console.log(tileID);
        const tileObj = await dbTileObject.getObject(parseInt(tileID));
        tileObj.details = details;
        tileObj.imgData = tileImage;
        console.log("tileID:", tileID, "tileObj:", tileObj);
        await dbTileObject.updateObject(tileObj);
        console.log("Fetched tile object:", tileObj);
        alert("tile edited successfully");
        hideEdit();

        //backend syncing
        await updateTile(tileID, {type, details, tileImage});

    } catch (error) {
        console.error("tile not edited", error);
    }
}

//TODO: DELETE - Add backend implementation
async function deleteEditedTile(){
    const type = document.getElementById("edit-displayed-tile").textContent;
    const details = document.getElementById("edit-details").value;
    const tileImage = getCanvasImageFromEdit();

    let aTags = document.getElementsByTagName("a");
    let searchText = type;
    let found;

    for (let i = 0; i < aTags.length; i++) {
        if (aTags[i].textContent === searchText) {
            found = aTags[i];
            break;
        }
    }

    try {
        let tileID = found.getAttribute("tile-id");
        await dbTileObject.deleteObject(tileID);

        const dropdown = document.querySelector('.edit-tile-dropdown-content');
        const tileToRemove = dropdown.querySelector(`[tile-id='${tileID}']`);
        if (tileToRemove) {
            dropdown.removeChild(tileToRemove);
        }

        const tileSelector = document.getElementById('tile-selector');
        const tileOptionToRemove = tileSelector.querySelector(`[value='${tileID}']`);
        if (tileOptionToRemove) {
            tileSelector.removeChild(tileOptionToRemove);
        }
        hideEdit();
        alert("Tile deleted successfully");

        //backend syncing
        await deleteTile(tileID);
    } catch (error) {
        console.error("tile not deleted", error);
    }
}

async function displayTileDetailsForExisting(tileID) {
    const tileObject = await dbTileObject.getObject(tileID);
    document.getElementById("details-2").value = tileObject.details;
    console.log("imgData is", tileObject.imgData);
    const newImage = new Image();
    const canvas = document.getElementById("tile-preview-2");
    const ctx = document.getElementById("tile-preview-2").getContext("2d");

    newImage.onload = function(){
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(newImage, 0, 0);
    }

    newImage.onerror = function() {
        console.error("Failed to load image:", newImage.src);
    }

    newImage.src = tileObject.imgData;
}

async function displayTileDetailsForEditing(tileID) {
    const tileObject = await dbTileObject.getObject(tileID);
    document.getElementById("edit-details").value = tileObject.details;
    console.log("imgData is", tileObject.imgData);
    const newImage = new Image();
    const canvas = document.getElementById("edit-tile-preview");
    const ctx = document.getElementById("edit-tile-preview").getContext("2d");

    newImage.onload = function(){
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(newImage, 0, 0);
    }

    newImage.onerror = function() {
        console.error("Failed to load image:", newImage.src);
    }

    newImage.src = tileObject.imgData;
}

function showCustom(){
    console.log("toggle");
    const tileMenu = document.querySelector('.custom');
    const greyOverlay = document.getElementById('screen-overlay');
    greyOverlay.style.display = 'flex';
    tileMenu.style.display = 'flex';
}

function hideCustom(){
    const tileMenu = document.querySelector('.custom');
    const greyOverlay = document.getElementById('screen-overlay');
    tileMenu.style.display = 'none';
    greyOverlay.style.display = 'none';

    const tileOption = document.getElementById("tile-name");
    tileOption.innerHTML = "";
    tileOption.value = "";

    const details = document.getElementById("details");
    details.value = "";

    const canvas = document.getElementById("tile-preview");
    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
}

function showEdit(){
    const tileMenu = document.querySelector('.edit');
    const greyOverlay = document.getElementById('screen-overlay');
    greyOverlay.style.display = 'flex';
    tileMenu.style.display = 'flex';
}

function hideEdit(){
    const tileMenu = document.querySelector('.edit');
    const greyOverlay = document.getElementById('screen-overlay');
    tileMenu.style.display = 'none';
    greyOverlay.style.display = 'none';

    const tileOption = document.getElementById("edit-displayed-tile");
    tileOption.innerHTML = "CHOOSE TILE";

    const editDetails = document.getElementById("edit-details");
    editDetails.value = "";

    const canvas = document.getElementById("edit-tile-preview");
    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
}

function hexToRgba(hex) {
    hex = hex.replace('#', '');

    let r = parseInt(hex.substring(0, 2), 16);
    let g = parseInt(hex.substring(2, 4), 16);
    let b = parseInt(hex.substring(4, 6), 16);

    return `rgba(${r}, ${g}, ${b})`;
}

function changeTilePreviewColor(){
    const tilePreviewBox = document.getElementById("tile-preview");
    const colorVal = document.getElementById("tile-color").value;
    let ctx = tilePreviewBox.getContext("2d");

    if(colorVal.match(/#([0-9]|[A-F]|[a-f]){6}/)){
        document.getElementById("tile-color").style.backgroundColor = "white"; 
        console.log('updated color')
        ctx.clearRect(0, 0, tilePreviewBox.width, tilePreviewBox.height);
        ctx.fillStyle = hexToRgba(colorVal);
        ctx.fillRect(0, 0, tilePreviewBox.width, tilePreviewBox.height);
    }else{
        document.getElementById("tile-color").style.backgroundColor = "red"; 
    }
}

function changeTilePreviewColorEdit(){
    const tilePreviewBox = document.getElementById("edit-tile-preview");
    const colorVal = document.getElementById("edit-tile-color").value;
    let ctx = tilePreviewBox.getContext("2d");

    if(colorVal.match(/#([0-9]|[A-F]|[a-f]){6}/)){
        document.getElementById("edit-tile-color").style.backgroundColor = "white"; 
        console.log('updated color')
        ctx.clearRect(0, 0, tilePreviewBox.width, tilePreviewBox.height);
        ctx.fillStyle = hexToRgba(colorVal);
        ctx.fillRect(0, 0, tilePreviewBox.width, tilePreviewBox.height);
    }else{
        document.getElementById("edit-tile-color").style.backgroundColor = "red"; 
    }
}

let availableTiles = [];

//TODO: add backend functionality
async function initializeAvailableTiles() {
    availableTiles = await dbTileObject.getAllObject();
    if (!availableTiles || availableTiles.length === 0) {
        console.warn("No tiles available to toggle");
    }
}

let isMouseDown = false; 
let selectedTile = null; 
let deleteMode = false;

//TODO: add backend functionality
async function handleSquareClick(square) {
    const currID = document.getElementById("tile-selector").value;
    
    if (!currID) {
        console.error("No tile selected in the tile selector.");
        return;
    }

    try {
        deleteMode = currID === "delete";

        if (deleteMode) {
            square.style.backgroundImage = "";
            square.style.backgroundSize = "";
            square.style.backgroundPosition = "";
            square.removeAttribute('data-tile-name');
            square.removeAttribute('data-tile-details');
        } else {
            const tile = await dbTileObject.getObject(parseInt(currID)); 
            if (!tile) {
                console.error("Tile not found for ID:", currID);
                return;
            }

            selectedTile = tile;

            square.style.backgroundImage = `url(${tile.imgData})`;
            square.style.backgroundSize = "cover";
            square.style.backgroundPosition = "center";
            square.setAttribute('data-tile-name', tile.type);
            square.setAttribute('data-tile-details', tile.details);
        }

        //saves the state of the grid
        saveGridState();
        square.addEventListener('mouseenter', showTileDetails);
    } catch (error) {
        console.error("Error loading tile:", error);
    }
}

function onMouseDown(event) {
    const square = event.target;
    if (square.classList.contains('grid-tile')) {
        isMouseDown = true;
        handleSquareClick(square);
    }
}

function onMouseMove(event) {
    if (!isMouseDown || !selectedTile && !deleteMode) return;
    const square = event.target;
    if (square.classList.contains('grid-tile')) {
        if (deleteMode) {
            square.style.backgroundImage = "";
            square.style.backgroundSize = "";
            square.style.backgroundPosition = "";
            square.removeAttribute('data-tile-name');
            square.removeAttribute('data-tile-details');
        } else {
            square.style.backgroundImage = `url(${selectedTile.imgData})`;
            square.style.backgroundSize = "cover";
            square.style.backgroundPosition = "center";
            square.setAttribute('data-tile-name', selectedTile.type);
            square.setAttribute('data-tile-details', selectedTile.details);
        }
        square.addEventListener('mouseenter', showTileDetails);
    }
}

function onMouseUp() {
    isMouseDown = false;
    saveGridState();
}

function showTileDetails(event) {
    const square = event.currentTarget;
    const tileName = square.getAttribute('data-tile-name');
    const tileDetails = square.getAttribute('data-tile-details');
    
    if (square.hasAttribute('data-tile-name')){
        const tooltip = document.createElement('div');
        tooltip.classList.add('tile-tooltip');
        tooltip.innerHTML = `<strong>${tileName}</strong><br>${tileDetails}`;
        document.body.appendChild(tooltip);

        const updateTooltipPosition = (e) => {
            tooltip.style.left = `${e.pageX + 10}px`;
            tooltip.style.top = `${e.pageY + 10}px`;
        };

        updateTooltipPosition(event);
        document.addEventListener('mousemove', updateTooltipPosition);

        square.addEventListener('mouseleave', () => {
            tooltip.remove();
            document.removeEventListener('mousemove', updateTooltipPosition);
        });
    }
}

export async function initializeBattleGrid(battleGrid) {
    await initializeAvailableTiles();

    const squares = battleGrid.querySelectorAll('.grid-tile');
    squares.forEach(square => {
        square.addEventListener('mousedown', onMouseDown);
        square.addEventListener('mousemove', onMouseMove);
        square.addEventListener('mouseup', onMouseUp);
        square.addEventListener('mouseenter', showTileDetails);
    });

    saveGridState();
}

//TODO: add backend
//should make this an option
export async function clearTileObjectDB() {
    try {
        await dbGridState.clearDatabase();
        const message = await dbTileObject.clearDatabase();
        const allTiles = await getAllTiles();
        await Promise.all(
            allTiles.map(async (serverTile) => {

                const IDBtileID = serverTile.IDBtileID;
                await deleteTile(IDBtileID);
            })
        );
        console.log(message);
    } catch (error) {
        console.error("Error clearing dbTileObject:", error);
    }
}

async function populateTileDropdown1() {
    const tileSelector = document.getElementById("tile-selector");
    try {
        const tiles = await dbTileObject.getAllObject();
        tiles.forEach(tile => {
            const option = document.createElement('option');
            option.value = tile.id; 
            option.textContent = tile.type;
            tileSelector.appendChild(option);
        });
    } catch (error) {
        console.error("Error populating tile dropdown:", error);
    }
}

//actual tile dropdown content
async function populateTileDropdowns() {
    try {
        const tiles = await dbTileObject.getAllObject();
        console.log("Tiles in database:", tiles);

        // Populate the CREATE NEW TILE dropdown
        const editTileDropdown = document.querySelector('.edit-tile-dropdown-content');

        // Clear existing options or else it will look uggooo
        editTileDropdown.innerHTML = '';

        // render the EDIT EXISTING TILE dropdown
        tiles.forEach(tile => {
            const option = document.createElement('a');
            option.href = "#";
            option.setAttribute("tile-id", tile.id);
            option.textContent = tile.type;
            option.addEventListener('click', () => {
                document.getElementById('edit-details').value = tile.details;
                document.getElementById('edit-tile-color').value = tile.color || '#FF0000';
                document.getElementById('edit-img-upload').value = '';
            });
            editTileDropdown.appendChild(option);
        });
    } catch (error) {
        console.error("Error populating tile dropdowns:", error);
    }
}

window.addEventListener("DOMContentLoaded", (event) => {
    const deleteTile = document.getElementById("delete-tile");
    if (deleteTile) {
        deleteTile.addEventListener("click", deleteEditedTile);
    }
});

window.addEventListener("DOMContentLoaded", (event) => {
    const editButton = document.getElementById("edit-tile");
    if (editButton) {
        editButton.addEventListener("click", saveEditedTile);
    }
});

//
window.addEventListener("DOMContentLoaded", (event) => {
    const dropDown = document.querySelector(".tile-dropdown-content");
    if (dropDown) {
        dropDown.addEventListener("click", function(event) {
            if (event.target.tagName === "A") {
                console.log(" thing done");
                const targetID = parseInt(event.target.getAttribute("tile-id"));
                displayTileDetailsForExisting(targetID);
            }
        });
    }
});

window.addEventListener("DOMContentLoaded", (event) => {
    const dropDown = document.querySelector(".edit-tile-dropdown-content");
    if (dropDown) {
        dropDown.addEventListener("click", function(event) {
            if (event.target.tagName === "A") {
                console.log(" thing done");
                const targetID = parseInt(event.target.getAttribute("tile-id"));
                displayTileDetailsForEditing(targetID);
            }
        });
    }
});

window.addEventListener("DOMContentLoaded", (event) => {
    const addTile = document.getElementById("add-tile-1");
    if (addTile) {
        addTile.addEventListener("click", addNewCustomTile);
    }
});

window.addEventListener("DOMContentLoaded", (event) => {
    const tilePreview = document.getElementById("tile-preview");
    if (tilePreview) {
        tilePreview.getContext("2d", { willReadFrequently: true });
    }
});

window.addEventListener("DOMContentLoaded", (event) => {
    const editOption = document.getElementById("edit-option");
    if(editOption){
        editOption.addEventListener("click", showEdit);
    }
});

window.addEventListener("DOMContentLoaded", (event) => {
    const customOption = document.getElementById("custom-option");
    if(customOption){
        customOption.addEventListener("click", showCustom);
    }
});

window.addEventListener("DOMContentLoaded", (event) => {
    const x1 = document.getElementById("cross-svg");
    if(x1){
        x1.addEventListener("click", hideCustom);
    }
});

window.addEventListener("DOMContentLoaded", (event) => {
    const x2 = document.getElementById("cross-svg-2");
    if(x2){
        x2.addEventListener("click", hideExisting);
    }
});

window.addEventListener("DOMContentLoaded", (event) => {
    const x3 = document.getElementById("edit-cross-svg");
    if(x3){
        x3.addEventListener("click", hideEdit);
    }
});

window.addEventListener("DOMContentLoaded", (event) => {
    const tilePreview = document.getElementById("tile-color");
    if(tilePreview){
        tilePreview.addEventListener("keyup", changeTilePreviewColor);
    }
});



window.addEventListener("DOMContentLoaded", (event) => {
    const tilePreview = document.getElementById("edit-tile-color");
    if(tilePreview){
        tilePreview.addEventListener("keyup", changeTilePreviewColorEdit);
    }
});

window.addEventListener("DOMContentLoaded", (event) => {
    const upload = document.getElementById('img-upload');
    if (upload) {
        upload.addEventListener('change', function (event) {
            const file = event.target.files[0];
            const canvas = document.getElementById('tile-preview');
            const ctx = canvas.getContext('2d');
            
            if (file) {
                console.log('success');
                const img = new Image();
                img.onload = function () {
                    const newWidth = 200;
                    const newHeight = 200;
                    
                    canvas.width = newWidth;
                    canvas.height = newHeight;
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    ctx.drawImage(img, 0, 0, newWidth, newHeight);
        
                    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        
                    ctx.putImageData(imageData, 0, 0);
                };
                img.src = URL.createObjectURL(file);
            }
        });
    }
});

window.addEventListener("DOMContentLoaded", (event) => {
    const upload = document.getElementById('edit-img-upload');
    if (upload) {
        upload.addEventListener('change', function (event) {
            const file = event.target.files[0];
            const canvas = document.getElementById('edit-tile-preview');
            const ctx = canvas.getContext('2d');
            
            if (file) {
                console.log('success');
                const img = new Image();
                img.onload = function () {
                    const newWidth = 200;
                    const newHeight = 200;
                    
                    canvas.width = newWidth;
                    canvas.height = newHeight;
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    ctx.drawImage(img, 0, 0, newWidth, newHeight);
        
                    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        
                    ctx.putImageData(imageData, 0, 0);
                };
                img.src = URL.createObjectURL(file);
            }
        });
    }
});

window.addEventListener("DOMContentLoaded", (event) => {
    const dropDown = document.querySelector(".tile-dropdown-content");
    if (dropDown) {
        dropDown.addEventListener("click", function(event) {
            if (event.target.tagName === "A") {
                document.getElementById("displayed-tile").textContent = event.target.textContent;
            }
        });
    }
});

window.addEventListener("DOMContentLoaded", (event) => {
    const dropDown = document.querySelector(".edit-tile-dropdown-content");
    if (dropDown) {
        dropDown.addEventListener("click", function(event) {
            if (event.target.tagName === "A") {
                document.getElementById("edit-displayed-tile").textContent = event.target.textContent;
            }
        });
    }
});


// This is for background image
document.getElementById('background-image-upload').addEventListener('change', function (event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();

        reader.onload = function (e) {
            // Set the background image using CSS
            const gridContainer = document.getElementById('grid-container');
            gridContainer.style.setProperty('--background-image', `url(${e.target.result})`);
        };

        reader.readAsDataURL(file);
    } else {
        alert("No file selected or invalid file.");
    }
});

document.getElementById("delete-tile-types").addEventListener('click', (event) => {
    clearTileObjectDB();
    populateTileDropdowns();
    populateTileDropdown1();
    document.getElementById("tile-selector").innerHTML = '<option value="delete">Delete Tile</option>';

    alert("deleted all tile types");
});

// Call the populateTileDropdown function on page load
window.addEventListener('load', () => {
    populateTileDropdown1();
});

document.getElementById("tile-selector").addEventListener('change', (event) => {
    const selectedTileId = event.target.value;
    console.log("Selected Tile ID:", selectedTileId);
});

window.addEventListener('load', () => {
    populateTileDropdowns();
});