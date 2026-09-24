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