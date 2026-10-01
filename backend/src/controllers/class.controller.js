import Class from "../models/class.model.js";
import Schedule from "../models/schedule.model.js";
import User from "../models/User.js";

export const getClasses = async (req, res) => {
  try {
    const classes = await Class.find()
      .populate("instructor", "name lastName")
      .lean();

    const classesWithSchedules = await Promise.all(
      classes.map(async (gymClass) => {
        const schedules = await Schedule.find({ classId: gymClass._id }).select(
          "date time -_id",
        );

        const instructorFullName = gymClass.instructor
          ? `${gymClass.instructor.name} ${gymClass.instructor.lastName}`
          : "Instructor no asignado";

        return {
          ...gymClass,
          instructor: instructorFullName,
          schedules: schedules,
        };
      }),
    );

    res.status(200).json({
      success: true,
      data: classesWithSchedules,
    });
  } catch (error) {
    console.error("Error al obtener las clases:", error);
    res.status(500).json({
      success: false,
      error: "Error interno del servidor al obtener las clases",
    });
  }
};

export const createClass = async (req, res) => {
  try {
    const { title, description, instructor, capacity } = req.body;

    const instructorUser = await User.findById(instructor);
    if (!instructorUser) {
      return res.status(404).json({
        success: false,
        error: "El usuario seleccionado como instructor no existe.",
      });
    }

    if (instructorUser.role !== "instructor") {
      return res.status(403).json({
        success: false,
        error:
          "El usuario seleccionado no tiene los permisos (rol) de instructor.",
      });
    }

    if (instructorUser.isActive === false) {
      return res.status(400).json({
        success: false,
        error:
          "El instructor seleccionado se encuentra inactivo y no puede ser asignado.",
      });
    }

    const newClass = await Class.create({
      title,
      description,
      instructor,
      capacity,
      availableSpots: capacity,
    });

    res.status(201).json({
      success: true,
      data: newClass,
    });
  } catch (error) {
    console.log("Error creando la clase:", error);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        error: "La capacidad debe ser un número mayor o igual a 0.",
      });
    }

    return res.status(500).json({
      success: false,
      error: "Error del servidor al crear la clase",
    });
  }
};

export const updateCapacity = async (req, res) => {
  try {
    const { id } = req.params;
    const { capacity } = req.body;

    const newCapacity = Number(capacity);

    if (!Number.isInteger(newCapacity) || newCapacity <= 0) {
      return res.status(400).json({
        success: false,
        error: "La capacidad debe ser un número entero mayor que cero.",
      });
    }

    const gymClass = await Class.findById(id);

    if (!gymClass) {
      return res.status(404).json({
        success: false,
        error: "Clase no encontrada.",
      });
    }

    gymClass.capacity = newCapacity;
    gymClass.availableSpots = newCapacity;

    await gymClass.save();

    return res.status(200).json({
      success: true,
      data: gymClass,
    });
  } catch (error) {
    console.error("Error actualizando capacidad:", error);

    return res.status(500).json({
      success: false,
      error: "Error del servidor al actualizar la capacidad.",
    });
  }
};

export const updateClass = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description } = req.body;

    if (title === undefined && description === undefined) {
      return res.status(400).json({
        success: false,
        error: "Debes proporcionar al menos un campo para actualizar.",
      });
    }

    const gymClass = await Class.findById(id);

    if (!gymClass) {
      return res.status(404).json({
        success: false,
        error: "Clase no encontrada.",
      });
    }

    if (title !== undefined) {
      const cleanTitle = title.trim();

      if (!cleanTitle) {
        return res.status(400).json({
          success: false,
          error: "El nombre de la clase no puede estar vacío.",
        });
      }

      gymClass.title = cleanTitle;
    }

    if (description !== undefined) {
      const cleanDescription = description.trim();

      if (!cleanDescription) {
        return res.status(400).json({
          success: false,
          error: "La descripción no puede estar vacía.",
        });
      }

      gymClass.description = cleanDescription;
    }

    await gymClass.save();

    return res.status(200).json({
      success: true,
      message: "Clase actualizada correctamente.",
      data: gymClass,
    });
  } catch (error) {
    console.error("Error actualizando clase:", error);

    return res.status(500).json({
      success: false,
      error: "Error del servidor al actualizar la clase.",
    });
  }
};
