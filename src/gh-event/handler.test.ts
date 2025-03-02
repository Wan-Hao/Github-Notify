import {
  assertEquals,
  assertThrows,
} from "https://deno.land/std@0.193.0/testing/asserts.ts";
import { defaultEventHandler, PullRequestEventHandler } from "./handler.ts";
import { EventPayload, PullRequestStatus } from "../types/gh-webhook.ts";
import { prStatusColorMap } from "../config.ts";

const mockPullRequestPayload: EventPayload = {
  action: "opened",
  number: 123,
  repository: {
    name: "test-repo",
    full_name: "owner/test-repo",
    html_url: "https://github.com/owner/test-repo",
  },
  pull_request: {
    title: "Test PR",
    html_url: "https://github.com/owner/test-repo/pull/123",
    state: "open",
    head: {
      label: "feature-branch",
      repo: {
        name: "test-repo",
        owner: {
          login: "owner",
        },
      },
    },
    base: {
      label: "main",
    },
    merged: false,
    user: {
      login: "test-user",
    },
  },
  sender: {
    login: "test-user",
    avatar_url: "https://github.com/test-user.png",
  },
};

Deno.test("PullRequestEventHandler - Open PR", () => {
  const handler = new PullRequestEventHandler();
  const result = handler.reassembleParameter(mockPullRequestPayload);

  assertEquals(result.label, "pull_request_status_card");
  assertEquals(result.prStatus, PullRequestStatus.open);
  assertEquals(result.headerTitle, "Test PR");
  assertEquals(result.headerColor, prStatusColorMap[PullRequestStatus.open]);
  assertEquals(result.prId, 123);
  assertEquals(result.prAction, "opened");
  assertEquals(result.sender, "test-user");
  assertEquals(result.repository, "test-repo");
  assertEquals(result.prBranch.from, "feature-branch");
  assertEquals(result.prBranch.to, "main");
  assertEquals(
    result.githubPrUrl,
    "https://github.com/owner/test-repo/pull/123",
  );
});

Deno.test("PullRequestEventHandler - Merged PR", () => {
  const handler = new PullRequestEventHandler();
  const mergedPRPayload = {
    ...mockPullRequestPayload,
    action: "closed",
    pull_request: {
      ...mockPullRequestPayload.pull_request!,
      state: "closed",
      merged: true,
    },
  };

  const result = handler.reassembleParameter(mergedPRPayload);
  assertEquals(result.prStatus, PullRequestStatus.merged);
  assertEquals(result.headerColor, prStatusColorMap[PullRequestStatus.merged]);
});

Deno.test("PullRequestEventHandler - Closed PR", () => {
  const handler = new PullRequestEventHandler();
  const closedPRPayload = {
    ...mockPullRequestPayload,
    action: "closed",
    pull_request: {
      ...mockPullRequestPayload.pull_request!,
      state: "closed",
      merged: false,
    },
  };

  const result = handler.reassembleParameter(closedPRPayload);
  assertEquals(result.prStatus, PullRequestStatus.closed);
  assertEquals(result.headerColor, prStatusColorMap[PullRequestStatus.closed]);
});

Deno.test("PullRequestEventHandler - Invalid Payload", () => {
  const handler = new PullRequestEventHandler();
  const invalidPayload = { ...mockPullRequestPayload };
  delete invalidPayload.pull_request;

  assertThrows(
    () => handler.reassembleParameter(invalidPayload),
    Error,
    "pull_request is not found",
  );
});

Deno.test("defaultEventHandler", () => {
  const handler = new defaultEventHandler();
  const result = handler.reassembleParameter(mockPullRequestPayload);

  assertEquals(result.label, "default_card");
});
