import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { ChatMessage } from "@/components/ChatMessage";
import { ChatInputBox } from "@/components/ChatInputBox";
import { toast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const Chat = () => {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState("glm-4.7");
  const [conversationTitle, setConversationTitle] = useState("New Chat");
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
        title: "Error",
        description: "Failed to load conversation",
        variant: "destructive",
      });
      navigate("/");
      return;
    }

    setConversationTitle(conversation.title);
    setSelectedModel(conversation.model);

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

  const handleSend = async (message: string, mode: "search" | "think") => {
    if (!message.trim()) return;

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

      // Prepare messages for API
      const apiMessages = [...messages, userMessage].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      // Add mode context
      if (mode === "think") {
        apiMessages[apiMessages.length - 1].content = 
          `[Deep Think Mode] Please analyze this carefully and provide a thorough response: ${message}`;
      } else if (mode === "search") {
        apiMessages[apiMessages.length - 1].content = 
          `[Search Mode] Please find and synthesize relevant information about: ${message}`;
      }

      // Stream response
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ messages: apiMessages, model: selectedModel }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to get response");
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantContent = "";
      const assistantId = crypto.randomUUID();

      // Add empty assistant message
      setMessages((prev) => [
        ...prev,
        { id: assistantId, role: "assistant", content: "" },
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
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantContent += content;
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId ? { ...m, content: assistantContent } : m
                )
              );
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
    } catch (error: any) {
      console.error("Chat error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to get response",
        variant: "destructive",
      });
      // Remove failed assistant message
      setMessages((prev) => prev.filter((m) => m.role !== "assistant" || m.content));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header selectedModel={selectedModel} onModelChange={setSelectedModel} />

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
              messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
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
