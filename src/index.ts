import RuleSetJSON from "./Configs/ruleset.json";


interface Env {
  AI: any; // keep as any for the AI binding; you can refine if you have types
}

interface AIRequest {
  prompt: string;
}


class PrepareModeration {


  static async GetRules(): Promise<string> {

    const RulesetString = JSON.stringify(RuleSetJSON);

    if (RulesetString) {
      return RulesetString;
    };

    return "";

  };





};

class Moderator {


  static async ModerateChat(): Promise<string> {

    const JankFireRules = await PrepareModeration.GetRules();


    const ModerationPrompt: string = "You are a Moderator. The rules you HAVE to follow are:" + JankFireRules;

    return ModerationPrompt;

  };

  
};





// !!! ONLY FOR TESTING !!!!! ///////////////////////////////////////////
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS, GET",
  "Access-Control-Allow-Headers": "Content-Type"
};

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: CORS_HEADERS });
    }

    const ModeratorResponse = await Moderator.ModerateChat();

    return new Response(ModeratorResponse)

    //return new Response("Internal error", { status: 500, headers: CORS_HEADERS });
  },
};