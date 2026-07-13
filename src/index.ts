export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const data: { prompt: string } = await request.json();

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
