interface Env {
  AI: any;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    let data: { prompt: string };

    try {
      data = await request.json() as { prompt: string };
    } catch {
      return new Response(
        JSON.stringify({ error: "Invalid JSON body" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    if (!data.prompt) {
      return new Response(
        JSON.stringify({ error: "Missing 'prompt' field" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const result = await env.AI.run("@cf/meta/llama-3.1-8b-instruct", {
      messages: [
        { role: "user", content: data.prompt }
      ]
    });

    return new Response(JSON.stringify(result), {
      headers: { "Content-Type": "application/json" }
    });
  }
};
