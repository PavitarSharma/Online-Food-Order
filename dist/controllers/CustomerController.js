"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteCart = exports.GetCart = exports.AddToCart = exports.GetOrderById = exports.GetOrders = exports.CreateOrder = exports.EditCustomerProfile = exports.GetCustomerProfile = exports.RequestOtp = exports.CustomerVerify = exports.CustomerLogin = exports.CustomerSignUp = void 0;
const class_transformer_1 = require("class-transformer");
const Customer_dto_1 = require("../dto/Customer.dto");
const class_validator_1 = require("class-validator");
const utility_1 = require("../utility");
const models_1 = require("../models");
const CustomerSignUp = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const customerInputs = (0, class_transformer_1.plainToClass)(Customer_dto_1.CreateCustomerInput, req.body);
    const inputErrors = (0, class_validator_1.validate)(customerInputs, {
        validationError: { target: true },
    });
    if ((yield inputErrors).length > 0) {
        return res.status(400).json(inputErrors);
    }
    const { phone, email, password } = customerInputs;
    const salt = yield (0, utility_1.GenerateSalt)();
    const userPassword = yield (0, utility_1.GeneratePassword)(password, salt);
    const { otp, otp_expiry } = (0, utility_1.GenerateOtp)();
    const existingCustomer = yield models_1.Customer.findOne({ email: email });
    if (existingCustomer !== null) {
        return res.status(400).json({ message: "Email already exist!" });
    }
    const result = yield models_1.Customer.create({
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
        yield (0, utility_1.onRequestOTP)(otp, phone);
        // Generate the signature
        const signature = yield (0, utility_1.GenerateSignature)({
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
});
exports.CustomerSignUp = CustomerSignUp;
const CustomerLogin = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const customerInputs = (0, class_transformer_1.plainToClass)(Customer_dto_1.CustomerLoginInput, req.body);
    const inputErrors = (0, class_validator_1.validate)(customerInputs, {
        validationError: { target: true },
    });
    if ((yield inputErrors).length > 0) {
        return res.status(400).json(inputErrors);
    }
    const { email, password } = customerInputs;
    const customer = yield models_1.Customer.findOne({ email: email });
    if (customer) {
        const validation = yield (0, utility_1.ValidatePassword)(password, customer.password, customer.salt);
        if (validation) {
            const signature = yield (0, utility_1.GenerateSignature)({
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
});
exports.CustomerLogin = CustomerLogin;
const CustomerVerify = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { otp } = req.body;
    const customer = req.user;
    if (customer) {
        const profile = yield models_1.Customer.findById(customer._id);
        if (profile) {
            if (profile.otp === parseInt(otp) && profile.otp_expiry >= new Date()) {
                profile.verified = true;
                profile.otp = undefined;
                const updatedCustomerResponse = yield profile.save();
                const signature = yield (0, utility_1.GenerateSignature)({
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
});
exports.CustomerVerify = CustomerVerify;
const RequestOtp = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const customer = req.user;
    if (customer) {
        const profile = yield models_1.Customer.findById(customer._id);
        if (profile) {
            const { otp, otp_expiry } = (0, utility_1.GenerateOtp)();
            profile.otp = otp;
            profile.otp_expiry = otp_expiry;
            yield profile.save();
            const Message = `Your otp is: ${otp}`;
            const Subject = `OTP: ${otp}`;
            const sendCode = yield (0, utility_1.onRequestOTP)(otp, profile.phone);
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
});
exports.RequestOtp = RequestOtp;
const GetCustomerProfile = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const customer = req.user;
    console.log(customer);
    if (customer) {
        const profile = yield models_1.Customer.findById(customer._id);
        if (profile) {
            return res.status(201).json(profile);
        }
    }
    return res.status(400).json({ message: "Error while Fetching Profile" });
});
exports.GetCustomerProfile = GetCustomerProfile;
const EditCustomerProfile = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const customer = req.user;
    const customerInputs = (0, class_transformer_1.plainToClass)(Customer_dto_1.EditCustomerProfileInput, req.body);
    const validationError = yield (0, class_validator_1.validate)(customerInputs, {
        validationError: { target: true },
    });
    if (validationError.length > 0) {
        return res.status(400).json(validationError);
    }
    const { firstName, lastName, address } = customerInputs;
    if (customer) {
        const profile = yield models_1.Customer.findById(customer._id);
        if (profile) {
            profile.firstName = firstName;
            profile.lastName = lastName;
            profile.address = address;
            const result = yield profile.save();
            return res.status(201).json(result);
        }
    }
    return res.status(400).json({ message: "Error while Updating Profile" });
});
exports.EditCustomerProfile = EditCustomerProfile;
/* ------------------- Order --------------------- */
const CreateOrder = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    //Grab Login Customer
    const customer = req.user;
    if (customer) {
        // Create an order ID
        const orderId = `${Math.floor(Math.random() * 89999) + 1000}`;
        const profile = yield models_1.Customer.findById(customer._id);
        // Grab order item from request
        const cart = req.body;
        let cartItems = Array();
        let netAmount = 0.0;
        let vendorId;
        // Calculate order amount
        const foods = yield models_1.Food.find()
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
            const currentOrder = yield models_1.Order.create({
                orderId: orderId,
                vendorId: vendorId,
                items: cartItems,
                totalAmount: netAmount,
                orderDate: new Date(),
                orderStatus: "Waiting",
                paymentResponse: "",
            });
            if (currentOrder) {
                profile === null || profile === void 0 ? void 0 : profile.orders.push(currentOrder);
                yield (profile === null || profile === void 0 ? void 0 : profile.save());
                return res.status(200).json(currentOrder);
            }
        }
    }
    return res.status(400).json({ message: "Error with create order" });
});
exports.CreateOrder = CreateOrder;
const GetOrders = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const customer = req.user;
    if (customer) {
        const profile = yield models_1.Customer.findById(customer._id).populate("orders");
        if (profile) {
            return res.status(200).json(profile.orders);
        }
    }
    return res.status(400).json({ message: "Orders not found" });
});
exports.GetOrders = GetOrders;
const GetOrderById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const orderId = req.params.id;
    if (orderId) {
        const order = yield models_1.Order.findById(orderId).populate("items.food");
        if (order) {
            return res.status(200).json(order);
        }
    }
    return res.status(400).json({ message: "Order not found" });
});
exports.GetOrderById = GetOrderById;
/* ============================= Cart ================= */
const AddToCart = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const customer = req.user;
    if (customer) {
        const profile = yield models_1.Customer.findById(customer._id);
        let cartItems = Array();
        const { _id, unit } = req.body;
        const food = yield models_1.Food.findById(_id);
        if (food) {
            if (profile != null) {
                cartItems = profile.cart;
                if (cartItems.length > 0) {
                    // check and update
                    let existFoodItems = cartItems.filter((item) => item.food._id.toString() === _id);
                    if (existFoodItems.length > 0) {
                        const index = cartItems.indexOf(existFoodItems[0]);
                        if (unit > 0) {
                            cartItems[index] = { food, unit };
                        }
                        else {
                            cartItems.splice(index, 1);
                        }
                    }
                    else {
                        cartItems.push({ food, unit });
                    }
                }
                else {
                    // add new Item
                    cartItems.push({ food, unit });
                }
                if (cartItems) {
                    profile.cart = cartItems;
                    const cartResult = yield profile.save();
                    return res.status(200).json(cartResult.cart);
                }
            }
        }
    }
    return res.status(400).json({ message: "Unable to add to cart" });
});
exports.AddToCart = AddToCart;
const GetCart = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const customer = req.user;
    if (customer) {
        const profile = yield models_1.Customer.findById(customer._id).populate("cart.food");
        if (profile) {
            return res.status(200).json(profile.cart);
        }
    }
    return res.status(400).json({ message: "Cart is Empty!" });
});
exports.GetCart = GetCart;
const DeleteCart = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const customer = req.user;
    if (customer) {
        const profile = yield models_1.Customer.findById(customer._id)
            .populate("cart.food")
            .exec();
        if (profile != null) {
            profile.cart = [];
            const cartResult = yield profile.save();
            return res.status(200).json(cartResult);
        }
    }
    return res.status(400).json({ message: "Cart is Already Empty!" });
});
exports.DeleteCart = DeleteCart;
/* ------------------- Delivery Notification --------------------- */
//# sourceMappingURL=CustomerController.js.map