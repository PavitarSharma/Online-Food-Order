import express, { Application } from "express";

import { AdminRoute, ShoppingRoute, VendorRoute } from "../routes";
import path from "path";

export default async (app: Application) => {
  app.use("/images", express.static(path.join(__dirname, "images")));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.get("/", (req, res) => {
    res.json({
      success: true,
      message: "Hello from the food order backend",
    });
  });

  app.use("/admin", AdminRoute);
  app.use("/vendor", VendorRoute);
  app.use(ShoppingRoute);

  return app;
};
