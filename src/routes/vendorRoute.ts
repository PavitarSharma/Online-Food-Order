import express, { Request, Response } from "express";
import {
  AddFood,
  GetCurrentOrders,
  GetFoods,
  GetOrderDetail,
  GetVendorProfile,
  ProcessOrder,
  UpdateVendorCoverImage,
  UpdateVendorProfile,
  UpdateVendorService,
  VendorLogin,
} from "../controllers";
import { Authenticate } from "../middleware/CommonAuth";
import { images } from "../middleware";

const router = express.Router();

router.get("/", (req: Request, res: Response) => {
  res.json({ message: "Hello from vendor." });
});

router.post("/login", VendorLogin);

router.use(Authenticate);
router.get("/profile", GetVendorProfile);
router.patch("/profile", UpdateVendorProfile);
router.patch("/coverimage", images, UpdateVendorCoverImage);
router.patch("/service", UpdateVendorService);

router.post("/food", images, AddFood);
router.get("/foods", GetFoods);

// Orders
router.get("/orders", GetCurrentOrders)
router.put("/order/:id/process", ProcessOrder)
router.get("/order/:id", GetOrderDetail)



export { router as VendorRoute };
