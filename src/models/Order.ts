import mongoose, { Schema, Document } from "mongoose";

export interface OrderDoc extends Document {
  orderId: string;
  vendorId: string;
  items: [any]; // {food, unit}
  totalAmount: number;
  paidThrough: string;
  orderDate: Date;
  orderStatus: string; // To determine the current status // waiting // failed // ACCEPT // REJECT // UNDER-PROCESS // READY
  paymentResponse: string;
  remarks: string;
  deliveryId: string;
  appliedOffers: boolean;
  offerId: string;
  readyTime: number; // Max 60 minutes
}

const OrderSchema = new Schema(
  {
    orderId: { type: String, require: true },
    vendorId: { type: String, require: true },
    items: [
      {
        food: { type: Schema.Types.ObjectId, ref: "food", require: true },
        unit: { type: Number, require: true },
      },
    ],
    totalAmount: { type: Number, require: true },
    paidThrough: { type: String },
    orderDate: { type: Date },
    orderStatus: { type: String },
    paymentResponse: { type: String },
    remarks: { type: String },
    deliveryId: { type: String },
    offerId: { type: String },
    appliedOffers: { type: Boolean },
    readyTime: { type: Number },
  },
  {
    toJSON: {
      transform(doc, ret) {
        delete ret.__v;
        delete ret.createdAt;
        delete ret.updatedAt;
      },
    },
    timestamps: true,
  }
);

const Order = mongoose.model<OrderDoc>("order", OrderSchema);

export { Order };
