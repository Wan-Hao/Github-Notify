import { serve } from "https://deno.land/std@0.192.0/http/server.ts";

import { EventPayload } from "./src/types/gh-webhook.ts";
import { convertEventPayloadToCardParam } from "./src/gh-event/dispatcher.ts";
import {
  ableToMergeRemindCard,
  paintCard,
} from "./src/lark-agent/build-card.ts";
import { LarkAgent } from "./src/lark-agent/agent.ts";
import { remindPRAuthor } from "./src/cron/patroller.ts";
import { convertCronCheckerCaseToCardParam } from "./src/cron/dispatcher.ts";
import { CronCheckerCardParam } from "./src/types/lark-card.ts";
import { CallbackPayload } from "./src/types/lark-recall.ts";
import { handleIssueCreateRequest } from "./src/gh-agent/issue-create.ts";
import { handleVerification } from "./src/lark-agent/verify-handler.ts";

serve(handler, { port: 8000 });

async function handler(req: Request): Promise<Response> {
  console.log("API Request: ", req.url);
  console.log("API Headers: ", req.headers);
  const reqClone = req.clone();
  const bodyText = await reqClone.json();
  console.log("API Body: ", bodyText);

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

  // 飞书事件订阅验证处理
  if (
    req.method === "POST" && new URL(req.url).pathname === "/lark-recall-verify"
  ) {
    const verificationResponse = await handleVerification(body);
    if (verificationResponse) {
      return verificationResponse;
    }
  }

  if (body?.header?.event_type === "im.message.receive_v1") {
    const message = body.event.message.content;
    if (
      message &&
      message.toLowerCase().includes("@bot") &&
      message.toLowerCase().includes("issue")
    ) {
      const mergedMsgId = body.event.message.parent_id;
      (async () => {
        await handleIssueCreateRequest(mergedMsgId, message);
      })();
    }
    return new Response(JSON.stringify("Ok"), { status: 200 });
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

  // recall card
  if (req.method === "POST" && new URL(req.url).pathname === "/") {
    const body: CallbackPayload = await req.json();
    if (
      body.schema === "2.0" && !body.event.action.value.cardParam &&
      body.event.action.value.actionRequest == "quick-merge"
    ) {
      const cardParam = body.event.action.value.cardParam;
      return new Response(
        JSON.stringify(
          {
            "toast": {
              "type": "info",
              "content": "card action success",
              "i18n": {
                "zh_cn": "card action success",
                "en_us": "card action success",
              },
            },
            "card": {
              "type": "raw",
              "data": ableToMergeRemindCard(cardParam),
            },
          },
        ),
      );
    }
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
