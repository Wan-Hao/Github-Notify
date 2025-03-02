import { assertEquals } from "https://deno.land/std@0.193.0/testing/asserts.ts";
import { convertEventPayloadToCardParam } from "./dispatcher.ts";
import { EventPayload, PullRequestStatus } from "../types/gh-webhook.ts";
import { PullRequestStatusCardParam } from "../types/lark-card.ts";

Deno.test("convertEventPayloadToCardParam handles pull_request event", () => {
  const mockPullRequestPayload: EventPayload = {
    githubWebhookEvent: "pull_request",
    action: "opened",
    number: 1,
    repository: {
      name: "repo",
      full_name: "test/repo",
      html_url: "https://github.com/test/repo",
    },
    sender: {
      login: "testuser",
      avatar_url: "https://github.com/testuser.png",
    },
    pull_request: {
      title: "Test PR",
      html_url: "https://github.com/test/repo/pull/1",
      state: PullRequestStatus.open,
      merged: false,
      head: {
        label: "feature-branch",
        repo: {
          name: "repo",
          owner: {
            login: "test",
          },
        },
      },
      base: {
        label: "main",
      },
      user: {
        login: "testuser",
      },
    },
  };

  const result = convertEventPayloadToCardParam(
    mockPullRequestPayload,
  ) as PullRequestStatusCardParam;

  assertEquals(result.label, "pull_request_status_card");
  assertEquals(result.headerTitle, "Test PR");
  assertEquals(result.githubPrUrl, "https://github.com/test/repo/pull/1");
});

Deno.test("convertEventPayloadToCardParam handles unknown event with default handler", () => {
  const mockUnknownPayload: EventPayload = {
    githubWebhookEvent: "unknown_event",
    action: "created",
    repository: {
      name: "repo",
      full_name: "test/repo",
      html_url: "https://github.com/test/repo",
    },
    sender: {
      login: "testuser",
      avatar_url: "https://github.com/testuser.png",
    },
  };

  const result = convertEventPayloadToCardParam(mockUnknownPayload);

  assertEquals(result.label, "default_card");
});
