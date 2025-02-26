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

