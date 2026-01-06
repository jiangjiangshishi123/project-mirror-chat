import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { ChatMessage } from "@/components/ChatMessage";
import { ChatInputBox } from "@/components/ChatInputBox";
import { toast } from "@/hooks/use-toast";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  thinking?: string;
}

const Chat = () => {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [conversationTitle, setConversationTitle] = useState("New Chat");
  const [lastUserMessage, setLastUserMessage] = useState<{ message: string; options: { search: boolean; think: boolean } } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (conversationId) {
      loadConversation();
    }
  }, [conversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadConversation = async () => {
    if (!conversationId) return;

    const { data: conversation, error: convError } = await supabase
      .from("conversations")
      .select("*")
      .eq("id", conversationId)
      .maybeSingle();

    if (convError || !conversation) {
      toast({
        title: "错误",
        description: "加载会话失败",
        variant: "destructive",
      });
      navigate("/");
      return;
    }

    setConversationTitle(conversation.title);

    const { data: msgs, error: msgsError } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    if (msgsError) {
      console.error("Error loading messages:", msgsError);
      return;
    }

    setMessages(
      msgs.map((m) => ({
        id: m.id,
        role: m.role as "user" | "assistant",
        content: m.content,
      }))
    );
  };

  const handleSend = async (message: string, options: { search: boolean; think: boolean }) => {
    if (!message.trim()) return;

    setLastUserMessage({ message, options });

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: message,
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Save user message to database
      if (conversationId) {
        await supabase.from("messages").insert({
          conversation_id: conversationId,
          role: "user",
          content: message,
        });

        // Update conversation title if it's the first message
        if (messages.length === 0) {
          const title = message.slice(0, 50) + (message.length > 50 ? "..." : "");
          await supabase
            .from("conversations")
            .update({ title })
            .eq("id", conversationId);
          setConversationTitle(title);
        }
      }

      await streamResponse(message, options);
    } catch (error: any) {
      console.error("Chat error:", error);
      toast({
        title: "错误",
        description: error.message || "获取回复失败",
        variant: "destructive",
      });
      // Remove failed assistant message
      setMessages((prev) => prev.filter((m) => m.role !== "assistant" || m.content));
    } finally {
      setIsLoading(false);
    }
  };

  const streamResponse = async (message: string, options: { search: boolean; think: boolean }) => {
    // Prepare messages for API
    const apiMessages = messages
      .filter((m) => m.content) // Filter out empty messages
      .map((m) => ({
        role: m.role,
        content: m.content,
      }));
    
    apiMessages.push({ role: "user", content: message });

    // Stream response
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ 
          messages: apiMessages, 
          model: "glm-4.7",
          search: options.search,
          think: options.think,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "获取回复失败");
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    let assistantContent = "";
    let thinkingContent = "";
    const assistantId = crypto.randomUUID();

    // Add empty assistant message
    setMessages((prev) => [
      ...prev,
      { id: assistantId, role: "assistant", content: "", thinking: "" },
    ]);

    let buffer = "";
    while (reader) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      let newlineIndex: number;
      while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
        let line = buffer.slice(0, newlineIndex);
        buffer = buffer.slice(newlineIndex + 1);

        if (line.endsWith("\r")) line = line.slice(0, -1);
        if (line.startsWith(":") || line.trim() === "") continue;
        if (!line.startsWith("data: ")) continue;

        const jsonStr = line.slice(6).trim();
        if (jsonStr === "[DONE]") break;

        try {
          const parsed = JSON.parse(jsonStr);
          const choices = parsed.choices || [];
          
          for (const choice of choices) {
            const delta = choice.delta || {};
            
            // Handle thinking content
            if (delta.reasoning_content) {
              thinkingContent += delta.reasoning_content;
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId ? { ...m, thinking: thinkingContent } : m
                )
              );
            }
            
            // Handle regular content
            if (delta.content) {
              assistantContent += delta.content;
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId ? { ...m, content: assistantContent } : m
                )
              );
            }
          }
        } catch {
          buffer = line + "\n" + buffer;
          break;
        }
      }
    }

    // Save assistant message to database
    if (conversationId && assistantContent) {
      await supabase.from("messages").insert({
        conversation_id: conversationId,
        role: "assistant",
        content: assistantContent,
      });
    }
  };

  const handleRegenerate = async () => {
    if (!lastUserMessage) return;
    
    // Remove the last assistant message
    setMessages((prev) => {
      const reversedIndex = [...prev].reverse().findIndex((m) => m.role === "assistant");
      if (reversedIndex !== -1) {
        const lastAssistantIndex = prev.length - 1 - reversedIndex;
        return prev.slice(0, lastAssistantIndex);
      }
      return prev;
    });
    
    // Delete the last assistant message from database
    if (conversationId) {
      const { data: msgs } = await supabase
        .from("messages")
        .select("id")
        .eq("conversation_id", conversationId)
        .eq("role", "assistant")
        .order("created_at", { ascending: false })
        .limit(1);
      
      if (msgs && msgs.length > 0) {
        await supabase.from("messages").delete().eq("id", msgs[0].id);
      }
    }
    
    setIsLoading(true);
    try {
      await streamResponse(lastUserMessage.message, lastUserMessage.options);
    } catch (error: any) {
      console.error("Regenerate error:", error);
      toast({
        title: "错误",
        description: error.message || "重新生成失败",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 flex flex-col pt-16 pb-36">
        <div className="flex-1 overflow-y-auto px-4">
          <div className="max-w-3xl mx-auto space-y-4 py-6">
            {messages.length === 0 ? (
              <div className="text-center py-20">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 mb-4">
                  <span className="text-3xl">✨</span>
                </div>
                <h2 className="text-xl font-semibold text-foreground mb-2">开始与 Z.ai 对话</h2>
                <p className="text-muted-foreground">
                  有任何问题都可以问我！
                </p>
              </div>
            ) : (
              messages.map((message, index) => (
                <ChatMessage 
                  key={message.id} 
                  message={message} 
                  onRegenerate={handleRegenerate}
                  isLast={index === messages.length - 1 && message.role === "assistant"}
                />
              ))
            )}
            {isLoading && messages[messages.length - 1]?.role === "user" && (
              <div className="flex items-center gap-3 text-muted-foreground pl-11">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                <span className="text-sm">Z.ai 正在思考...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-background via-background to-transparent pt-6 pb-6">
        <div className="max-w-3xl mx-auto px-4">
          <ChatInputBox onSend={handleSend} disabled={isLoading} />
        </div>
      </div>
    </div>
  );
};

export default Chat;
