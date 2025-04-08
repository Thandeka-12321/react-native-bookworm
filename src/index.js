import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import job from "./lib/cron.js"; // Import the cron job

import authRoutes from "./routes/authRoutes.js";
import { connectDB } from "./lib/db.js";

import bookRoutes from "./routes/bookRoutes.js";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
job.start(); // Start the cron job
app.use(express.json());
app.use(cors());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/books", bookRoutes);

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  connectDB();
});
