import { DatabaseConnection } from "/team/m3/js/DatabaseConnection.js";

//initialize default tiles
const dbTileObject = new DatabaseConnection();

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

// ALL DATABASE STUFF!

//This gets the canvas image url from the tile-preview square
function getCanvasImageFromCustom() {
    const canvas = document.getElementById("tile-preview");
    return canvas.toDataURL("image/png");
}

function getCanvasImageFromEdit() {
    const canvas = document.getElementById("edit-tile-preview");
    return canvas.toDataURL("image/png");
}


//This creates a new custom tile object
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
        console.log("Tile added with ID:", tileID);
        alert("tile added successfully");

        const addedTile = await dbTileObject.getObject(tileID);
        console.log("Tile just added:", addedTile);
        console.log("image", tileImage);
        console.log(" type", typeof(addedTile.imgData));

        const newTileOption = document.createElement("a");
        newTileOption.setAttribute("tile-id", tileID);
        newTileOption.setAttribute("href", "#");
        newTileOption.textContent = type;
        
        const existingTileDropdown = document.querySelector('.tile-dropdown-content');
        existingTileDropdown.appendChild(newTileOption);

        const clone = newTileOption.cloneNode(true);

        const editTileDropdown = document.querySelector('.edit-tile-dropdown-content');
        editTileDropdown.appendChild(clone);

        hideCustom();
        initializeAvailableTiles();

    } catch (error) {
        console.error("tile not added", error);
    }
}

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

    } catch (error) {
        console.error("tile not edited", error);
    }
}

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

function showCustom(){
    console.log("toggle works!")
    const tileMenu = document.querySelector('.custom');
    const greyOverlay = document.getElementById('screen-overlay');
    greyOverlay.style.display = 'flex';
    tileMenu.style.display = 'flex';
}

function hideCustom(){
    console.log("toggle works!")
    const tileMenu = document.querySelector('.custom');
    const greyOverlay = document.getElementById('screen-overlay');
    tileMenu.style.display = 'none';
    greyOverlay.style.display = 'none';
}

function showExisting(){
    console.log("toggle works!")
    const tileMenu = document.querySelector('.existing');
    const greyOverlay = document.getElementById('screen-overlay');
    greyOverlay.style.display = 'flex';
    tileMenu.style.display = 'flex';
}

function hideExisting(){
    console.log("toggle works!")
    const tileMenu = document.querySelector('.existing');
    const greyOverlay = document.getElementById('screen-overlay');
    tileMenu.style.display = 'none';
    greyOverlay.style.display = 'none';

    const tileOption = document.getElementById("displayed-tile");
    tileOption.innerHTML = "CHOOSE TILE";

    const editDetails = document.getElementById("details-2");
    editDetails.value = "";

    const canvas = document.getElementById("tile-preview-2");
    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
}

function showEdit(){
    console.log("toggle works!")
    const tileMenu = document.querySelector('.edit');
    const greyOverlay = document.getElementById('screen-overlay');
    greyOverlay.style.display = 'flex';
    tileMenu.style.display = 'flex';
}

function hideEdit(){
    console.log("toggle works!")
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
    const existingOption = document.getElementById("existing-option");
    if(existingOption){
        existingOption.addEventListener("click", showExisting);
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

let availableTiles = [];
let currentTileIndexes = new Map();

async function initializeAvailableTiles() {
    availableTiles = await dbTileObject.getAllObject();
    if (!availableTiles || availableTiles.length === 0) {
        console.warn("No tiles available to toggle");
    }
}

function handleSquareClick(square) {
    let currentIndex = currentTileIndexes.get(square) || 0;

    if (availableTiles.length === 0) {
        alert("No tiles available!! Please add some tiles first!!!");
        return;
    }

    const tile = availableTiles[currentIndex];

    square.style.backgroundImage = `url(${tile.imgData})`;
    square.style.backgroundSize = "cover";
    square.style.backgroundPosition = "center";

    square.setAttribute('data-tile-name', tile.type);
    square.setAttribute('data-tile-details', tile.details);

    square.addEventListener('mouseenter', showTileDetails);

    currentIndex = (currentIndex + 1) % availableTiles.length; //so we go back to the start
    currentTileIndexes.set(square, currentIndex);
}

function showTileDetails(event) {
    const square = event.currentTarget;
    const tileName = square.getAttribute('data-tile-name');
    const tileDetails = square.getAttribute('data-tile-details');

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

export async function initializeBattleGrid(battleGrid) {
    await initializeAvailableTiles();

    const squares = battleGrid.querySelectorAll('.grid-tile');
    squares.forEach(square => {
        square.addEventListener('click', () => handleSquareClick(square));
    });
}