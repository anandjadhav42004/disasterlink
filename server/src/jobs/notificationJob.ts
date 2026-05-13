export async function enqueueNotificationJob(payload: unknown) {
  return { queued: false, payload };
}
