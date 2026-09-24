import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";
import classRoutes from "./routes/class.routes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.json({ message: "API del sistema de reservas del gimnasio funcionando" });
});

app.use("/api/auth", authRoutes);
app.use("/api/classes", classRoutes);

export default app;