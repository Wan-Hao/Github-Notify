import { LarkCardName } from "../lark-agent/build-card.ts";
export type LarkCardParam =
  | DefaultCardParam
  | BasicCardParam
  | PullRequestStatusCardParam
  | CronCheckerCardParam;

export interface DefaultCardParam {
  label: "default_card";
}

export interface CronCheckerCardParam extends BasicCardParam {
  prId: number;
  prBranch: {
    from: string;
    to: string;
  };
  prTitle: string;
  githubPrUrl: string;
}

export interface BasicCardParam {
  label: LarkCardName;
  headerTitle: string;
  headerColor: InteractiveCardHeaderTemplate;
  repository: string;
  bot: LarkBot;
}

export interface PullRequestStatusCardParam extends BasicCardParam {
  prId: number;
  prBranch: {
    from: string;
    to: string;
  };
  sender: string;
  prShortDescription: string;
  githubPrUrl: string;
  prStatus: string;
  prAction: string;
  reviewRequest?: string[];
}

export type LarkBot = {
  chatId: string;
};

export type InteractiveCardHeaderTemplate =
  | "blue"
  | "wathet"
  | "turquoise"
  | "green"
  | "yellow"
  | "orange"
  | "red"
  | "carmine"
  | "violet"
  | "purple"
  | "indigo"
  | "grey";

export type MessageInfo = {
  key: string[];
  value: { messageId: string };
  versionstamp: string;
};
