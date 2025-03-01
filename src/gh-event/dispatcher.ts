import { EventPayload } from "../types/gh-webhook.ts";
import { PullRequestEventHandler } from "./handler.ts";
import { GithubEventHandler } from "./handler.ts";

const dispatcher: Record<string, GithubEventHandler> = {
  pull_request: new PullRequestEventHandler(),
};

export const convertEventPayloadToCardParam = (eventPayload: EventPayload) => {
  return dispatcher[eventPayload.githubWebhookEvent ?? ""].reassembleParameter(
    eventPayload,
  );
};
