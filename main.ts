import { serve } from "https://deno.land/std@0.192.0/http/server.ts";

import { EventPayload } from "./src/types/gh-webhook.ts";
import { convertEventPayloadToCardParam } from "./src/gh-event/dispatcher.ts";
import { paintCard } from "./src/lark-agent/build-card.ts";
import { LarkAgent } from "./src/lark-agent/agent.ts";
import { remindPRAuthor } from "./src/cron/patroller.ts";
import { convertCronCheckerCaseToCardParam } from "./src/cron/dispatcher.ts";
import { CronCheckerCardParam } from "./src/types/lark-card.ts";
import { handleIssueCreateRequest } from "./src/gh-agent/issue-sender.ts";

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

  const clone = req.clone();
  const body = await clone.json();
  if (body?.header?.event_type === "im.message.receive_v1") {
    const message = body.event.message.content;
    if (
      message &&
      message.toLowerCase().includes("@bot") &&
      message.toLowerCase().includes("issue")
    ) {
      const mergedMsgId = body.event.message.parent_id;
      await handleIssueCreateRequest(mergedMsgId, message);
    }
    return new Response();
  }

  const githubWebhookEvent = req.headers.get("X-Github-Event");
  if (githubWebhookEvent) {
    const eventPayload: EventPayload = {
      ...(await req.json()),
      githubWebhookEvent: githubWebhookEvent,
    };

    const larkAgent = new LarkAgent();
    const cardParam = convertEventPayloadToCardParam(eventPayload);

    if (cardParam.label === "default_card") {
      return new Response();
    }

    const larkCard = paintCard(cardParam.label, cardParam);

    const messageID = await larkAgent.handleMsgAction(larkCard, cardParam);

    return new Response(
      "Github Webhook Event: " + eventPayload.githubWebhookEvent +
        "with Message ID: " + messageID,
      {
        status: 200,
      },
    );
  }

  // lark test
  if (req.method === "POST" && new URL(req.url).pathname === "/") {
    const body = await req.json();
    return new Response(
      JSON.stringify({ challenge: body.challenge }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  }

  return new Response(
    "Happy to see you, lean more about me at https://github.com/Wan-Hao/Github-Notify",
    { status: 200 },
  );
}

Deno.cron("patroller", "*/10 * * * *", async () => {
  console.log("-------------- Deno cron patroller Wake up --------------");
  const larkAgent = new LarkAgent();
  const specificCases = await remindPRAuthor();

  for (const spfcase of specificCases) {
    const cardParam = convertCronCheckerCaseToCardParam(
      spfcase.prBody,
      spfcase.caseLabel,
    ) as CronCheckerCardParam;
    const larkCard = paintCard(cardParam.label, cardParam);
    await larkAgent.handleMsgAction(larkCard, cardParam);
  }
});
