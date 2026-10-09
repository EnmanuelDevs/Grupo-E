import "dotenv/config";
import { sendEmail } from "../services/email.service.js";

const destinatario = process.argv[2];

if (!destinatario) {
  console.error("Indica una dirección de correo para la prueba");
  process.exit(1);
}

try {
  const messageId = await sendEmail({
    to: destinatario,
    subject: "Prueba de correo - Dynamic Zone",
    text: "El servicio de correo de Dynamic Zone funciona correctamente.",
  });

  console.log("Correo aceptado por el servidor SMTP. ID:", messageId);
} catch (error) {
  console.error("No se pudo enviar el correo:", error.message);
  process.exitCode = 1;
}