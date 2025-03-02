import { PullRequest } from "../types/gh-api.ts";
import {
  ableToMergeHandler,
  CronCheckerHandler,
  defaultHandler,
} from "./handler.ts";

const dispatcher: Record<string, CronCheckerHandler> = {
  able_to_merge: new ableToMergeHandler(),
  default: new defaultHandler(),
};

export const convertCronCheckerCaseToCardParam = (
  pullRequest: PullRequest,
  caseName: string,
) => {
  return (dispatcher[caseName] ||
    dispatcher.default).reassembleParameter(
      pullRequest,
    );
};
