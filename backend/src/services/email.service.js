import nodemailer from "nodemailer";

let transporter;

function getTransporter() {
  const {
    SMTP_HOST,
    SMTP_PORT,
    SMTP_USER,
    SMTP_PASS,
    MAIL_FROM,
  } = process.env;

  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS || !MAIL_FROM) {
    throw new Error("Falta configurar el correo SMTP en backend/.env");
  }

  const port = Number(SMTP_PORT);

  if (!Number.isInteger(port)) {
    throw new Error("SMTP_PORT debe ser un número");
  }

  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port,
      secure: port === 465,
      requireTLS: port !== 465,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    });
  }

  return transporter;
}

export async function sendEmail({ to, subject, text, html }) {
  if (!to || !subject || (!text && !html)) {
    throw new Error("El correo necesita destinatario, asunto y contenido");
  }

  const result = await getTransporter().sendMail({
    from: {
      name: "Dynamic Zone",
      address: process.env.MAIL_FROM,
    },
    to,
    subject,
    text,
    html,
  });

  return result.messageId;
}