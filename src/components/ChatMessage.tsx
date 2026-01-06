import { User, Bot, Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface ChatMessageProps {
  message: {
    role: "user" | "assistant";
    content: string;
  };
}

// Simple markdown renderer
const renderMarkdown = (content: string) => {
  // Split by code blocks first
  const parts = content.split(/(```[\s\S]*?```)/g);
  
  return parts.map((part, index) => {
    if (part.startsWith('```') && part.endsWith('```')) {
      // Code block
      const codeContent = part.slice(3, -3);
      const firstNewline = codeContent.indexOf('\n');
      const language = firstNewline > 0 ? codeContent.slice(0, firstNewline).trim() : '';
      const code = firstNewline > 0 ? codeContent.slice(firstNewline + 1) : codeContent;
      
      return (
        <pre key={index} className="bg-muted/50 rounded-lg p-3 my-2 overflow-x-auto">
          {language && (
            <div className="text-xs text-muted-foreground mb-2 font-mono">{language}</div>
          )}
          <code className="text-sm font-mono">{code}</code>
        </pre>
      );
    }
    
    // Process inline markdown
    return (
      <span key={index}>
        {part.split('\n').map((line, lineIndex, lines) => {
          // Bold
          let processed: React.ReactNode = line.replace(/\*\*(.+?)\*\*/g, (_, text) => `<strong>${text}</strong>`);
          
          // Handle bullet points
          if (line.trim().startsWith('* ') || line.trim().startsWith('- ')) {
            const indent = line.search(/\S/);
            const bulletContent = line.replace(/^\s*[\*\-]\s+/, '');
            return (
              <div key={lineIndex} style={{ paddingLeft: `${indent * 4}px` }} className="flex gap-2 my-0.5">
                <span className="text-muted-foreground">•</span>
                <span dangerouslySetInnerHTML={{ __html: bulletContent.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>') }} />
              </div>
            );
          }
          
          // Regular line
          return (
            <span key={lineIndex}>
              <span dangerouslySetInnerHTML={{ __html: String(processed) }} />
              {lineIndex < lines.length - 1 && <br />}
            </span>
          );
        })}
      </span>
    );
  });
};

export const ChatMessage = ({ message }: ChatMessageProps) => {
  const isUser = message.role === "user";
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={cn(
        "flex gap-3 animate-fade-in-up group",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-1",
          isUser 
            ? "bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-md" 
            : "bg-gradient-to-br from-muted to-muted/80 text-muted-foreground"
        )}
      >
        {isUser ? <User size={16} /> : <Bot size={16} />}
      </div>

      {/* Message Content */}
      <div className={cn("flex flex-col gap-1 max-w-[85%]", isUser && "items-end")}>
        <div
          className={cn(
            "rounded-2xl px-4 py-3 shadow-sm",
            isUser
              ? "bg-primary text-primary-foreground rounded-tr-md"
              : "bg-card border border-border text-card-foreground rounded-tl-md"
          )}
        >
          {isUser ? (
            <div className="whitespace-pre-wrap break-words text-sm">
              {message.content}
            </div>
          ) : (
            <div className="text-sm leading-relaxed">
              {renderMarkdown(message.content)}
            </div>
          )}
        </div>

        {/* Copy button for assistant messages */}
        {!isUser && message.content && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="opacity-0 group-hover:opacity-100 transition-opacity h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
          >
            {copied ? (
              <>
                <Check size={12} className="mr-1" />
                已复制
              </>
            ) : (
              <>
                <Copy size={12} className="mr-1" />
                复制
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
};
