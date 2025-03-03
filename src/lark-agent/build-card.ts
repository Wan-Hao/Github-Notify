import { InteractiveCard } from "https://esm.sh/@larksuiteoapi/node-sdk@1.43.0";
import {
  CronCheckerCardParam,
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
    case "able_to_merge_cron_card":
      return ableToMergeRemindCard(param as CronCheckerCardParam);
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
            ` **<font color='grey'>${param.sender}</font>** **${param.prAction}** **<font color='grey'>a PR </font>** <text_tag color=${param.headerColor}> #${param.prId} </text_tag>`,
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
                  }</font>** <font color=${param.headerColor}>**→**</font> **${
                    param.prBranch.to
                      ? splitBranchName(param.prBranch.to)
                      : "not found main"
                  }**  <text_tag color=${param.headerColor}> ${param.repository} </text_tag>`,
                  text_align: "left",
                  text_size: "notation",
                  icon: {
                    tag: "custom_icon",
                    img_key: "img_v3_02jv_8b1d2855-fc2f-4d35-8277-7181d344313g",
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
                  type: "default",
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
      template: `${param.headerColor}`,
      padding: "8px 12px 8px 12px",
    },
  };
};

export const ableToMergeRemindCard = (
  param: CronCheckerCardParam,
): InteractiveCard => {
  return {
    schema: "2.0",
    config: {
      update_multi: true,
    },
    body: {
      direction: "vertical",
      horizontal_spacing: "8px",
      vertical_spacing: "8px",
      horizontal_align: "left",
      vertical_align: "top",
      padding: "12px 12px 12px 12px",
      elements: [
        {
          tag: "column_set",
          horizontal_spacing: "8px",
          horizontal_align: "left",
          columns: [
            {
              tag: "column",
              width: "weighted",
              elements: [
                {
                  tag: "markdown",
                  content:
                    `**<font color='grey'>${param.prTitle}</font>**  <text_tag color='green'> #${param.prId}</text_tag>`,
                  text_align: "left",
                  text_size: "notation",
                  margin: "0px 0px 0px 0px",
                  icon: {
                    tag: "standard_icon",
                    token: "succeed_filled",
                    color: "green",
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
                  type: "default",
                  width: "default",
                  size: "tiny",
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
        {
          tag: "column_set",
          horizontal_align: "left",
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
                  }</font>** <font color='green'>**→**</font>  **${
                    param.prBranch.to
                      ? splitBranchName(param.prBranch.to)
                      : "not found main"
                  }**  <text_tag color='green'> ${param.repository} </text_tag>`,
                  text_align: "left",
                  text_size: "notation",
                  icon: {
                    tag: "custom_icon",
                    img_key: "img_v3_02jv_01fb89ee-7512-4cdc-9753-70095fdd51fg",
                  },
                },
              ],
              vertical_spacing: "8px",
              horizontal_align: "left",
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
                    content: "Quick merge",
                  },
                  type: "default",
                  width: "fill",
                  size: "small",
                  icon: {
                    tag: "standard_icon",
                    token: "robot_outlined",
                  },
                  hover_tips: {
                    tag: "plain_text",
                    content: "Merge this PR",
                  },
                  behaviors: [
                    {
                      type: "callback",
                      value: {
                        prRepo: "Github-Notify",
                        cardParam: param,
                        actionRequest: "quick-merge",
                      },
                    },
                  ],
                  margin: "0px 0px 0px 0px",
                },
              ],
              vertical_spacing: "8px",
              horizontal_align: "left",
              vertical_align: "top",
            },
          ],
          margin: "0px 0px 0px 0px",
        },
      ],
    },
    "header": {
      title: {
        tag: "plain_text",
        content: param.headerTitle,
      },
      //@ts-ignore it actually exists
      subtitle: {
        tag: "plain_text",
        content: "",
      },
      template: "green",
      icon: {
        tag: "standard_icon",
        token: "bell_filled",
      },
      padding: "8px 12px 8px 12px",
    },
  };
};

export const MergeSuccessHintCard = (
  param: CronCheckerCardParam,
): InteractiveCard => {
  return {
    schema: "2.0",
    config: {
      update_multi: true,
    },
    body: {
      direction: "vertical",
      horizontal_spacing: "8px",
      vertical_spacing: "8px",
      horizontal_align: "left",
      vertical_align: "top",
      padding: "12px 12px 12px 12px",
      elements: [
        {
          tag: "column_set",
          horizontal_spacing: "8px",
          horizontal_align: "left",
          columns: [
            {
              tag: "column",
              width: "weighted",
              elements: [
                {
                  tag: "markdown",
                  content:
                    `**<font color='grey'>${param.prTitle}</font>**  <text_tag color='purple'> #${param.prId}</text_tag>`,
                  text_align: "left",
                  text_size: "notation",
                  margin: "0px 0px 0px 0px",
                  icon: {
                    tag: "standard_icon",
                    token: "succeed_filled",
                    color: "purple",
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
                  type: "default",
                  width: "default",
                  size: "tiny",
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
        {
          tag: "column_set",
          horizontal_align: "left",
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
                  }</font>** <font color='purple'>**→**</font>  **${
                    param.prBranch.to
                      ? splitBranchName(param.prBranch.to)
                      : "not found main"
                  }**  <text_tag color='purple'> ${param.repository} </text_tag>`,
                  text_align: "left",
                  text_size: "notation",
                  icon: {
                    tag: "custom_icon",
                    img_key: "img_v3_02jv_01fb89ee-7512-4cdc-9753-70095fdd51fg",
                  },
                },
              ],
              vertical_spacing: "8px",
              horizontal_align: "left",
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
                    content: "Merge success",
                  },
                  type: "default",
                  width: "fill",
                  size: "small",
                  icon: {
                    tag: "standard_icon",
                    token: "robot_outlined",
                  },
                  hover_tips: {
                    tag: "plain_text",
                    content: "Merge success",
                  },
                  margin: "0px 0px 0px 0px",
                },
              ],
              vertical_spacing: "8px",
              horizontal_align: "left",
              vertical_align: "top",
            },
          ],
          margin: "0px 0px 0px 0px",
        },
      ],
    },
    "header": {
      title: {
        tag: "plain_text",
        content: `Hint: Your PR has been merged successfully !`,
      },
      //@ts-ignore it actually exists
      subtitle: {
        tag: "plain_text",
        content: "",
      },
      template: "purple",
      icon: {
        tag: "standard_icon",
        token: "verify_filled",
      },
      padding: "8px 12px 8px 12px",
    },
  };
};

const LarkCardRegistry = {
  pull_request_status_card: PRGroupChatCard,
  able_to_merge_cron_card: ableToMergeRemindCard,
  merge_success_hint_card: MergeSuccessHintCard,
};
