import { serve } from "https://deno.land/std@0.192.0/http/server.ts";

import { EventPayload } from "./src/types/gh-webhook.ts";
import { convertEventPayloadToCardParam } from "./src/gh-event/dispatcher.ts";
import { paintCard } from "./src/lark-agent/build-card.ts";
import { sendLarkCardMsg } from "./src/lark-agent/agent.ts";

serve(handler, { port: 8000 });

async function handler(req: Request): Promise<Response> {
  if (req.url.includes("/api/hello")) {
    return new Response("Hello from Github Notifyer!", { status: 200 });
  }

  const githubWebhookEvent = req.headers.get("X-Github-Event");
  if (githubWebhookEvent !== undefined) {
    const eventPayload: EventPayload = {
      ...(await req.json()),
      githubWebhookEvent: githubWebhookEvent,
    };

    const cardParam = convertEventPayloadToCardParam(eventPayload);

    const larkCard = paintCard(cardParam.label, cardParam);

    const messageID = await sendLarkCardMsg(larkCard);

    return new Response(
      "Github Webhook Event: " + eventPayload.githubWebhookEvent +
        "with Message ID: " + messageID,
      {
        status: 200,
      },
    );
  }

  return new Response(
    "Happy to see you, lean more about me at https://github.com/Wan-Hao/Github-Notify",
    { status: 200 },
  );
}

Deno.cron("un name", "* * * * *", async () => {
  console.log("--------- Deno Cron Job Start ---------");
  await new Promise((resolve) => setTimeout(resolve, 30 * 1000));
  console.log("--------- Deno Cron Job End ---------");
});
