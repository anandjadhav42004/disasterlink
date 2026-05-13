import type { Alert, SOSRequest, User, Volunteer } from "@prisma/client";
import { firebaseMessaging } from "../config/firebase.js";
import { twilioClient, twilioPhone } from "../config/twilio.js";
import { logger } from "../utils/logger.js";

type VolunteerWithUser = Volunteer & { user: User };

export async function notifyVolunteers(sos: SOSRequest, volunteers: VolunteerWithUser[]) {
  await Promise.all(
    volunteers.map(async (volunteer) => {
      const title = `New ${sos.severity.toLowerCase()} SOS nearby`;
      const body = `${sos.type} emergency reported near your location.`;
      await sendPush(volunteer.user.fcmToken, title, body, { sosId: sos.id });
      if (!volunteer.user.fcmToken) {
        await sendSms(volunteer.user.phone, `${title}: ${body}`);
      }
    })
  );
}

export async function broadcastAlert(alert: Alert, users: Pick<User, "fcmToken" | "phone">[]) {
  await Promise.all(
    users.map(async (user) => {
      await sendPush(user.fcmToken, alert.title, alert.message, { alertId: alert.id });
      if (!user.fcmToken) {
        await sendSms(user.phone, `${alert.title}: ${alert.message}`);
      }
    })
  );
}

async function sendPush(token: string | null | undefined, title: string, body: string, data: Record<string, string>) {
  if (!token || !firebaseMessaging) return;
  try {
    await firebaseMessaging.send({ token, notification: { title, body }, data });
  } catch (error) {
    logger.warn("FCM push failed", { error });
  }
}

async function sendSms(to: string, message: string) {
  if (!twilioClient || !twilioPhone) return;
  try {
    await twilioClient.messages.create({ from: twilioPhone, to, body: message });
  } catch (error) {
    logger.warn("Twilio SMS failed", { error });
  }
}
