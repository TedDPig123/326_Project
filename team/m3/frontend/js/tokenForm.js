import { updateMegaDB } from "./megaDBRequests.js";
export class tokenForm{
    //adds all needed element from main.html as private attribute
    #createButton;#cancelButton;#updateButton;#deleteButton;#ObjForm;
    #addObj;#nameObj;#descripObj;#numCopy;#c;#r;#ObjGrid;#idObj

    //DONE
    constructor(){
        this.#createButton = document.getElementById("create");
        this.#cancelButton = document.getElementById("cancel");
        this.#updateButton = document.getElementById("update");
        this.#deleteButton = document.getElementById("delete");
        this.#ObjForm = document.getElementById("object_form");
        this.#addObj = document.getElementById("object_button");
        this.#nameObj = document.getElementById("name");
        this.#descripObj = document.getElementById("description");
        this.#numCopy = document.getElementById("copy");
        this.#c = document.getElementById("c");
        this.#r = document.getElementById("r");
        this.#ObjGrid = document.getElementById("object-grid");
        this.#idObj = document.createElement('idObj');
    }

    //the is the method that sets up the base object form
    render(){
        this.#ObjForm.appendChild(this.#idObj);
    }

    //records the number of columns and rows you can add at most
    addWH(width, height){
        this.#c.max = width;
        this.#r.max = height;
    }

    //this is called at the start right after create grid to load all token saved in sequelize onto the grid
    async renderWhenLoad(){
        const response = await fetch("/tokens/all");
        if (!response.ok) {
            throw new Error("Failed to get token");
        };
        const data = await response.json();
        const allToken = data.alltoekns;
        allToken.forEach(tokenData => this.#makeToken(tokenData));
        const allid = allToken.map(token => token.tokenid);
        //returns all the id for token that were loaded
        return allid;
    }

    //this returns the token form back to its initial state with no input
    clearForm(){
        this.#nameObj.value = "";
        this.#descripObj.value = "";
        this.#numCopy.value = 1;
        this.#c.value = 1;
        this.#r.value = 1;
    }

    //Done
    //this method is added to all token so that when you click on the token it will open the token form with the corresponding information for update or delete.
    async #reopenForm(event){
        if(!event.target.classList.contains("dragging")){
                if(this.#ObjForm.style.display === "none"){
                    this.#ObjForm.style.display= "block";
                    this.#deleteButton.style.display= "inline-block";
                    this.#updateButton.style.display= "inline-block";
                    this.#createButton.style.display= "none";
                    const id = event.target.id;
                    //gets the data of the token from the server
                    const response = await fetch(`/tokens/token/${id}`);
                    if (!response.ok) {
                        throw new Error("Failed to get token");
                    };
                    const data = await response.json();
                    this.#nameObj.value = data.name;
                    this.#descripObj.value = data.description;
                    this.#c.value = data.column;
                    this.#r.value = data.row;
                    this.#numCopy.value = 1;
                    //this is the id for the current object that is being clicked on
                    this.#idObj.setAttribute("id", data.tokenid+"temp"); 
                }
                //if you click on the object again it will close the form
                else if(this.#ObjForm.style.display === "block"){
                    this.#ObjForm.style.display= "none";
                    this.clearForm();
                }
        }
    }

    //this the to hide the update and delete button when you click to open the token form
    clickForm(){
        function clickFormInit(){
            if(this.#ObjForm.style.display === "block"){
                this.#ObjForm.style.display= "none";
            }
            else{
                this.#ObjForm.style.display= "block";
            }
            this.#createButton.style.display= "inline-block";
            this.#cancelButton.style.display= "inline-block";
            this.#updateButton.style.display= "none";
            this.#deleteButton.style.display= "none";
            this.#numCopy.value = 1;
            this.#c.value = 1;
            this.#r.value = 1;
        }
        this.#addObj.addEventListener("click",clickFormInit.bind(this));
    }

    //this is the function to create token, it creates all div element needed
    #makeToken(data){
        const spanElement = document.createElement("span");
        spanElement.classList.add("hovertext");
        spanElement.textContent = "name: "+data.name+"\ndescription: "+ data.description;
        spanElement.setAttribute("id", data.tokenid+"s"); 
        const tokenDiv = document.createElement("div");
        tokenDiv.classList.add("object");
        tokenDiv.classList.add("hoverBox");
        tokenDiv.appendChild(spanElement);
        tokenDiv.style.gridArea = `${1}/${1}/${1+data.row}/${1+data.column}`;
        tokenDiv.setAttribute("id", data.tokenid); 
        //the reopen form is added to all newly created token so that it is called when clicked
        tokenDiv.addEventListener("click", this.#reopenForm.bind(this));
        this.#ObjGrid.appendChild(tokenDiv);
        return;
    }

    //this will create the token and place it on the first row and column.
    async createToken(){
        if(this.#nameObj.value===""){
            alert("need name");
        }
        else{
            const newTokenData = {
                name: this.#nameObj.value, 
                description: this.#descripObj.value,
                column:parseInt(this.#c.value),
                row:parseInt(this.#r.value),
            }
            // fetchs the correct route to create token
            const response = await fetch("/tokens/newToken",  {
                method: "POST", 
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newTokenData)
            });
            if (!response.ok) {
                throw new Error("Failed to create token");
            }
            const data = await response.json();
            const id = this.#makeToken(data);
            this.clearForm();
            this.#ObjForm.style.display= "none";

            //megadb 
            await updateMegaDB();

            //returns the token id
            return data.tokenid;
        }
    }

    //this will delete the object token from the map and indexdb
    async deleteObject(){
        const startIndex = this.#idObj.id.indexOf("temp");
        const id = this.#idObj.id.substring(0, startIndex);
        let objDiv = document.getElementById(id);
        objDiv.remove();
        this.clearForm();
        this.#ObjForm.style.display= "none";
        // fetchs the correct route to delete token
        const response = await fetch("/tokens/delete/"+id, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        if (!response.ok) {
            throw new Error("Failed to delete token");
        }

        //megadb
        await updateMegaDB();

        //returns the token id
        return id;
    }

    //this will update the token from the map and indexdb
    async updateObject(){
        if(this.#nameObj.value===""){
            alert("need name");
        }
        else{
            const startIndex = this.#idObj.id.indexOf("temp");
            const id = this.#idObj.id.substring(0, startIndex);
            const tokenDiv = document.getElementById(id);
            const spanElement = document.getElementById(id+"s");
            const row = parseInt(this.#r.value);
            const column = parseInt(this.#c.value);
            tokenDiv.style.gridArea = `${1}/${1}/${row+1}/${column+1}`;
            spanElement.textContent = "name: "+this.#nameObj.value+"\ndescription: "+ this.#descripObj.value;
            const updateToken = {
                tokenid: id,
                name: this.#nameObj.value,
                description: this.#descripObj.value,
                row: row,
                column: column
            }
            // fetchs the correct route to update token
            const response = await fetch("/tokens/update", {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updateToken), 
            });
            if (!response.ok) {
                throw new Error("Failed to delete token");
            }
            this.clearForm();
            this.#ObjForm.style.display= "none";

            //updatemegadb
            await updateMegaDB();

            //returns the token id
            return id;
        }
    }
}
