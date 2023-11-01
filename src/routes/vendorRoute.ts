import express, { Request, Response } from "express";
import {
  GetVendorProfile,
  UpdateVendorProfile,
  UpdateVendorService,
  VendorLogin,
} from "../controllers";
import { Authenticate } from "../middleware/CommonAuth";

const router = express.Router();

router.post("/login", VendorLogin);

router.use(Authenticate);
router.get("/profile", GetVendorProfile);
router.patch("/profile", UpdateVendorProfile);
router.patch("/service", UpdateVendorService);

router.get("/", (req: Request, res: Response) => {
  res.json({ message: "Hello from vendor." });
});

export { router as VendorRoute };
