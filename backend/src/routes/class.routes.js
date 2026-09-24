import express from "express";
import { getClasses } from "../controllers/class.controller.js";
import { verificarToken } from "../middlewares/auth.middleware.js";

const router = express.Router();


router.get("/", verificarToken, getClasses);

export default router;