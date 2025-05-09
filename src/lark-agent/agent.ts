import * as lark from "https://esm.sh/@larksuiteoapi/node-sdk@1.43.0?deps=axios@1.4.0";
import { InteractiveCard } from "https://esm.sh/@larksuiteoapi/node-sdk@1.43.0";
import {
  LarkCardParam,
  MessageInfo,
  PullRequestStatusCardParam,
} from "../types/lark-card.ts";
import { requiresCardUpdate, requiresPRInfoDelete } from "../utils/util.ts";
import { deletePRInfo, getPRInfo, savePRInfo } from "../utils/store.ts";

export const client = new lark.Client({
  appId: Deno.env.get("LARK_APP_ID")!,
  appSecret: Deno.env.get("LARK_APP_SECRET")!,
  appType: lark.AppType.SelfBuild,
  domain: lark.Domain.Feishu,
  disableTokenCache: false,
});

export class LarkAgent {
  public async handleMsgAction(
    larkCard: InteractiveCard,
    cardParam: LarkCardParam,
  ) {
    if (!larkCard) {
      throw new Error("Lark card is null");
    }

    switch (cardParam.label) {
      case "pull_request_status_card":
        return await this.sendPullRequestStatusCard(
          larkCard,
          cardParam as PullRequestStatusCardParam,
        );
      case "able_to_merge_cron_card":
        return await this.sendAbleToMergeCronCard(
          larkCard,
        );
      default:
        throw new Error(`Unsupported card label: ${cardParam.label}`);
    }
  }

  private async sendPullRequestStatusCard(
    larkCard: InteractiveCard,
    cardParam: PullRequestStatusCardParam,
  ) {
    if (requiresCardUpdate(cardParam.prAction)) {
      const messageInfo = await getPRInfo(cardParam);
      await this.updateLarkCardMsg(larkCard, messageInfo);

      if (requiresPRInfoDelete(cardParam.prAction)) {
        await deletePRInfo(cardParam);
      }
      return;
    }

    const msgId = await this.sendLarkCardMsg(larkCard);
    await savePRInfo(cardParam, msgId!);
  }

  private async sendAbleToMergeCronCard(
    larkCard: InteractiveCard,
  ) {
    await this.sendLarkCardMsg(larkCard);
  }

  private async sendLarkCardMsg(
    larkCard: InteractiveCard,
  ): Promise<string | undefined> {
    let messageID: string | undefined;
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

  private async updateLarkCardMsg(
    larkCard: InteractiveCard,
    messageInfo: MessageInfo,
  ) {
    await client.im.message.patch({
      data: {
        content: `${JSON.stringify(larkCard)}`,
      },
      path: {
        message_id: messageInfo.value.messageId,
      },
    });
  }
}

export async function fetchMessagesByParentId(parentId: string) {
  try {
    const response = await client.im.message.get({
      path: {
        message_id: parentId,
      },
    });
    return response.data?.items?.map((item) => {
      if (item.msg_type === "text") {
        return item.body?.content;
      }
    });
  } catch (error) {
    console.error("fetchMessages using parentId error", error);
  }
}
