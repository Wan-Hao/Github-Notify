import { EventPayload } from "../types/gh-webhook.ts";
import { defaultEventHandler, PullRequestEventHandler } from "./handler.ts";
import { GithubEventHandler } from "./handler.ts";

const dispatcher: Record<string, GithubEventHandler> = {
  pull_request: new PullRequestEventHandler(),
  default: new defaultEventHandler(),
};

export const convertEventPayloadToCardParam = (eventPayload: EventPayload) => {
  return (dispatcher[eventPayload.githubWebhookEvent!] ||
    dispatcher.default).reassembleParameter(
      eventPayload,
    );
};
