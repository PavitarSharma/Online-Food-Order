import { CustomerPayload } from "./Customer.dto";
import { VendorPayload } from "./Vandor.dto";

export type AuthPayload = VendorPayload | CustomerPayload;
