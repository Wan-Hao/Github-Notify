import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

export const issueSchema = z.object({
  owner: z.string().min(1),
  repo: z.string().min(1),
  title: z.string().min(1),
  body: z.string().min(1),
});

export type IssueSchema = z.infer<typeof issueSchema>;
