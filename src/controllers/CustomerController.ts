import { NextFunction, Request, Response } from "express";
import { plainToClass } from "class-transformer";
import {
  CartItem,
  CreateCustomerInput,
  CustomerLoginInput,
  EditCustomerProfileInput,
  OrderInputs,
} from "../dto/Customer.dto";
import { validate } from "class-validator";
import {
  GenerateOtp,
  GeneratePassword,
  GenerateSalt,
  GenerateSignature,
  ValidatePassword,
  onRequestOTP,
} from "../utility";
import { Customer, Food, Order } from "../models";

export const CustomerSignUp = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const customerInputs = plainToClass(CreateCustomerInput, req.body);

  const inputErrors = validate(customerInputs, {
    validationError: { target: true },
  });

  if ((await inputErrors).length > 0) {
    return res.status(400).json(inputErrors);
  }

  const { phone, email, password } = customerInputs;

  const salt = await GenerateSalt();
  const userPassword = await GeneratePassword(password, salt);

  const { otp, otp_expiry } = GenerateOtp();

  const existingCustomer = await Customer.findOne({ email: email });

  if (existingCustomer !== null) {
    return res.status(400).json({ message: "Email already exist!" });
  }

  const result = await Customer.create({
    email,
    phone,
    password: userPassword,
    salt,
    otp,
    otp_expiry,
    lat: 0,
    lng: 0,
    verified: false,
    firstName: "",
    lastName: "",
    address: "",
    orders: [],
  });

  if (result) {
    // Send the otp to customer

    await onRequestOTP(otp, phone);

    // Generate the signature
    const signature = await GenerateSignature({
      _id: result._id,
      email: result.email,
      verified: result.verified,
    });

    // Send the result to client
    return res.status(201).json({
      signature,
      email: result.email,
      verified: result.verified,
    });
  }

  return res.status(400).json({ message: "Error While  Signup" });
};

export const CustomerLogin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const customerInputs = plainToClass(CustomerLoginInput, req.body);

  const inputErrors = validate(customerInputs, {
    validationError: { target: true },
  });

  if ((await inputErrors).length > 0) {
    return res.status(400).json(inputErrors);
  }

  const { email, password } = customerInputs;

  const customer = await Customer.findOne({ email: email });

  if (customer) {
    const validation = await ValidatePassword(
      password,
      customer.password,
      customer.salt
    );

    if (validation) {
      const signature = await GenerateSignature({
        _id: customer._id,
        email: customer.email,
        verified: customer.verified,
      });

      return res.status(200).json({
        signature,
        email: customer.email,
        verified: customer.verified,
      });
    }
  }

  return res.json({ message: "Error With Login" });
};

export const CustomerVerify = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { otp } = req.body;
  const customer = req.user;

  if (customer) {
    const profile = await Customer.findById(customer._id);

    if (profile) {
      if (profile.otp === parseInt(otp) && profile.otp_expiry >= new Date()) {
        profile.verified = true;
        profile.otp = undefined;

        const updatedCustomerResponse = await profile.save();

        const signature = await GenerateSignature({
          _id: updatedCustomerResponse._id,
          email: updatedCustomerResponse.email,
          verified: updatedCustomerResponse.verified,
        });

        return res.status(200).json({
          signature,
          email: updatedCustomerResponse.email,
          verified: updatedCustomerResponse.verified,
        });
      }
    }
  }

  return res.status(400).json({ message: "Unable to verify Customer" });
};

export const RequestOtp = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const customer = req.user;

  if (customer) {
    const profile = await Customer.findById(customer._id);

    if (profile) {
      const { otp, otp_expiry } = GenerateOtp();
      profile.otp = otp;
      profile.otp_expiry = otp_expiry;

      await profile.save();

      const Message = `Your otp is: ${otp}`;
      const Subject = `OTP: ${otp}`;

      const sendCode = await onRequestOTP(otp, profile.phone);

      if (!sendCode) {
        return res
          .status(400)
          .json({ message: "Failed to verify your phone number" });
      }

      return res
        .status(200)
        .json({ message: "OTP sent to your registered Mobile Number!" });
    }
  }

  return res.status(400).json({ message: "Error with Requesting OTP" });
};

export const GetCustomerProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const customer = req.user;

  console.log(customer);

  if (customer) {
    const profile = await Customer.findById(customer._id);

    if (profile) {
      return res.status(201).json(profile);
    }
  }
  return res.status(400).json({ message: "Error while Fetching Profile" });
};

