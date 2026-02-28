import express from "express";
const cors = require("cors");
import dotenv from "dotenv";
import identifyRouter from "./routes/identify.route";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/identify", identifyRouter);

app.listen(3000, () => {
  console.log("Server running on port 3000");
});