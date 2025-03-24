export const LarkEventStore = await Deno.openKv();

export async function saveLarkEvent(eventID: string, eventType: string) {
  await LarkEventStore.set([eventID], {
    eventType,
  });
}

export async function getLarkEvent(eventID: string) {
  return await LarkEventStore.get([eventID]);
}

export async function deleteLarkEvent(eventID: string) {
  await LarkEventStore.delete([eventID]);
}
