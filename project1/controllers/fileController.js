const FileMeta = require('../models/FileMeta');
const getGFSBucket= require('../config/db');
const mongoose= require('mongoose');


//Upload file
const uploadFile= async (req, res)=>{
    try {
        console.log('REQUESTTTT FILEEE:', req.file);
        if (!req.file) {
            console.log('NO FILEEE UPLOADEDDD')
            return res.status(400).json({ error: "No file uploaded" });
        }
        console.log('HEEEEEEEEDDDDDD',req.headers['content-type']);
        const tags = req.body.tags ? req.body.tags.split(",") : [];
        const file= new FileMeta({
            filename: req.file.originalname,
            fileId: req.file.id,
            contentType: req.file.mimetype,
            tags,
        });
        console.log('FILLLEEE',file)
        await file.save();
        res.status(201).json({ message: "File uploaded", file });

    } catch (error) {
        console.log("UPLOADDD ERRRORRR:", error);
        res.status(500).json({ error: error.message });
    }
}

//get All Files with Search , filter ,pagination
const getAllFiles= async(req,res)=>{
    try {
        const { search, tags, page = 1, limit = 10 } = req.query;
        
        let query={};
        if(search){
            query.filename = { $regex: search, $options: "i" };
        }
        if (tags) {
            const tagsArray = tags.split(",");
            query.tags = { $all: tagsArray };
        }
        const total = await FileMeta.countDocuments(query);
        const files = await FileMeta.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)//If page = 2 and limit = 10, this skips the first (2 - 1) * 10 = 10 documents.
        .limit(parseInt(limit));

        res.status(200).json({
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            files,
          });

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
}

//Get single file metadata
const getFileById= async(req,res)=>{
    try {
        const file = await FileMeta.findById(req.params.id);
        if (!file) return res.status(404).json({ message: "File not found" });
    
        res.json(file);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

//download file
const downloadFile= async(req, res)=>{
    try {
        const file = await FileMeta.findById(req.params.id);
        if (!file) return res.status(404).json({ message: "File not found" });
        
        const gfs= getGFSBucket();
        gfs.openDownloadStream(file.fileId).pipe(res);

    } catch (error) {
        res.status(500).json({ error: error.message });  
    }
}

// delete file

const deleteFile = async (req, res)=>{
    try {
        const file = await FileMeta.findById(req.params.id);
        if (!file) return res.status(404).json({ message: "File not found" });

        const gfs=getGFSBucket();
        await gfs.delete(file.fileId); // Deletes the file's actual content from the storage system (e.g., GridFS or another file storage service).
        await file.remove(); //removes the meta data of the file from the database like  name, fileId,tags etc etc

        res.json({ message: "File deleted" });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// Update tags of the file
const updateTags = async (req,res)=>{
    try {
        const tags = req.body.tags;
        if (!tags || !Array.isArray(tags)) return res.status(400).json({ message: "Tags must be an array" });

        const file = await FileMeta.findByIdAndUpdate(
            req.params.id, 
            { tags },//  It specifies the fields to update in the document
            { new: true }//It tells Mongoose to return the updated document instead of the original one. 
          );

          res.status(201).json(file);

    } catch (error) {
        res.status(500).json({ error: error.message }); 
    }
}


module.exports={uploadFile, getAllFiles, getFileById, deleteFile, updateTags, downloadFile} ;