export const EditCustomerProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const customer = req.user;

  const customerInputs = plainToClass(EditCustomerProfileInput, req.body);

  const validationError = await validate(customerInputs, {
    validationError: { target: true },
  });

  if (validationError.length > 0) {
    return res.status(400).json(validationError);
  }

  const { firstName, lastName, address } = customerInputs;

  if (customer) {
    const profile = await Customer.findById(customer._id);

    if (profile) {
      profile.firstName = firstName;
      profile.lastName = lastName;
      profile.address = address;
      const result = await profile.save();

      return res.status(201).json(result);
    }
  }
  return res.status(400).json({ message: "Error while Updating Profile" });
};

/* ------------------- Order --------------------- */
export const CreateOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  //Grab Login Customer
  const customer = req.user;

  if (customer) {
    // Create an order ID
    const orderId = `${Math.floor(Math.random() * 89999) + 1000}`;

    const profile = await Customer.findById(customer._id);

    // Grab order item from request
    const cart = <[CartItem]>req.body;

    let cartItems = Array();

    let netAmount = 0.0;

    let vendorId;

    // Calculate order amount
    const foods = await Food.find()
      .where("_id")
      .in(cart.map((item) => item._id))
      .exec();

    foods.map((food) => {
      cart.map(({ _id, unit }) => {
        if (food._id == _id) {
          vendorId = food.vendorId;
          netAmount += food.price * unit;
          cartItems.push({ food, unit });
        }
      });
    });

    if (cartItems) {
      const currentOrder = await Order.create({
        orderId: orderId,
        vendorId: vendorId,
        items: cartItems,
        totalAmount: netAmount,
        orderDate: new Date(),
        orderStatus: "Waiting",
        paymentResponse: "",
      });

      if (currentOrder) {
        profile?.orders.push(currentOrder);

        await profile?.save();

        return res.status(200).json(currentOrder);
      }
    }
  }

  return res.status(400).json({ message: "Error with create order" });
};

export const GetOrders = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const customer = req.user;

  if (customer) {
    const profile = await Customer.findById(customer._id).populate("orders");
    if (profile) {
      return res.status(200).json(profile.orders);
    }
  }

  return res.status(400).json({ message: "Orders not found" });
};

export const GetOrderById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const orderId = req.params.id;

  if (orderId) {
    const order = await Order.findById(orderId).populate("items.food");

    if (order) {
      return res.status(200).json(order);
    }
  }

  return res.status(400).json({ message: "Order not found" });
};
/* ============================= Cart ================= */
export const AddToCart = async (req: Request, res: Response) => {
  const customer = req.user;

  if (customer) {
    const profile = await Customer.findById(customer._id);
    let cartItems = Array();

    const { _id, unit } = <CartItem>req.body;

    const food = await Food.findById(_id);

    if (food) {
      if (profile != null) {
        cartItems = profile.cart;

        if (cartItems.length > 0) {
          // check and update
          let existFoodItems = cartItems.filter(
            (item) => item.food._id.toString() === _id
          );
          if (existFoodItems.length > 0) {
            const index = cartItems.indexOf(existFoodItems[0]);

            if (unit > 0) {
              cartItems[index] = { food, unit };
            } else {
              cartItems.splice(index, 1);
            }
          } else {
            cartItems.push({ food, unit });
          }
        } else {
          // add new Item
          cartItems.push({ food, unit });
        }

        if (cartItems) {
          profile.cart = cartItems as any;
          const cartResult = await profile.save();
          return res.status(200).json(cartResult.cart);
        }
      }
    }
  }

  return res.status(400).json({ message: "Unable to add to cart" });
};

export const GetCart = async (req: Request, res: Response) => {
  const customer = req.user;

  if (customer) {
    const profile = await Customer.findById(customer._id).populate("cart.food");

    if (profile) {
      return res.status(200).json(profile.cart);
    }
  }

  return res.status(400).json({ message: "Cart is Empty!" });
};

export const DeleteCart = async (req: Request, res: Response) => {
  const customer = req.user;

  if (customer) {
    const profile = await Customer.findById(customer._id)
      .populate("cart.food")
      .exec();

    if (profile != null) {
      profile.cart = [] as any;
      const cartResult = await profile.save();

      return res.status(200).json(cartResult);
    }
  }

  return res.status(400).json({ message: "Cart is Already Empty!" });
};

/* ------------------- Delivery Notification --------------------- */
