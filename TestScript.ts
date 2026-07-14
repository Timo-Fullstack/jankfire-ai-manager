// src/index.ts
interface Env {
  AI: any; // keep as any for the AI binding; you can refine if you have types
}

interface AIRequest {
  prompt: string;
}

interface ErrorResponse {
  error: string;
  details?: string;
}

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS, GET",
  "Access-Control-Allow-Headers": "Content-Type"
};

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    try {
      console.log("Incoming request", { method: request.method, url: request.url });

      // OPTIONS preflight
      if (request.method === "OPTIONS") {
        console.log("Handling OPTIONS preflight");
        return new Response(null, {
          status: 204,
          headers: CORS_HEADERS
        });
      }

      // Simple health check
      if (request.method === "GET") {
        return new Response(JSON.stringify({ status: "ok" }), {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            ...CORS_HEADERS
          }
        });
      }

      // Only accept POST for the AI endpoint
      if (request.method !== "POST") {
        console.warn("Method not allowed", request.method);
        return new Response(JSON.stringify({ error: "Method Not Allowed" } as ErrorResponse), {
          status: 405,
          headers: {
            "Content-Type": "application/json",
            ...CORS_HEADERS
          }
        });
      }

      // Validate Content-Type
      const contentType = request.headers.get("Content-Type") || "";
      if (!contentType.includes("application/json")) {
        console.warn("Unsupported Content-Type", contentType);
        return new Response(JSON.stringify({ error: "Unsupported Content-Type. Use application/json" } as ErrorResponse), {
          status: 415,
          headers: {
            "Content-Type": "application/json",
            ...CORS_HEADERS
          }
        });
      }

      // Parse JSON body with explicit typing
      let data: AIRequest;
      try {
        data = (await request.json()) as AIRequest;
      } catch (err) {
        console.error("Failed to parse JSON body", err);
        return new Response(JSON.stringify({ error: "Invalid JSON body" } as ErrorResponse), {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            ...CORS_HEADERS
          }
        });
      }

      if (!data || typeof data.prompt !== "string" || data.prompt.trim() === "") {
        console.warn("Missing or invalid prompt field", data);
        return new Response(JSON.stringify({ error: "Missing or invalid 'prompt' field" } as ErrorResponse), {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            ...CORS_HEADERS
          }
        });
      }

      console.log("Calling AI.run with prompt length", data.prompt.length);

      // Call the AI binding and guard against runtime errors
      let aiResult: unknown;
      try {
        aiResult = await env.AI.run("@cf/google/gemma-4-26b-a4b-it", {
          messages: [{ role: "user", content: data.prompt }],
        });
      } catch (err) {
        console.error("AI.run threw an error", err);
        return new Response(JSON.stringify({ error: "AI model error", details: String(err) } as ErrorResponse), {
          status: 502,
          headers: {
            "Content-Type": "application/json",
            ...CORS_HEADERS
          }
        });
      }

      console.log("AI.run succeeded");

      return new Response(JSON.stringify({ result: aiResult }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...CORS_HEADERS
        }
      });

    } catch (err) {
      // Catch-all to avoid Cloudflare 1101 HTML error page
      console.error("Unhandled worker error", err);
      return new Response(JSON.stringify({ error: "Worker crashed", details: String(err) } as ErrorResponse), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          ...CORS_HEADERS
        }
      });
    }
  }
};
