import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import { write, /*getIssues */ } from "./write.ts";
import { getEmoji } from "./fin.ts";


serve(handler, { port: 8000 });

function handler(req: Request): Response {
  if (req.url.includes("/api/v1")) {
    return new Response("Hello from Deno Deploy!", { status: 200 });
  }

  return new Response("Unknown path", { status: 404 });
}

Deno.cron("call v1 api every one minute", "* * * * *", async () => {
  console.log("--------- Deno Cron Job Start ---------");
  await new Promise((resolve) => setTimeout(resolve, 30 * 1000));
  // const res = await fetch("https://wonderhow-github-issu-32.deno.dev/api/v1/", {
  //   method: "POST",
  //   headers: { "User-Agent": "Deno-Cron-Job" }
  // });
  // console.log("Response Status: ", res.status);
  console.log("Data from env: ", write("Hello", "World"));
  console.log(getEmoji("unicorn"));
  // const issues = await getIssues();
  // console.log("Issues: ", issues);
  console.log("--------- Deno Cron Job End ---------");
});
