import { serve } from "https://deno.land/std@0.192.0/http/server.ts";

serve(handler, { port: 8000 });

async function handler(req: Request): Promise<Response>  {
  if (req.url.includes("/api/v1/")) {
    // 延时满足 async
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return new Response("Hello from Deno Deploy!");
  }

  return new Response("Unknown path", { status: 404 });
}

Deno.cron("call api/v1 every one minute", "0 * * * *", async () => {
  console.log("--------- Deno Cron Job Start ---------");
  const res = await fetch("https://wonderhow-github-issu-32.deno.dev/api/v1/");
  console.log("Response Status: ", res.status);
  const data = await res.json();
  console.log("Response Data: ", data);
  console.log("--------- Deno Cron Job End ---------");
});
