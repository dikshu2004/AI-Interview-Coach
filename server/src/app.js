import express from "express";
import cors from "cors";
import authRoutes from "./routes/authroute.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);

app.get("/api/health", (req, res) => {
  res.json({ message: "AI Interview Coach API is running" });
});

export default app;