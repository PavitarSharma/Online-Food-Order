import express, { Request, Response } from "express";
import { CreateVendor, GetVendors, GetrVendorById } from "../controllers";

const router = express.Router();

router.post("/vendor", CreateVendor);

router.get("/vendors", GetVendors);

router.get("/vendor/:id", GetrVendorById);

router.get("/", (req: Request, res: Response) => {
  res.json({ message: "Hello from admin." });
});

export { router as AdminRoute };
