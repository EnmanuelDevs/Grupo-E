import express from "express";

import {
  getClasses,
  createClass,
  updateCapacity,
} from "../controllers/class.controller.js";

import { asignarHorario } from "../controllers/schedule.controller.js";

import {
  verificarToken,
  verificarAdmin,
} from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", verificarToken, getClasses);

router.post("/", verificarToken, verificarAdmin, createClass);

router.post(
  "/:id/schedule",
  verificarToken,
  verificarAdmin,
  asignarHorario
);

router.patch(
  "/:id/capacity",
  verificarToken,
  verificarAdmin,
  updateCapacity
);

export default router;
