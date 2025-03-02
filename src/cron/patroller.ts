import { userRepo } from "../config.ts";
import {
  getPullRequest,
  listComments,
  listCommitCheckRuns,
  listPullRequest,
  listReviews,
} from "../utils/gh-api.ts";
import dayjs from "https://deno.land/x/deno_dayjs@v0.5.0/mod.ts";
import { owner } from "../config.ts";
import {
  Comment,
  PullCommentsResponseData,
  PullRequest,
} from "../types/gh-api.ts";
import { CronCase } from "../types/cron-case.ts";

export const remindPRAuthor = async () => {
  const remindList: CronCase[] = [];

  for (const repo of userRepo) {
    const pullsList = await listPullRequest({
      owner,
      repo,
    });

    const filteredPulls = pullsList.filter((pullRequest) => {
      if (
        pullRequest.draft ||
        dayjs().diff(dayjs(pullRequest.created_at), "minute") < 3
      ) {
        return false;
      }
      return true;
    });
    for (const pullRequest of filteredPulls) {
      if (
        await isAllCheckerCompleted(
          owner,
          pullRequest.head.repo.name,
          pullRequest.head.ref,
        ) &&
        await isAllCheckerPass(
          owner,
          pullRequest.head.repo.name,
          pullRequest.head.ref,
        ) &&
        /*await hasNoChangeRequests(
            owner,
            pullRequest.head.repo.name,
            pullRequest.number,
        ) && */
        await hasEnoughApproved(
          owner,
          pullRequest.head.repo.name,
          pullRequest.number,
        ) &&
        await allCommentsRepliedOrOutdated(
          pullRequest,
        ) &&
        await isPRMergeable(
          owner,
          pullRequest.head.repo.name,
          pullRequest.number,
        )
      ) {
        remindList.push({
          prBody: pullRequest,
          caseLabel: "able_to_merge",
        });
      }
    }
  }
  return remindList;
};

export async function isAllCheckerCompleted(
  owner: string,
  repo: string,
  ref: string,
): Promise<boolean> {
  const checkResult = await listCommitCheckRuns({ owner, repo, ref });
  return checkResult.check_runs.every(
    (checkRun) => checkRun.status === "completed",
  );
}

export async function isAllCheckerPass(
  owner: string,
  repo: string,
  ref: string,
): Promise<boolean> {
  const checkResult = await listCommitCheckRuns({ owner, repo, ref });
  return checkResult.check_runs.every((check) =>
    ["in_progress", "queued"].includes(check.status)
      ? !["action_required", "timed_out"].includes(check.conclusion ?? "")
      : check.conclusion !== "failure"
  );
}

export async function hasNoChangeRequests(
  owner: string,
  repo: string,
  pull_number: number,
): Promise<boolean> {
  const reviews = await listReviews({ owner, repo, pull_number });
  return reviews.every((review) => review.state !== "CHANGES_REQUESTED");
}

export async function hasEnoughApproved(
  owner: string,
  repo: string,
  pull_number: number,
): Promise<boolean> {
  const reviews = await listReviews({ owner, repo, pull_number });
  const approvedCount = reviews
    .filter((review) => review.state === "APPROVED")
    .map((review) => review!.user!.login)
    .reduce((acc, user) => {
      acc.add(user);
      return acc;
    }, new Set<string>()).size;

  return approvedCount >= 2;
}

export async function allCommentsRepliedOrOutdated(
  pullRequest: PullRequest,
): Promise<boolean> {
  const comments = await listComments({
    owner,
    repo: pullRequest.head.repo.name,
    pull_number: pullRequest.number,
  });
  for (const comment of comments) {
    if (
      isReviewerComment(comment, pullRequest) &&
      !isCommentOutdated(comment) &&
      !isPRCreatorReplied(comment, pullRequest, comments)
    ) {
      return false;
    }
  }
  return true;
}

function isCommentOutdated(comment: Comment) {
  return comment.position === null;
}

function isReviewerComment(comment: Comment, pullRequest: PullRequest) {
  return pullRequest.requested_reviewers?.find(
    (value: { login: string }) => value.login === comment.user.login,
  );
}

function isPRCreatorReplied(
  comment: Comment,
  pullRequest: PullRequest,
  comments: PullCommentsResponseData,
) {
  return comments.find(
    (value) =>
      value.user.login === pullRequest.user?.login &&
      value.position === comment.position,
  );
}
export async function isPRMergeable(
  owner: string,
  repo: string,
  pull_number: number,
) {
  const prDescribe = await getPullRequest({ owner, repo, pull_number });
  return prDescribe.mergeable == true &&
    prDescribe.mergeable_state == "clean" &&
    prDescribe.rebaseable == true;
}
