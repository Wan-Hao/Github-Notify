import { Octokit } from "https://esm.sh/octokit@3.0.0?dts";
import type {
  CommitCheckRunsParameters,
  CommitCheckRunsResponseData,
  GetRepoPullParameters,
  GetRepoPullResponseData,
  ListRepoPullsParameters,
  ListRepoPullsResponseData,
  PullCommentsParameters,
  PullCommentsResponseData,
  PullRequestDetails,
  PullReviewsParameters,
  PullReviewsResponseData,
} from "../types/gh-api.ts";

const octokit = new Octokit({
  auth: Deno.env.get("GH_TOKEN"),
});

const headers = {
  "X-GitHub-Api-Version": "2022-11-28",
};

export async function listPullRequest(
  options: ListRepoPullsParameters,
): Promise<ListRepoPullsResponseData> {
  return (
    await octokit.request("GET /repos/{owner}/{repo}/pulls", {
      owner: options.owner,
      repo: options.repo,
      headers,
    })
  ).data;
}

export async function getPullRequestComments(
  pullRequestDetails: PullRequestDetails,
) {
  const { head, number } = pullRequestDetails;
  const response = await octokit.rest.issues.listComments({
    owner: head.repo!.owner.login,
    repo: head.repo!.name,
    issue_number: number,
  });

  return response.data;
}

export async function getPullRequest(
  options: GetRepoPullParameters,
): Promise<GetRepoPullResponseData> {
  return (
    await octokit.request("GET /repos/{owner}/{repo}/pulls/{pull_number}", {
      owner: options.owner,
      repo: options.repo,
      pull_number: options.pull_number,
      headers,
    })
  ).data;
}

export async function listCommitCheckRuns(
  options: CommitCheckRunsParameters,
): Promise<CommitCheckRunsResponseData> {
  return (
    await octokit.request(
      "GET /repos/{owner}/{repo}/commits/{ref}/check-runs",
      {
        owner: options.owner,
        repo: options.repo,
        ref: options.ref,
        headers,
      },
    )
  ).data;
}

export async function listComments(
  options: PullCommentsParameters,
): Promise<PullCommentsResponseData> {
  return (
    await octokit.request(
      "GET /repos/{owner}/{repo}/pulls/{pull_number}/comments",
      {
        owner: options.owner,
        repo: options.repo,
        pull_number: options.pull_number,
        headers,
      },
    )
  ).data;
}

export async function listReviews(
  options: PullReviewsParameters,
): Promise<PullReviewsResponseData> {
  return (
    await octokit.request(
      "GET /repos/{owner}/{repo}/pulls/{pull_number}/reviews",
      {
        owner: options.owner,
        repo: options.repo,
        pull_number: options.pull_number,
        headers,
      },
    )
  ).data;
}

export async function createComment(
  owner: string,
  repo: string,
  pullNumber: number,
  body: string,
) {
  await octokit.rest.issues.createComment({
    owner,
    repo,
    issue_number: pullNumber,
    body,
  });
}
