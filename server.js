const express = require("express");
const app = express();
const userRoutes = require("./router/userRouter");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");

app.use(cors());

dotenv.config();

app.use(express.json());

mongoose
  .connect(process.env.MONGO_URL)
  .then((response) => console.log("Database Connected Successfully"))
  .catch((err) => console.error(err, "Database not connected"));

app.use("/foundation", userRoutes);

app.get("/", (req, res) => {
  res.send("Server is live");
});

app.listen(process.env.PORT, () => {
  console.log("Server is running");
});
