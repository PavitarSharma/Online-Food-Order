import bcrypt from "bcrypt";
import { Request } from "express";
import jwt from "jsonwebtoken";
import { APP_SECRET } from "../config";
import { VendorPayload } from "../dto";
import { AuthPayload } from "../dto/Auth.dto";

declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
} 
export const GenerateSalt = async () => {
  return await bcrypt.genSalt();
};

export const GeneratePassword = async (password: string, salt: string) => {
  return await bcrypt.hash(password, salt);
};

export const ValidatePassword = async (
  enteredPassword: string,
  savedPassword: string,
  salt: string
) => {
  return (await GeneratePassword(enteredPassword, salt)) === savedPassword;
};

export const GenerateSignature = async (payload: VendorPayload) => {
  return jwt.sign(payload, APP_SECRET, { expiresIn: "90d" });
};

export const ValidateSignature = async (req: Request) => {
  const signature = req.get("Authorization");

  if (signature) {
    try {
      const token = signature.split(" ")[1];
      const payload = (await jwt.verify(token, APP_SECRET)) as AuthPayload;
      req.user = payload;
      return true;
    } catch (error) {
      return false;
    }
  }

  return false;
};
