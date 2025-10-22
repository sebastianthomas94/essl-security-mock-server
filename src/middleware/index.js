import express from "express";
import cors from "cors";

const setupMiddleware = (app) => {
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(
    express.text({ type: ["text/plain", "text/html", "*/*"], limit: "10mb" })
  );
};

export { setupMiddleware };