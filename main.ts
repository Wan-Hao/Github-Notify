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

  if (req.url.includes("/api/info")) {
    return new Response(
      "Api Info: \n" +
        "1. /api/hello: return hello message\n" +
        "2. /api/info: return api info\n" +
        {
          status: 200,
        },
    );
  }

  const githubWebhookEvent = req.headers.get("X-Github-Event");
  if (githubWebhookEvent !== undefined) {
    const eventPayload: EventPayload = {
      ...(await req.json()),
      githubWebhookEvent: githubWebhookEvent,
    };

    const cardParam = convertEventPayloadToCardParam(eventPayload);

    if (cardParam.label === "default_event_card") {
      return new Response();
    }

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
