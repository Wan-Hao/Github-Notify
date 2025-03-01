export type EventPayload = {
  action: string;
  number?: number;
  githubWebhookEvent?: string;
  repository: {
    name: string;
    full_name: string;
    html_url: string;
  };
  workflow_run?: {
    name: string;
    conclusion: string | null;
    html_url: string;
    created_at: string;
    head_sha: string;
    head_branch: string;
  };
  workflow_job?: {
    run_id: number;
    name: string | null;
    workflow_name: string | null;
    conclusion: string | null;
    status: string | null;
    html_url: string;
    created_at: string;
    head_branch: string;
    head_sha: string;
  };
  sender: {
    login: string;
    avatar_url: string;
  };
  pull_request?: {
    title: string;
    html_url: string;
    state: string;
    head: {
      label: string;
      repo: {
        name: string;
        owner: {
          login: string;
        };
      };
    };
    base: {
      label: string;
    };
    merged: boolean;
    user: {
      login: string;
    };
  };
  requested_reviewer?: {
    login: string;
  };
  comment?: {
    user: {
      login: string;
    };
    body: string;
  };
  check_run?: {
    details_url: string;
    name: string;
    head_sha: string;
    conclusion: string;
  };
};

export enum PullRequestStatus {
  open = "open",
  closed = "closed",
  merged = "merged",
  drafted = "drafted",
}
