import {tokenForm} from "./tokenForm.js";
import {imageForToken} from "./imageForToken.js";
import { moveToken } from "./moveToken.js";
import { updateMegaDB } from "./megaDBRequests.js";


const battleGrid = document.getElementById('battle-grid');
const form = document.getElementById("object_form");
form.style.display= "none";
const objectGrid = document.getElementById('object-grid');

//create a new tokenForm instance
const tokenObj = new tokenForm();
tokenObj.clickForm()

//add the image option to token form 
const inputImg = document.createElement("img");
inputImg.id = "preview";
inputImg.alt = "Image Preview";
const inputElement = document.createElement("input");
inputElement.type = "file";
inputElement.id = "imageInput";
inputElement.accept = "image/*";
form.appendChild(inputElement);
form.appendChild(inputImg);

//add the preview to token form
function previewImg(event){
    if (event.target.files&&event.target.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            inputImg.src = e.target.result;
        }
        reader.readAsDataURL(event.target.files[0]);
    }
    else{
        inputImg.removeAttribute("src")
    }
};

inputElement.addEventListener("change", (event) => previewImg(event))

//Switch between battle and object grid
const switchButton = document.getElementById("switch_button");
switchButton.addEventListener("click", ()=>{
    if(objectGrid.style.zIndex==="1"){
        objectGrid.style.zIndex = "0";
        battleGrid.style.zIndex = "1";
        switchButton.value = "Currently on Battle Grid"
    }
    else{
        battleGrid.style.zIndex = "0";
        objectGrid.style.zIndex = "1";
        switchButton.value = "Currently on Token Grid"
    }
})

//Everything below is related to creating a fully functioning token
document.getElementById('create-grid').addEventListener('click', async ()=> {
    const width = parseInt(document.getElementById('grid-width').value);
    const height = parseInt(document.getElementById('grid-height').value);

    //happens at the very start after you click create grid, basic setup is done the token
    tokenObj.addWH(width, height);
    tokenObj.render();

    const idarr = await tokenObj.renderWhenLoad();
    //for each token rendered
    idarr.forEach(id => {
        const img = new imageForToken(id);
        img.render();
        document.getElementById(id).addEventListener("click", (event) => {
            //if you aren't dragging the token, open the form and load the img
            if(!event.target.classList.contains("dragging")){
                img.renderImage();
            }
        });
        const moveT = new moveToken(id);
        moveT.render();
        moveT.mouseDown();
        moveT.mouseMove();
        moveT.mouseUP(); 
    });

    const createButton = document.getElementById("create");
    const updateButton = document.getElementById("update");
    const deleteButton = document.getElementById("delete");
    const cancelButton = document.getElementById("cancel");
    const deleteAllButton = document.getElementById("deleteAll");


    //below are event listener for all the object form button, they combine imageForToken, tokenForm and moveItem to create the full token creating form

    //clears the token form
    cancelButton.addEventListener("click", () => {
        tokenObj.clearForm();
        inputImg.removeAttribute("src");
        inputElement.value="";    
    })

    async function cToken(event) {
        const id = await tokenObj.createToken(event);
        //id = the token id
        if(id){
            const moveT = new moveToken(id);
            moveT.mouseDown();
            moveT.mouseMove();
            moveT.mouseUP();
            const img = new imageForToken(id);
            img.createImageElement();
            document.getElementById(id).addEventListener("click", (event) => {
                if(!event.target.classList.contains("dragging")){
                    img.renderImage();
                }
            });
        }
    }
    //created the token and place it on the grid
    createButton.addEventListener("click", (event) => {
        const numCopy = document.getElementById("copy").value;
        for(let i = 0; i<numCopy; i++){
            cToken(event)
        };
    });

    //updates the token
    updateButton.addEventListener("click", async () => {
        const id = await tokenObj.updateObject();
        if(id){
            const img = new imageForToken(id);
            img.updateImageElement()
        }
    });

    //deletes the token
    deleteButton.addEventListener("click", (event) => {
        tokenObj.deleteObject()
    });

    //deletes all token
    deleteAllButton.addEventListener("click", async () => {
        const response = await fetch("/tokens/deleteAll", {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
        
        })
        if (!response.ok) {
            throw new Error("Failed to delete all token");
        };
        alert("please refresh the page"); 
    });
})
