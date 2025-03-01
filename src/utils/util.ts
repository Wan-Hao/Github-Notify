export function splitBranchName(name: string): string {
  const [, branchName = name] = name.split(":");
  return branchName;
}
