let toggle = false;
const canvas = document.getElementById('canvas'); 
const layer = document.getElementById("paintLayer");

canvas.addEventListener('mousedown', penDown); 
canvas.addEventListener('mouseup', penUp); 
canvas.addEventListener('mousemove', draw); 

layer.style.pointerEvents = 'none';


let tools = [false, false, false, false] //in order: pencil, eraser, circle, square. false when not selected
function changeTool(num)
{
    for (let i = 0;i < tools.length; i++) {
        if(i == num) {
            tools[i] = true;
        } else {
            tools[i] = false;
        }
    }
}

//since the tool selection remains checked on reload, ensures the proper tool is selected too
if (document.getElementById("pencil").checked) { changeTool(0); }
if (document.getElementById("eraser").checked) { changeTool(1); }
if (document.getElementById("circle").checked) { changeTool(2); }
if (document.getElementById("square").checked) { changeTool(3); }




function togglePaint() { //used for toggling whether or not you're actively drawing. prevents you from clicking on the grid if you are
    if(toggle == true) {
        toggle = false;
        layer.style.pointerEvents = 'none';
        document.getElementById('drawing-display').style.visibility = "hidden"; 
    } else {
        toggle = true;
        layer.style.pointerEvents = 'auto';
        document.getElementById('drawing-display').style.visibility = "visible"; 
    }
}
   
const ctx = canvas.getContext('2d'); //establishes canvas
ctx.canvas.width = canvas.width; 
ctx.canvas.height = canvas.height; 

let coord = {x: 0, y: 0};  
function getPosition(event){  //stores current position of mouse cursor
  const rect = canvas.getBoundingClientRect(); //used to get coordinates relative to canvas, instead of relative to the page
  coord.x = event.clientX - rect.left;
  coord.y = event.clientY - rect.top;
} 

let drawing = false; //variable for whether or not you're holding down the mouse to draw
let startPos;
function penDown(event){ 
  drawing = true; 
  getPosition(event); //tracks cursor positon when you are
  startPos = [coord.x, coord.y];
} 
function penUp(event){ 
  drawing = false;
  getPosition(event);
  if (tools[2] == true) {
    ctx.beginPath(); 
    ctx.strokeStyle = document.getElementById("colorPicker").value;
    ctx.lineWidth = document.getElementById("lineWeight").value;
    let rectWidth = coord.x - startPos[0];
    let rectHeight = coord.y - startPos[1];
    ctx.rect(startPos[0], startPos[1], rectWidth, rectHeight);
    ctx.stroke();
  }
  if (tools[3] == true) {
    ctx.beginPath(); 
    ctx.strokeStyle = document.getElementById("colorPicker").value;
    ctx.lineWidth = document.getElementById("lineWeight").value;
    let rectWidth = coord.x - startPos[0];
    let rectHeight = coord.y - startPos[1];
    ctx.ellipse(startPos[0], startPos[1], Math.abs(rectWidth), Math.abs(rectHeight), 0, 0, 2 * Math.PI);
    ctx.stroke();
  }
  saveCanvas();
} 

function draw(event){ 
  if (drawing == true) {
    ctx.beginPath(); 
    ctx.lineCap = 'round';
    ctx.lineWidth = document.getElementById("lineWeight").value; 
    if (tools[0] == true) {
        ctx.strokeStyle = document.getElementById("colorPicker").value; 
        ctx.moveTo(coord.x, coord.y); 
        getPosition(event); 
        ctx.lineTo(coord.x, coord.y); 
        ctx.stroke(); 
    } if (tools[1] == true) {
        //eraser here
        ctx.clearRect(event.offsetX, event.offsetY, ctx.lineWidth,ctx.lineWidth);

    } 
  }


}
function clear_canvas(){
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    saveCanvas();
}

async function saveCanvas() {
  let canvasState = ctx.getImageData(0,0,canvas.width,canvas.height)
  const imageData = canvasState.data;
  const response = await fetch('/canvas/post', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(imageData),
  });
  console.log(response);
  if (!response.ok) {
    throw new Error("Failed");
  };
}

async function loadCanvas() {
  const response = await fetch('/canvas/get', {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  console.log("GET");
  console.log(response);
  if (!response.ok) {
    throw new Error("Failed");
  };
  const data = await response.json();
  ctx.putImageData(data, 0, 0);
}

loadCanvas();
//loadCanvas();