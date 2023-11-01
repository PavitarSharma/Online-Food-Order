import express from "express";
import { config } from "dotenv";
import App from "./services/ExpressApp";
import dbConnection from "./services/Database";
import { PORT } from "./config";

config();

const StartServer = async () => {
  const app = express();

  await dbConnection();

  await App(app);

  app.listen(PORT, () => console.log(`Server is listening to port ${PORT}`));
};

StartServer();
