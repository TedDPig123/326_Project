import Canvas from "../models/SQLiteCanvas.js";

const factoryResponse = (status, message) => ({ status, message });

//POST: Uploads image data to database
export const putCanvas = async (req, res) =>{
    const imgData = req.body;
    try{
        const newCanvas = await Canvas.create({imgData: JSON.stringify(imgData)});
        res.status(200).json(newCanvas);
    }catch(error){
        console.log(error);
        res.status(500).json(factoryResponse(500, "Canvas data not uploaded to error"));
    }
}

//GET: Downloads image data from database
export const getCanvas = async (req, res) =>{
    try{
        const imgData = await Canvas.findOne();
        res.status(200).json(imgData);
    }catch(error){
        res.status(500).json(factoryResponse(500, "Error retrieving canvas data"));
    }
}

//UPDATE: Updates canvas state
export const updateCanvas = async (req, res) =>{
    const imgData = req.body;
    try {
        const canvas = await Canvas.findByPk(1);
        if (!canvas) {
            return res.status(404).json(factoryResponse(404, "Canvas not found"));
        }
        await canvas.update({imgData: JSON.stringify(imgData)});
    }catch(error){
        res.status(500).json(factoryResponse(500, "Canvas data not uploaded to error"));
    }
}

//DELETE: Deletes image data from database
export const deleteCanvas = async (req, res) => {
    const { id } = req.params;
    try {
        const canvas = await Canvas.findByPk(id);
        if (!canvas) {
            return res.status(404).json(factoryResponse(404, "Canvas not found"));
        }
        await canvas.destroy();
        res.status(200).json(factoryResponse(200, "Canvas deleted successfully"));
    } catch (error) {
        res.status(500).json(factoryResponse(404, "Error in deleting canvas"));
    }
};



