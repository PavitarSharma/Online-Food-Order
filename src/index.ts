import express from "express";
import { config } from "dotenv";
import { AdminRoute, VendorRoute } from "./routes";
import connectDB from "./utility/db";

config();

const app = express();
const PORT = process.env.PORT || 8001;

connectDB();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Hello from the food order backend",
  });
});

app.use("/admin", AdminRoute);
app.use("/vendor", VendorRoute);

app.listen(PORT, () => console.log(`Server is listening to port ${PORT}`));
