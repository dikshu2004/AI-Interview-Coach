import express from "express";
import cors from "cors";
import authRoutes from "./routes/authroute.js";
import interviewRoutes from "./routes/interviewRoute.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/interview", interviewRoutes);

app.get("/api/health", (req, res) => {
  res.json({ message: "AI Interview Coach API is running" });
});

app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({
      message: "Invalid JSON payload. Please send valid JSON data.",
    });
  }

  next(err);
});

export default app;