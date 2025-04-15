const { Readable } = require('stream');
const axios = require('axios');
const fs = require('fs');
const mongoose = require('mongoose');
const conn = mongoose.connection;
let bucket;

// Ensure the bucket is ready
conn.once("open", () => {
  bucket = new mongoose.mongo.GridFSBucket(conn.db, { bucketName: "uploads" });
  console.log("✔ GridFSBucket ready");
});

// Upload File
const uploadFile = (req, res) => {
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
};

// Get all files with pagination and filters
const getAllFiles = async (req, res) => {
  const { search, tags, page = 2, limit = 10 } = req.query;
  
  const query = {};
  if (search) {
    query.filename = { $regex: search, $options: "i" };
  }
  if (tags) {
    const tagsArray = tags.split(",");
    query.tags = { $all: tagsArray };
  }

  try {
    const totalFiles = await bucket.find().toArray();
    const totalFilesCount = totalFiles?.length;
    const cursor = await bucket.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const allValues = await cursor.toArray();
    res.status(200).json({
      totalFilesCount,
      page: parseInt(page),
      limit: parseInt(limit),
      files: allValues,
    });
  } catch (err) {
    res.status(500).send("Error retrieving files.");
  }
};

// Download File
const downloadFile = async (req, res) => {
  const fileId = req.params.fileId;
  const objectId = new mongoose.Types.ObjectId(fileId);

  try {
    const file = await bucket.find({ _id: objectId }).toArray();

    if (file.length === 0) {
      return res.status(404).send("File not found.");
    }

    const { filename, contentType } = file[0];
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    const downloadStream = bucket.openDownloadStream(objectId);
    downloadStream.pipe(fs.createWriteStream(`./${filename}`));
    downloadStream.pipe(res);

    downloadStream.on('error', (err) => {
      console.error("Download error:", err);
      res.status(500).send("Error downloading file.");
    });

    // downloadStream.on('end', () => {
    //   console.log(`File download completed for file: ${filename}`);
    //   res.end(`File download completed for file: `);
    // });
  } catch (err) {
    console.error("Error fetching file metadata:", err);
    res.status(500).send("Internal server error.");
  }
};

// Get a particular file
const getFileById = async (req, res) => {
  const fileId = req.params.fileid;
  const objectId = new mongoose.Types.ObjectId(fileId);

  try {
    const file = await bucket.find({ _id: objectId }).toArray();
    if (file.length === 0) return res.status(404).json({ error: "File not found" });

    res.json(file);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update tags
const updateTags = async (req, res) => {
  const fileId = req.params.fileId;
  const tags = req.body.tags;
  const tagsArray = tags.split(' ');

  if (!tags || !Array.isArray(tagsArray)) {
    return res.status(400).send("Tags must be provided.");
  }

  const objectId = new mongoose.Types.ObjectId(fileId);

  try {
    const file = await bucket.find({ _id: objectId }).toArray();

    if (file.length === 0) {
      return res.status(404).send("File not found.");
    }

    await conn.db.collection('uploads.files').updateOne(
      { _id: objectId },
      {
        $addToSet: { "metadata.tags": { $each: tagsArray } },
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
};

// Delete File
const deleteFile = async (req, res) => {
  const fileId = req.params.fileId;
  const objectId = new mongoose.Types.ObjectId(fileId);

  try {
    const file = await bucket.find({ _id: objectId }).toArray();

    if (file.length === 0) {
      return res.status(404).send("File not found.");
    }

    await bucket.delete(objectId);
    res.status(200).json({
      message: "File deleted successfully",
      fileId: fileId,
    });
  } catch (err) {
    console.error("Error deleting file:", err);
    res.status(500).send("Error deleting file.");
  }
};

// Save PDF from URL
const savePdfFromUrl = async (req, res) => {
  const { url, filename, tags } = req.body;

  if (!url || !filename) {
    return res.status(400).send("URL and filename are required.");
  }

  try {
    const response = await axios.get(url, { responseType: 'arraybuffer' });

    const readableStream = new Readable();
    readableStream.push(response.data);
    readableStream.push(null);

    const uploadStream = bucket.openUploadStream(filename, {
      contentType: 'application/pdf',
      metadata: {
        tags: tags || [],
        uploadedBy: "system",
        uploadDate: new Date(),
      },
    });

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
};

module.exports = {
  uploadFile,
  getAllFiles,
  downloadFile,
  getFileById,
  updateTags,
  deleteFile,
  savePdfFromUrl,
};
