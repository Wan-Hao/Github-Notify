import { PullRequestStatusCardParam } from "../types/lark-card.ts";
import { MessageInfo } from "../types/lark-card.ts";

export const PrStorage = await Deno.openKv();

export async function savePRInfo(
  larkParam: PullRequestStatusCardParam,
  messageId: string,
) {
  await PrStorage.set([larkParam.githubPrUrl], {
    messageId: messageId,
  });
}

export async function getPRInfo(larkParam: PullRequestStatusCardParam) {
  return (await PrStorage.get([larkParam.githubPrUrl])) as MessageInfo;
}

export async function deletePRInfo(larkParam: PullRequestStatusCardParam) {
  await PrStorage.delete([larkParam.githubPrUrl]);
}
