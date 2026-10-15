import { DateTime } from "luxon";
import Schedule from "../models/schedule.model.js";
import User from "../models/User.js";
import NotificationLog from "../models/notificationLog.model.js";
import { sendEmail } from "../services/email.service.js";
import Class from "../models/class.model.js";

export async function sendTomorrowClasses({ onlyEmail } = {}) {
  const zone = process.env.GYM_TIMEZONE || "America/La_Paz";
  const tomorrow = DateTime.now().setZone(zone).plus({ days: 1 });
  const start = tomorrow.startOf("day");
  const end = start.plus({ days: 1 });
  const targetDate = tomorrow.toISODate();

  const schedules = await Schedule.find({
    startsAt: {
      $gte: start.toJSDate(),
      $lt: end.toJSDate(),
    },
    availableSpots: { $gt: 0 },
  })
    .sort({ startsAt: 1 })
    .populate({
      path: "classId",
      model: Class,
      select: "title instructor",
      populate: {
        path: "instructor",
        select: "name lastName",
      },
    });

  const classLines = schedules
    .filter((schedule) => schedule.classId)
    .map((schedule) => {
      const time = DateTime.fromJSDate(schedule.startsAt)
        .setZone(zone)
        .toFormat("HH:mm");

      const instructor = schedule.classId.instructor;
      const instructorName = instructor
        ? `${instructor.name} ${instructor.lastName}`
        : "Por confirmar";

      return (
        `- ${schedule.classId.title}, ${time}, ` +
        `instructor: ${instructorName}, ` +
        `cupos disponibles: ${schedule.availableSpots}`
      );
    });

  const members = await User.find({
  role: "member",
  active: true,
  email: onlyEmail
    ? onlyEmail.trim().toLowerCase()
    : { $exists: true, $ne: "" },
}).select("name email");

  for (const member of members) {
    const key = `daily-classes:${targetDate}:${member.id}`;
    const alreadySent = await NotificationLog.exists({ key });
    if (alreadySent) continue;

    const classList = classLines.length
      ? classLines.join("\n")
      : "No hay clases con cupos disponibles para mañana.";

    try {
      await sendEmail({
        to: member.email,
        subject: `Clases disponibles para mañana, ${targetDate}`,
        text:
          `Hola ${member.name}, estas son las clases disponibles ` +
          `para mañana:\n\n${classList}\n\n` +
          `Entra a Dynamic Zone si deseas hacer una reserva.`,
      });

      await NotificationLog.create({
        key,
        type: "daily-classes",
        userId: member._id,
      });

      console.log(`Resumen diario enviado a ${member.email}`);
    } catch (error) {
      console.error(
        `Falló el resumen diario para ${member.email}:`,
        error.message,
      );
    }
  }
}