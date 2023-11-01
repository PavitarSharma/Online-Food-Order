import { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN } from "../config";

export const GenerateOtp = () => {
  const otp = Math.floor(100000 + Math.random() * 900000);

  let otp_expiry = new Date();

  otp_expiry.setTime(new Date().getTime() + 3 * 60 * 1000); // 3 minutes

  return { otp, otp_expiry };
};

export const onRequestOTP = async (otp: number, toPhoneNumber: string) => {
  const accountSid = TWILIO_ACCOUNT_SID;
  const authToken = TWILIO_AUTH_TOKEN;

  const client = require("twilio")(accountSid, authToken);

  const response = await client.messages.create({
    body: `Hi, your OTP is ${otp}`,
    from: "+15017122661",
    to: toPhoneNumber,
  });

  return response;
};
