const express = require("express");
const multer = require("multer");
const fileController = require("../controllers/fileController.js");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Routes
router.post("/upload", upload.single("file"), fileController.uploadFile);
router.get("/", fileController.getAllFiles);
router.get("/download/:fileId", fileController.downloadFile);
router.get("/:fileid", fileController.getFileById);
router.put("/tags/:fileId", fileController.updateTags);
router.delete("/delete/:fileId", fileController.deleteFile);
router.post("/save-pdf-from-url", fileController.savePdfFromUrl);

module.exports = router;


//ui