const express = require('express');
const multer = require('multer');
const mongoose = require('mongoose')
const {GridFsStorage}=require('multer-gridfs-storage');
const {uploadFile, getAllFiles, getFileById, deleteFile, updateTags, downloadFile} = require("../controllers/fileController");
const router = express.Router();

const storage= new GridFsStorage({
    db: mongoose.connection, // direct connection reuse OR  we can use--> url: process.env.MONGO_URI,
    // file: (req, file)=>{
    //     console.log('MMMMMMMM',req.headers['content-type']);

    //     console.log('HellOOO',file)
    //     console.log('HWWWW',file.mimetype)
    //     return {
    //         filename: file.originalname,
    //         bucketName: 'uploads',
    //         metadata: {
    //             contentType:  'application/octet-stream',
    //             tags: req.body.tags || [],
    //         },
    //     }
    // }
});

const upload = multer({ storage });
console.log('UPLOADDDD',upload)
// Routes
router.post("/upload", upload.single("file"), uploadFile);
router.get("/", getAllFiles); // ?search=&tags=&page=&limit=
router.get("/:id", getFileById);
router.get("/download/:id", downloadFile);
router.put("/:id/tags", updateTags);
router.delete("/:id", deleteFile);

module.exports = router;
