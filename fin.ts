import { gh_token } from "./serct.ts";

import { Octokit } from "https://esm.sh/octokit@3.0.0?dts";

import * as emoji from "https://deno.land/x/emoji@0.3.1/mod.ts";

export const octokit = new Octokit({ auth: gh_token });

export function getEmoji(emojiName: string) {
  return emoji.get(emojiName);
}
