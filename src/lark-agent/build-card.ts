import { InteractiveCard } from "https://esm.sh/@larksuiteoapi/node-sdk@1.43.0";
import {
  LarkCardParam,
  PullRequestStatusCardParam,
} from "../types/lark-card.ts";
import { splitBranchName } from "../utils/util.ts";
export type LarkCardName = keyof typeof LarkCardRegistry;

export function paintCard(
  cardLabel: LarkCardName,
  param: LarkCardParam,
): InteractiveCard {
  switch (cardLabel) {
    case "pull_request_status_card":
      return PRGroupChatCard(param as PullRequestStatusCardParam);
    default:
      throw new Error(`Unsupported card label: ${cardLabel}`);
  }
}

export const PRGroupChatCard = (
  param: PullRequestStatusCardParam,
): InteractiveCard => {
  return {
    schema: "2.0",
    config: {
      update_multi: true,
    },
    body: {
      direction: "vertical",
      padding: "12px 12px 12px 12px",
      elements: [
        {
          tag: "markdown",
          content:
            ` **<font color='grey'>${param.sender}</font>** **${param.prAction}** **<font color='grey'>a PR </font>** <text_tag color='green'> #${param.prId} </text_tag>`,
          text_align: "left",
          text_size: "notation",
          margin: "0px 0px 0px 0px",
          icon: {
            tag: "custom_icon",
            img_key: "img_v3_02jv_31db04df-c23f-4ef5-a77d-38cd13d314cg",
          },
        },
        {
          tag: "column_set",
          columns: [
            {
              tag: "column",
              width: "weighted",
              elements: [
                {
                  tag: "markdown",
                  content: `**<font color='grey'>${
                    param.prBranch.from
                      ? splitBranchName(param.prBranch.from)
                      : "not found branch"
                  }</font>** <font color='green'>**→**</font> **${
                    param.prBranch.to
                      ? splitBranchName(param.prBranch.to)
                      : "not found main"
                  }**  <text_tag color='green'> ${param.repository} </text_tag>`,
                  text_align: "left",
                  text_size: "notation",
                  icon: {
                    tag: "custom_icon",
                    img_key: "img_v3_02jv_96097cd9-d6a6-4613-a504-9d19da857d3g",
                  },
                },
              ],
              vertical_align: "top",
              weight: 1,
            },
            {
              tag: "column",
              width: "auto",
              elements: [
                {
                  tag: "button",
                  text: {
                    tag: "plain_text",
                    content: "Details",
                  },
                  type: "primary",
                  width: "fill",
                  size: "medium",
                  icon: {
                    tag: "standard_icon",
                    token: "forward_filled",
                  },
                  hover_tips: {
                    tag: "plain_text",
                    content: "Jump to Github",
                  },
                  behaviors: [
                    {
                      type: "open_url",
                      default_url: `${param.githubPrUrl}`,
                      pc_url: ``,
                      ios_url: ``,
                      android_url: ``,
                    },
                  ],
                },
              ],
              vertical_align: "top",
            },
          ],
          margin: "0px 0px 0px 0px",
        },
      ],
    },
    header: {
      title: {
        tag: "plain_text",
        content: `[PR: ${param.prStatus}] ${param.headerTitle}`,
      },
      //@ts-ignore it actually exists
      subtitle: {
        tag: "plain_text",
        content: "",
      },
      template: "green",
      padding: "8px 12px 8px 12px",
    },
  };
};

const LarkCardRegistry = {
  pull_request_status_card: PRGroupChatCard,
};
