const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const { Readable } = require("stream");
const axios = require('axios');
const fs = require('fs')


const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

const conn = mongoose.connection;

let bucket;

conn.once("open", () => {
  bucket = new mongoose.mongo.GridFSBucket(conn.db, {
    bucketName: "uploads",
  });
  console.log("✔ GridFSBucket ready");
});



// Upload route using GridFSBucket
router.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).send("No file uploaded.");

  const readableStream = new Readable();
  readableStream.push(req.file.buffer);
  readableStream.push(null);

  const uploadStream = bucket.openUploadStream(req.file.originalname, {
    contentType: req.file.mimetype,
    metadata: {
      uploadedBy: "system",
      tags: req.body?.tags?.split(",") || [],
      uploadDate: new Date(),
    },
  });

  readableStream
    .pipe(uploadStream)
    .on("error", (err) => {
      console.error("Upload error:", err);
      res.status(500).send("Error uploading file");
    })
    .on("finish", () => {
      res.status(201).json({
        fileId: uploadStream.id,
        filename: uploadStream.filename,
      });
    });

});

// Get all files
router.get('/',async(req, res)=>{

    const { search, tags, page = 1, limit = 10 } = req.query;
        
    const query={};
    if(search){
        query.filename = { $regex: search, $options: "i" };
    }
    if (tags) {
        const tagsArray = tags.split(",");
        query.tags = { $all: tagsArray };
    }
    // const projection = { _id: 0, rating: 1, name: 1 }; 0 to exclude , 1 to include
    // const cursor = collection.find().project(projection);
    const totalFiles = await bucket.find().toArray();
    const totalFilesCount=totalFiles?.length;
    const cursor = await bucket.find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)//If page = 2 and limit = 10, this skips the first (2 - 1) * 10 = 10 documents.
    .limit(parseInt(limit));

    const allValues =  await cursor.toArray();
    res.status(200).json({
        totalFilesCount,
        page: parseInt(page),
        limit: parseInt(limit),
        files:allValues,
      });
})


//Download a file
router.get("/download/:fileId", async (req, res) => {
    const fileId = req.params.fileId;
  
    // Convert fileId to ObjectId
    const objectId = new mongoose.Types.ObjectId(fileId);
  
    try {
      // Find the file metadata first to get the content type
      const file = await bucket.find({ _id: objectId }).toArray();
      
      if (file.length === 0) {
        return res.status(404).send("File not found.");
      }
  
      const { filename, contentType } = file[0];
      console.log(file[0])
      // Set the correct content-type based on the file's MIME type
      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  
      // Open a download stream and pipe the file to the response
      const downloadStream = bucket.openDownloadStream(objectId);
      downloadStream.pipe(fs.createWriteStream(`./${filename}`)); //it will overwrite the file of same name
  
      // Handle errors and end the response
      downloadStream.on('error', (err) => {
        console.error("Download error:", err);
        res.status(500).send("Error downloading file.");
      });
  
      downloadStream.on('end', () => {
        console.log(`File download completed for file: ${filename}`);
        res.end(`File download completed for file: `);
      });
  
    } catch (err) {
      console.error("Error fetching file metadata:", err);
      res.status(500).send("Internal server error.");
    }
  });


// Get a particular file
router.get('/:fileid',async(req,res)=>{
    try {
        const fileId = req.params.fileid;
        const objectId = new mongoose.Types.ObjectId(fileId);
        const file = await bucket.find({ _id: objectId }).toArray();
      
     
        if (file.length===0) return res.status(404).json({ error: "File not found" });
    
        res.json(file);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
})
// Update tags route
router.put("/tags/:fileId", async (req, res) => {
    const fileId = req.params.fileId;
    const tags  = req.body.tags;
    tagsArray= tags.split(' ');
    // Check if tags are provided
    if (!tags || !Array.isArray(tagsArray)) {
      return res.status(400).send("Tags must be provided .");
    }
  
    // Convert fileId to ObjectId
    const objectId = new mongoose.Types.ObjectId(fileId);
  
    try {
      // Find the file in the GridFS bucket
      const file = await bucket.find({ _id: objectId }).toArray();
  
      if (file.length === 0) {
        return res.status(404).send("File not found.");
      }
  
      // Update the tags in the file's metadata
      await conn.db.collection('uploads.files').updateOne(
        { _id: objectId },
        {
        // $ set: {   // This doesn't append 
        //     "metadata.tags": tagsArray, 
        //   },
        $addToSet: { //Appends
            "metadata.tags": { $each: tagsArray },  // Add each tag in the array to the tags array, ensuring no duplicates
          },
        
        }
      );
  
      res.status(200).json({
        message: "Tags updated successfully.",
        fileId: fileId,
        updatedTags: tags,
      });
    } catch (err) {
      console.error("Error updating tags:", err);
      res.status(500).send("Error updating tags.");
    }
  });
// Delete route using GridFSBucket
router.delete("/delete/:fileId", async (req, res) => {
    const fileId = req.params.fileId;
  
    // Convert fileId to ObjectId
    const objectId = new mongoose.Types.ObjectId(fileId);
  
    try {
      // Check if the file exists before attempting to delete
      const file = await bucket.find({ _id: objectId }).toArray();
  
      if (file.length === 0) {
        return res.status(404).send("File not found.");
      }
  
      // Delete the file from GridFS
      await bucket.delete(objectId);
  
      res.status(200).json({
        message: "File deleted successfully",
        fileId: fileId,
      });
    } catch (err) {
      console.error("Error deleting file:", err);
      res.status(500).send("Error deleting file.");
    }
  });
  


  
  // Route to fetch and save PDF from a URL to GridFS
  router.post("/save-pdf-from-url", async (req, res) => {
    const { url, filename, tags } = req.body;
  
    if (!url || !filename) {
      return res.status(400).send("URL and filename are required.");
    }
  
    try {
      // Fetch the PDF file from the URL
      const response = await axios.get(url, { responseType: 'arraybuffer' });
  
      // Convert the response data to a readable stream
      const readableStream = new Readable();
      readableStream.push(response.data); // PDF file buffer
      readableStream.push(null); // End of stream
  
      // Create a GridFS upload stream
      const uploadStream = bucket.openUploadStream(filename, {
        contentType: 'application/pdf',
        metadata: {
          tags: tags || [],
          uploadedBy: "system",
          uploadDate: new Date(),
        },
      });
  
      // Pipe the readable stream (PDF) into the GridFS upload stream
      readableStream.pipe(uploadStream)
        .on('error', (err) => {
          console.error('Error saving PDF to GridFS:', err);
          res.status(500).send("Error saving PDF to GridFS.");
        })
        .on('finish', () => {
          res.status(201).json({
            message: "PDF saved successfully to GridFS.",
            fileId: uploadStream.id,
            filename: uploadStream.filename,
          });
        });
    } catch (err) {
      console.error("Error fetching PDF from URL:", err);
      res.status(500).send("Error fetching PDF from URL.");
    }
  });
  


module.exports = router;