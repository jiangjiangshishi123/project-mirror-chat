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
    const { prompt, width = 1024, height = 1024 } = await req.json();
    const VOLCENGINE_API_KEY = Deno.env.get("VOLCENGINE_API_KEY");

    if (!VOLCENGINE_API_KEY) {
      throw new Error("VOLCENGINE_API_KEY is not configured");
    }

    if (!prompt) {
      throw new Error("Prompt is required");
    }

    console.log("Generating image with prompt:", prompt, "size:", width, "x", height);

    // Call Volcengine Doubao image generation API
    const response = await fetch("https://ark.cn-beijing.volces.com/api/v3/images/generations", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${VOLCENGINE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "doubao-seedream-4-5-251128",
        prompt: prompt,
        size: `${width}x${height}`,
        response_format: "url",
        n: 1,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Volcengine API error:", response.status, errorText);
      
      if (response.status === 401) {
        return new Response(
          JSON.stringify({ error: "API Key 无效，请检查配置" }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "请求频率过高，请稍后再试" }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: "图像生成失败: " + errorText }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    console.log("Image generation response:", JSON.stringify(data).slice(0, 500));

    // Extract image URL from response
    const imageUrl = data.data?.[0]?.url;
    
    if (!imageUrl) {
      console.error("No image URL in response:", data);
      return new Response(
        JSON.stringify({ error: "未能获取生成的图像" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        imageUrl,
        prompt,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Image generation error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "未知错误" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
