import type { Endpoints } from "https://esm.sh/@octokit/types@11.1.0";
import {
  RestEndpointMethodTypes,
} from "https://esm.sh/@octokit/plugin-rest-endpoint-methods@9.0.0";

type ListRepoPulls = Endpoints["GET /repos/{owner}/{repo}/pulls"];
export type ListRepoPullsParameters = ListRepoPulls["parameters"];
type ListRepoPullsResponse = ListRepoPulls["response"];
export type ListRepoPullsResponseData = ListRepoPullsResponse["data"];
export type PullRequest = ListRepoPullsResponseData[number];
export type PullRequestDetails =
  RestEndpointMethodTypes["pulls"]["get"]["response"]["data"];
type GetRepoPull = Endpoints["GET /repos/{owner}/{repo}/pulls/{pull_number}"];
export type GetRepoPullParameters = GetRepoPull["parameters"];
type GetRepoPullResponse = GetRepoPull["response"];
export type GetRepoPullResponseData = GetRepoPullResponse["data"];

type CommitCheckRuns =
  Endpoints["GET /repos/{owner}/{repo}/commits/{ref}/check-runs"];
export type CommitCheckRunsParameters = CommitCheckRuns["parameters"];
type CommitCheckRunsResponse = CommitCheckRuns["response"];
export type CommitCheckRunsResponseData = CommitCheckRunsResponse["data"];

type PullComments =
  Endpoints["GET /repos/{owner}/{repo}/pulls/{pull_number}/comments"];
export type PullCommentsParameters = PullComments["parameters"];
type PullCommentsResponse = PullComments["response"];
export type PullCommentsResponseData = PullCommentsResponse["data"];
export type Comment = PullCommentsResponseData[number];

type PullReviews =
  Endpoints["GET /repos/{owner}/{repo}/pulls/{pull_number}/reviews"];
export type PullReviewsParameters = PullReviews["parameters"];
type PullReviewsResponse = PullReviews["response"];
export type PullReviewsResponseData = PullReviewsResponse["data"];

export type Issue = {
  owner: string;
  repo: string;
  title: string;
  body: string;
};
