import { LarkCardName } from "../lark-agent/build-card.ts";
export type LarkCardParam =
  | BasicCardParam
  | PullRequestStatusCardParam;

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
