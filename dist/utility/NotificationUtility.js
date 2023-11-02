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
exports.onRequestOTP = exports.GenerateOtp = void 0;
const config_1 = require("../config");
const GenerateOtp = () => {
    const otp = Math.floor(100000 + Math.random() * 900000);
    let otp_expiry = new Date();
    otp_expiry.setTime(new Date().getTime() + 30 * 60 * 1000); // 30 minutes
    return { otp, otp_expiry };
};
exports.GenerateOtp = GenerateOtp;
const onRequestOTP = (otp, toPhoneNumber) => __awaiter(void 0, void 0, void 0, function* () {
    const accountSid = config_1.TWILIO_ACCOUNT_SID;
    const authToken = config_1.TWILIO_AUTH_TOKEN;
    const client = require("twilio")(accountSid, authToken);
    const response = yield client.messages.create({
        body: `Hi, your OTP is ${otp}`,
        from: config_1.TWILIO_PHONE_NUMBER,
        to: toPhoneNumber,
    });
    return response;
});
exports.onRequestOTP = onRequestOTP;
//# sourceMappingURL=NotificationUtility.js.map