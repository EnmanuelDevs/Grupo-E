import Schedule from "../models/schedule.model.js";
import Class from "../models/class.model.js";
import { DateTime } from "luxon";

export const asignarHorario = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, time } = req.body;

    if (!date || !time) {
      return res.status(400).json({
        success: false,
        error: "La fecha y la hora son obligatorias para asignar un horario.",
      });
    }

    const zone = process.env.GYM_TIMEZONE || "America/La_Paz";
    const startsAt = DateTime.fromISO(`${date}T${time}`, { zone });

    if (!startsAt.isValid || startsAt.toMillis() <= Date.now()) {
    return res.status(400).json({
    success: false,
    error: "Indica una fecha y hora futuras válidas.",
    });
    }

    const existeClase = await Class.findById(id);
    if (!existeClase) {
      return res.status(404).json({
        success: false,
        error: "La clase indicada no existe en el sistema.",
      });
    }

    const nuevoHorario = new Schedule({
      classId: id,
      date,
      time,
      startsAt: startsAt.toJSDate(),
      availableSpots: existeClase.capacity,
    });

    await nuevoHorario.save();

    return res.status(201).json({
      success: true,
      message: "Horario asignado exitosamente a la clase.",
      data: nuevoHorario,
    });
  } catch (error) {
    console.error("Error al asignar horario:", error);
    return res.status(500).json({
      success: false,
      error: "Error interno del servidor al procesar el horario.",
    });
  }
};
