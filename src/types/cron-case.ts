import { PullRequest } from "../types/gh-api.ts";

export interface CronCase {
  prBody: PullRequest;
  caseLabel: string;
}
