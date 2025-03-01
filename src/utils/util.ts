export function splitBranchName(name: string): string {
  const [, branchName = name] = name.split(":");
  return branchName;
}

export function requiresCardUpdate(action: string) {
  return (
    action == "closed" ||
    action == "merged" ||
    action == "edited" ||
    action == "ready_for_review" ||
    action == "converted_to_draft" ||
    action == "refined" ||
    action == "drafted"
  );
}

export function requiresPRInfoDelete(action: string) {
  return action == "closed" || action == "merged";
}
