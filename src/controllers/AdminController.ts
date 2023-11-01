import { NextFunction, Request, Response } from "express";
import { CreateVandorInput } from "../dto";
import { GeneratePassword, GenerateSalt } from "../utility";
import { Vendor } from "../models";

export const FindVendor = async (id: string | undefined, email?: string) => {
  if (email) {
    return await Vendor.findOne({ email: email });
  } else {
    return await Vendor.findById(id);
  }
};

export const CreateVendor = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const {
    name,
    address,
    pincode,
    foodType,
    email,
    password,
    ownerName,
    phone,
  } = <CreateVandorInput>req.body;

  const existingVandor = await FindVendor("", email);

  if (existingVandor !== null) {
    return res.json({ message: "A vandor is exist with this email ID" });
  }

  // Generate Salt and Password
  const salt = await GenerateSalt();
  const userPassword = await GeneratePassword(password, salt);

  const createdVandor = await Vendor.create({
    name: name,
    address: address,
    pincode: pincode,
    foodType: foodType,
    email: email,
    password: userPassword,
    salt: salt,
    ownerName: ownerName,
    phone: phone,
    rating: 0,
    serviceAvailable: false,
    coverImages: [],
    lat: 0,
    lng: 0,
  });

  return res.json(createdVandor);
};

export const GetVendors = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const vendors = await Vendor.find();

  if (vendors !== null) {
    res.status(200).json(vendors);
  }

  return res.status(400).json({ message: "Vandors does not available" });
};

export const GetrVendorById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;

  const vendor = await FindVendor(id);

  if (!vendor) {
    return res.status(400).json({ message: "Vandors does not available" });
  }

  res.status(200).json(vendor);
};
