"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PORT = exports.TWILIO_PHONE_NUMBER = exports.TWILIO_AUTH_TOKEN = exports.TWILIO_ACCOUNT_SID = exports.APP_SECRET = exports.MONGO_URI = void 0;
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
exports.MONGO_URI = process.env.MONGO_URI;
exports.APP_SECRET = process.env.JWT_TOKEN_SECRET;
exports.TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
exports.TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
exports.TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;
exports.PORT = process.env.PORT || 8000;
//# sourceMappingURL=index.js.map