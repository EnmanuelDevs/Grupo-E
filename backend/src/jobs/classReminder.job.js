import { DateTime } from "luxon";
import Schedule from "../models/schedule.model.js";
import { sendEmail } from "../services/email.service.js";
import NotificationLog from "../models/notificationLog.model.js";

export async function sendClassReminders() {
  const minutes = Number(process.env.REMINDER_MINUTES || 60);

  if (!Number.isInteger(minutes) || minutes <= 0) {
    throw new Error("REMINDER_MINUTES debe ser un número entero positivo");
  }

  const now = new Date();
  const limit = new Date(now.getTime() + minutes * 60 * 1000);
  const zone = process.env.GYM_TIMEZONE || "America/La_Paz";

  const schedules = await Schedule.find({
    startsAt: { $gt: now, $lte: limit },
  })
    .populate("classId", "title")
    .populate({
      path: "participants",
      select: "name email role active",
      match: { role: "member", active: true },
    });

  for (const schedule of schedules) {
    if (!schedule.classId) continue;

    const classDate = DateTime.fromJSDate(schedule.startsAt)
      .setZone(zone)
      .setLocale("es")
      .toFormat("cccc d 'de' LLLL 'a las' HH:mm");

    for (const member of schedule.participants || []) {
      if (!member?.email) continue;

    const key = `class-reminder:${schedule.id}:${member.id}`;

    const alreadySent = await NotificationLog.exists({ key });
    if (alreadySent) continue;
      try {
        await sendEmail({
          to: member.email,
          subject: `Recordatorio de tu clase: ${schedule.classId.title}`,
          text:
            `Hola ${member.name}, te recordamos que tienes reservada ` +
            `la clase ${schedule.classId.title} para el ${classDate}.`,
        });

        await NotificationLog.create({
            key,
            type: "class-reminder",
            userId: member._id,
        });

        console.log(`Recordatorio enviado para horario ${schedule.id}`);
      } catch (error) {
        console.error(
          `Falló el recordatorio del horario ${schedule.id}:`,
          error.message,
        );
      }
    }
  }
}