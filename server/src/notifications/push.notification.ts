import { firebaseMessaging } from "../config/firebase.js";

export async function sendPushNotification(token: string, title: string, body: string, data: Record<string, string> = {}) {
  if (!firebaseMessaging) return;
  await firebaseMessaging.send({ token, notification: { title, body }, data });
}
