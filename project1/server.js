const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const fileRoutes = require("./routes/fileRoutes");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(express.urlencoded({extended:false}))
app.use("/api/files", fileRoutes);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
      console.log("MongoDB connected");
      app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
})
.catch((err) => console.error(err));
