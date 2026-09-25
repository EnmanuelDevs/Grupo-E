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

        res.status(500).json({
            success: false,
            error: "Error del servidor al crear la clase"
        });
    }
};