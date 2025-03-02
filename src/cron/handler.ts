import { PullRequest } from "../types/gh-api.ts";
import {
  CronCheckerCardParam,
  InteractiveCardHeaderTemplate,
  LarkCardParam,
} from "../types/lark-card.ts";
import { LarkCardName } from "../lark-agent/build-card.ts";
export interface CronCheckerHandler {
  reassembleParameter(pullRequest: PullRequest): LarkCardParam;
}

export class ableToMergeHandler implements CronCheckerHandler {
  reassembleParameter(pullRequest: PullRequest): CronCheckerCardParam {
    if (!pullRequest) {
      throw new Error("Pull request is null");
    }
    const ableToMergeRemindCardParam: CronCheckerCardParam = {
      label: "able_to_merge_cron_card" as LarkCardName,
      prId: pullRequest.number,
      prBranch: {
        from: pullRequest.head.ref,
        to: pullRequest.base.ref,
      },
      prTitle: pullRequest.title,
      githubPrUrl: pullRequest.html_url,
      headerTitle: "Hint: PR is approved and ready to merge !",
      headerColor: "green" as InteractiveCardHeaderTemplate,
      repository: pullRequest.head.repo.name,
      bot: {
        chatId: "",
      },
    };

    return ableToMergeRemindCardParam;
  }
}

export class defaultHandler implements CronCheckerHandler {
  reassembleParameter(_pullRequest: PullRequest): LarkCardParam {
    return {
      label: "default_card",
    };
  }
}
