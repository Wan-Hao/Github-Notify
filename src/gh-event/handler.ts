import { EventPayload } from "../types/gh-webhook.ts";
import {
  InteractiveCardHeaderTemplate,
  LarkCardParam,
  PullRequestStatusCardParam,
} from "../types/lark-card.ts";
import { PullRequestStatus } from "../types/gh-webhook.ts";
import { prStatusColorMap } from "../config.ts";

export interface GithubEventHandler {
  reassembleParameter(eventPayload: EventPayload): LarkCardParam;
}

export class PullRequestEventHandler implements GithubEventHandler {
  reassembleParameter(
    pullRequestBody: EventPayload,
  ): PullRequestStatusCardParam {
    if (!pullRequestBody.pull_request) {
      throw new Error("pull_request is not found");
    }

    const state =
      pullRequestBody.pull_request.state === PullRequestStatus.closed
        ? (pullRequestBody.pull_request.merged
          ? PullRequestStatus.merged
          : PullRequestStatus.closed)
        : (pullRequestBody.pull_request.state as PullRequestStatus);

    const color = prStatusColorMap[state as keyof typeof prStatusColorMap];

    const prStatusCardParam: PullRequestStatusCardParam = {
      label: "pull_request_status_card",
      prStatus: state,
      headerTitle: pullRequestBody.pull_request.title,
      headerColor: color as InteractiveCardHeaderTemplate,
      prId: pullRequestBody.number ?? 0,
      prAction: pullRequestBody.action,
      sender: pullRequestBody.pull_request.user.login,
      prShortDescription: "",
      repository: pullRequestBody.repository.name,
      prBranch: {
        from: pullRequestBody.pull_request.head.label,
        to: pullRequestBody.pull_request.base.label,
      },
      bot: {
        chatId: "",
      },
      githubPrUrl: pullRequestBody.pull_request.html_url ?? "",
    };

    return prStatusCardParam;
  }
}

export class defaultEventHandler implements GithubEventHandler {
  reassembleParameter(_eventPayload: EventPayload): LarkCardParam {
    return {
      label: "default_event_card",
    } as LarkCardParam;
  }
}
