import express, { Request, Response } from "express";
import {
  CustomerLogin,
  CustomerSignUp,
  CustomerVerify,
  EditCustomerProfile,
  GetCustomerProfile,
  RequestOtp,
} from "../controllers";
import { Authenticate } from "../middleware";

const router = express.Router();

/* ==================== Sign Up / Create Customer ================================ */
router.post("/signup", CustomerSignUp);

/* ==================== Login ================================ */
router.post("/login", CustomerLogin);

// Authenticate
router.use(Authenticate)
/* ==================== Verify Customer Account ================================ */
router.patch("/verify", CustomerVerify);

/* ==================== OTP / Requesting OTP ================================ */
router.post("/otp", RequestOtp);

/* ==================== Profile ================================ */
router.get("/profile", GetCustomerProfile);

router.patch("/profile", EditCustomerProfile);

// Cart

// Order

//Payment

router.get("/", (req: Request, res: Response) => {
  res.json({ message: "Hello from customer." });
});

export { router as CustomerRoute };
