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

export const userRepo = [
  "Github-Notify",
];

export const owner = "Wan-Hao";

export const LARK_VERIFICATION_TOKEN =
  Deno.env.get("LARK_VERIFICATION_TOKEN") || "";
export const LARK_ENCRYPT_KEY = Deno.env.get("LARK_ENCRYPT_KEY") || "";
