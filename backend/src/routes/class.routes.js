import express from "express";

import {
  getClasses,
  createClass,
  updateClass,
  updateCapacity,
  reserveClass,
  cancelReservation,
  deleteClass,
  getOccupancyReport,
  getDemandReport,
} from "../controllers/class.controller.js";

import { asignarHorario } from "../controllers/schedule.controller.js";

import {
  verificarToken,
  verificarAdmin,
} from "../middlewares/auth.middleware.js";

import { verificarRol } from "../middlewares/role.middleware.js";

const router = express.Router();

router.get("/", verificarToken, getClasses);

router.get(
  "/report/occupancy",
  verificarToken,
  verificarAdmin,
  getOccupancyReport,
);

router.get("/report/demand", verificarToken, verificarAdmin, getDemandReport);

router.post("/", verificarToken, verificarAdmin, createClass);

router.post("/:id/schedule", verificarToken, verificarAdmin, asignarHorario);
router.patch("/:id", verificarToken, verificarAdmin, updateClass);

router.patch("/:id/capacity", verificarToken, verificarAdmin, updateCapacity);

router.delete("/:id", verificarToken, verificarAdmin, deleteClass);

router.post(
  "/:id/reserve",
  verificarToken,
  verificarRol(["member"]),
  reserveClass,
);

router.delete(
  "/:id/reserve",
  verificarToken,
  verificarRol(["member"]),
  cancelReservation,
);

export default router;
