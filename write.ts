import { helloMessage } from "./serct.ts";
import { octokit } from "./fin.ts";

export async function getIssues() {
  const issues = await octokit.rest.issues.listForRepo({
    owner: "Wan-Hao",
    repo: "My-bubble",
  });
  return issues;
}

export function write(preMessage: string, userMessage: string) {
  return `${preMessage} ${userMessage} ${helloMessage}`;
}


