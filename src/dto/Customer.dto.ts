import { IsEmail, Length } from "class-validator";

export class CreateCustomerInput {
  @IsEmail()
  email: string;

  @Length(7, 15)
  phone: string;

  @Length(6, 12)
  password: string;
}

export interface CustomerPayload {
  _id: string;
  email: string;
  verified: boolean;
}

export class CustomerLoginInput {
  @IsEmail()
  email: string;

  @Length(6, 12)
  password: string;
}

export class EditCustomerProfileInput {
  @Length(3, 16)
  firstName: string;

  @Length(3, 16)
  lastName: string;

  @Length(6, 16)
  address: string;
}
