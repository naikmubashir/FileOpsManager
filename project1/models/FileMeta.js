const mongoose = require("mongoose");

const FileMetaSchema = new mongoose.Schema(
  {
    filename: String,
    fileId: String,
    tags: [String],
    contentType: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("FileMeta", FileMetaSchema);
