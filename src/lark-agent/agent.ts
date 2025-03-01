import * as lark from "https://esm.sh/@larksuiteoapi/node-sdk@1.43.0?deps=axios@1.4.0";
import { InteractiveCard } from "https://esm.sh/@larksuiteoapi/node-sdk@1.43.0";

export const client = new lark.Client({
  appId: Deno.env.get("LARK_APP_ID")!,
  appSecret: Deno.env.get("LARK_APP_SECRET")!,
  appType: lark.AppType.SelfBuild,
  domain: lark.Domain.Feishu,
  disableTokenCache: false,
});

export async function sendLarkCardMsg(
  larkCard: InteractiveCard,
): Promise<string | undefined> {
  let messageID: string | undefined;
  //
  await client.im.v1.message.create({
    params: {
      receive_id_type: "chat_id",
    },
    data: {
      receive_id: Deno.env.get("CHAT_ID")!,
      msg_type: "interactive",
      content: JSON.stringify(larkCard),
    },
  }).then((res) => {
    messageID = res?.data?.message_id;
  });

  return messageID;
}
