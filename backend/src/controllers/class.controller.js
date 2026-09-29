import Class from "../models/class.model.js";

export const getClasses = async (req, res) => {
    try {
        const classes = await Class.find();
        res.status(200).json({
            success: true,
            data: classes
        });
    } catch (error) {
        console.error("Error al obtener las clases:", error);
        res.status(500).json({
            success: false,
            error: "Error interno del servidor al obtener las clases"
        });
    }
};


export const createClass = async (req, res) => {
    try {
        const {
            title,
            description,
            instructor,
            capacity,
        } = req.body;

        const newClass = await Class.create({
            title,
            description,
            instructor,
            capacity,
            availableSpots: capacity

        });

        res.status(201).json({
            success: true,
            data: newClass
        });

    } catch (error) {
        console.log("Error creando la clase:", error);

        if (error.name === "ValidationError") {
            return res.status(400).json({
                success: false,
                error: "La capacidad debe ser un número mayor o igual a 0."
            });
        }

        return res.status(500).json({
            success: false,
            error: "Error del servidor al crear la clase"
        });
    }
};

export const updateCapacity = async (req, res) => {
    try {
        const { id } = req.params;
        const { capacity } = req.body;

        const newCapacity = Number(capacity);

        // Validar capacidad
        if (!Number.isInteger(newCapacity) || newCapacity <= 0) {
            return res.status(400).json({
                success: false,
                error: "La capacidad debe ser un número entero mayor que cero."
            });
        }

        // Buscar la clase
        const gymClass = await Class.findById(id);

        if (!gymClass) {
            return res.status(404).json({
                success: false,
                error: "Clase no encontrada."
            });
        }

        // Por ahora las reservas todavía no están implementadas.
        // Actualizamos capacidad y cupos disponibles.
        gymClass.capacity = newCapacity;
        gymClass.availableSpots = newCapacity;

        await gymClass.save();

        return res.status(200).json({
            success: true,
            data: gymClass
        });

    } catch (error) {
        console.error("Error actualizando capacidad:", error);

        return res.status(500).json({
            success: false,
            error: "Error del servidor al actualizar la capacidad."
        });
    }
};