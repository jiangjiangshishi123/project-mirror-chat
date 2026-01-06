import { useState } from "react";
import { Header } from "@/components/Header";
import { ZaiTitle } from "@/components/ZaiTitle";
import { ChatInput } from "@/components/ChatInput";
import { FeatureTags } from "@/components/FeatureTags";
import { Footer } from "@/components/Footer";
import { toast } from "@/hooks/use-toast";

const Index = () => {
  const [selectedModel, setSelectedModel] = useState("glm-4.7");

  const handleSend = (message: string, mode: "search" | "think") => {
    toast({
      title: mode === "search" ? "Search Mode" : "Deep Think Mode",
      description: `Message: "${message.slice(0, 50)}${message.length > 50 ? '...' : ''}"`,
    });
    // Here you would integrate with the actual AI API
    console.log("Sending message:", message, "Mode:", mode);
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
      <Header 
        selectedModel={selectedModel} 
        onModelChange={setSelectedModel} 
      />
      
      <main className="flex-1 flex flex-col items-center justify-center px-4 pt-16 pb-20">
        <div className="w-full max-w-4xl space-y-8">
          {/* Title */}
          <div className="animate-fade-in-up">
            <ZaiTitle />
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
