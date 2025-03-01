import { PullRequestStatus } from "./types/gh-webhook.ts";
import { InteractiveCardHeaderTemplate } from "./types/lark-card.ts";

export const prStatusColorMap: Partial<
  Record<PullRequestStatus, InteractiveCardHeaderTemplate>
> = {
  [PullRequestStatus.open]: "green",
  [PullRequestStatus.closed]: "red",
  [PullRequestStatus.merged]: "purple",
  [PullRequestStatus.drafted]: "blue",
} as const;
