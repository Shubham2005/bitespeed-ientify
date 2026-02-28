import express from "express";
const cors = require("cors");
import dotenv from "dotenv";
import identifyRouter from "./routes/identify.route";
import { initializeDatabase } from "./db";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/identify", identifyRouter);

const PORT = process.env.PORT || 3000;

export default app;

if (require.main === module) {
  initializeDatabase().then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  });
}