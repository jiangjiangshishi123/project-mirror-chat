import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, search, think } = await req.json();
    const ZHIPU_API_KEY = Deno.env.get("ZHIPU_API_KEY");
    
    if (!ZHIPU_API_KEY) {
      throw new Error("ZHIPU_API_KEY is not configured");
    }

    // Always use glm-4.7 model
    const selectedModel = "glm-4.7";

    const systemPrompt = `你是 Z.ai，一个由智谱AI创建的智能、友好的AI助手。
你可以帮助用户完成各种任务，包括：
- 回答问题和提供信息
- 帮助写作、编程和创意任务
- 分析和解释复杂话题
- 提供建议和推荐

请始终保持专业而友好的语气，提供准确有用的回答。`;

    // If search enabled, first perform web search
    let searchContext = "";
    if (search) {
      const lastMessage = messages[messages.length - 1]?.content || "";
      
      console.log("Performing web search for:", lastMessage);
      
      try {
        const searchResponse = await fetch("https://open.bigmodel.cn/api/paas/v4/web_search", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${ZHIPU_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            search_query: lastMessage,
            search_engine: "search_std",
            count: 5,
            content_size: "medium",
          }),
        });

        if (searchResponse.ok) {
          const searchData = await searchResponse.json();
          console.log("Web search results:", JSON.stringify(searchData).slice(0, 500));
          
          if (searchData.search_result && searchData.search_result.length > 0) {
            searchContext = "\n\n【网络搜索结果】\n" + searchData.search_result.map((r: any, i: number) => 
              `${i + 1}. ${r.title}\n${r.content}\n来源: ${r.link}`
            ).join("\n\n");
          }
        } else {
          console.error("Web search failed:", await searchResponse.text());
        }
      } catch (searchError) {
        console.error("Web search error:", searchError);
      }
    }

    // Prepare messages with search context
    const processedMessages = messages.map((m: any, i: number) => {
      if (i === messages.length - 1 && searchContext) {
        return { ...m, content: m.content + searchContext };
      }
      return m;
    });

    // Build request body
    const requestBody: any = {
      model: selectedModel,
      messages: [
        { role: "system", content: systemPrompt },
        ...processedMessages,
      ],
      stream: true,
      temperature: 0.7,
      top_p: 0.95,
    };

    // Control thinking mode based on think flag
    requestBody.thinking = {
      type: think ? "enabled" : "disabled",
    };

    console.log("Calling Zhipu API with model:", selectedModel, "search:", search, "think:", think);

    const response = await fetch("https://open.bigmodel.cn/api/paas/v4/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${ZHIPU_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Zhipu API error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "请求频率过高，请稍后再试。" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 401) {
        return new Response(JSON.stringify({ error: "API Key 无效，请检查配置。" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ error: "AI 服务错误: " + errorText }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Chat error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "未知错误" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
