import { DatabaseConnection } from "../ObjectToken/DatabaseConnection.js";

//initialize default tiles
const dbTileObject = new DatabaseConnection();

export class tileObject{
    #type;
    #details;
    #imgData;
    constructor(type, details, imgData){
        this.#type = type;
        this.#details = details;
        this.#imgData = imgData;
    }
    getType(){
        return this.#type;
    }
    getDetails(){
        return this.#details;
    }
    getImageData(){
        return this.#imgData;
    }
}

// ALL DATABASE STUFF!

function getCanvasImageFromCustom() {
    const canvas = document.getElementById("tile-preview");
    return canvas.toDataURL("image/png");
}

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
        alert("tile added successfully");

        const newTileOption = document.createElement("a");
        newTileOption.setAttribute("tile-id", tileID);
        newTileOption.textContent = type;
        
        const existingTileDropdown = document.querySelector('.tile-dropdown-content');
        existingTileDropdown.appendChild(newTileOption);

    } catch (error) {
        console.error("tile not added", error);
    }
}

window.addEventListener("DOMContentLoaded", (event) => {
    const dropDown = document.querySelector(".tile-dropdown-content");
    if (dropDown) {
        dropDown.addEventListener("click", function(event) {
            if (event.target.tagName === "A") {
                const targetID = event.target.getAttribute("tile-id");
                const tileObj = getTileById(targetID);
                displayTileDetailsForExisting(tileObj);
            }
        });
    }
});

async function getTileById(tileID) {
    try {
        const tileObject = await dbTileObject.getObject(tileID);
        return tileObject;
    } catch (error) {
        console.error("Error", error);
    }
}

function displayTileDetailsForExisting(tileObject) {
    document.getElementById("details-2").textContent = tileObject.details;
    document.getElementById("tile-preview-2").getContext("2d").drawImage(tileObject.image, 0, 0);
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