import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { ZaiTitle } from "@/components/ZaiTitle";
import { ChatInput } from "@/components/ChatInput";
import { FeatureTags } from "@/components/FeatureTags";
import { Footer } from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleSend = async (message: string, options: { search: boolean; think: boolean }) => {
    if (!user) {
      toast({
        title: "请先登录",
        description: "您需要登录才能开始对话",
      });
      navigate("/auth");
      return;
    }

    // Create new conversation
    const { data: conversation, error } = await supabase
      .from("conversations")
      .insert({
        user_id: user.id,
        title: message.slice(0, 50) + (message.length > 50 ? "..." : ""),
        model: "glm-4.7",
      })
      .select()
      .single();

    if (error) {
      toast({
        title: "错误",
        description: "创建会话失败",
        variant: "destructive",
      });
      return;
    }

    // Add the first message
    await supabase.from("messages").insert({
      conversation_id: conversation.id,
      role: "user",
      content: message,
    });

    // Navigate to chat page with initial message options
    navigate(`/chat/${conversation.id}`, { 
      state: { 
        initialMessage: message, 
        options: { search: options.search, think: options.think } 
      } 
    });
  };

  const handleFeatureClick = (featureId: string) => {
    const featurePrompts: Record<string, string> = {
      slides: "Help me create a presentation about ",
      fullstack: "Help me build a full-stack application for ",
      design: "Help me design a beautiful UI for ",
      code: "Help me write code for ",
      research: "Help me research and analyze ",
    };
    
    toast({
      title: "Feature Selected",
      description: `${featureId.charAt(0).toUpperCase() + featureId.slice(1)} mode activated`,
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 flex flex-col items-center justify-center px-4 pt-16 pb-20">
        <div className="w-full max-w-4xl space-y-8">
          {/* Title */}
          <div className="animate-fade-in-up flex flex-col items-center">
            <ZaiTitle size="lg" />
            <h2 className="mt-4 text-2xl md:text-3xl text-muted-foreground">有什么可以帮你的？</h2>
          </div>

          {/* Chat Input */}
          <div className="animate-fade-in-up" style={{ animationDelay: "0.15s", animationFillMode: "backwards" }}>
            <ChatInput onSend={handleSend} />
          </div>

          {/* Feature Tags */}
          <div className="animate-fade-in-up" style={{ animationDelay: "0.3s", animationFillMode: "backwards" }}>
            <FeatureTags onTagClick={handleFeatureClick} />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
