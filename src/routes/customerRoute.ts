import express, { Request, Response } from "express";
import {
  CreateOrder,
  CustomerLogin,
  CustomerSignUp,
  CustomerVerify,
  EditCustomerProfile,
  GetCustomerProfile,
  GetOrderById,
  GetOrders,
  RequestOtp,
} from "../controllers";
import { Authenticate } from "../middleware";

const router = express.Router();

/* ==================== Sign Up / Create Customer ================================ */
router.post("/signup", CustomerSignUp);

/* ==================== Login ================================ */
router.post("/login", CustomerLogin);

// Authenticate
router.use(Authenticate);
/* ==================== Verify Customer Account ================================ */
router.patch("/verify", CustomerVerify);

/* ==================== OTP / Requesting OTP ================================ */
router.post("/otp", RequestOtp);

/* ==================== Profile ================================ */
router.get("/profile", GetCustomerProfile);

router.patch("/profile", EditCustomerProfile);

// Cart

// Order
router.post("/create-order", CreateOrder);
router.get("/orders", GetOrders);
router.get("/order/:id", GetOrderById);

//Payment

router.get("/", (req: Request, res: Response) => {
  res.json({ message: "Hello from customer." });
});

export { router as CustomerRoute };
