import { twilioClient, twilioPhone } from "../config/twilio.js";

export async function sendSmsNotification(to: string, body: string) {
  if (!twilioClient || !twilioPhone) return;
  await twilioClient.messages.create({ from: twilioPhone, to, body });
}
