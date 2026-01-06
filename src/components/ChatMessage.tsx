import { User, Bot, Copy, Check, RefreshCw, ChevronDown, ChevronUp, Brain } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

interface ChatMessageProps {
  message: {
    role: "user" | "assistant";
    content: string;
    thinking?: string;
  };
  onRegenerate?: () => void;
  isLast?: boolean;
}

// Code block component with copy functionality
const CodeBlock = ({ language, children }: { language: string; children: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(children);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group my-3">
      <div className="flex items-center justify-between bg-[#282c34] rounded-t-lg px-4 py-2 text-xs">
        <span className="text-gray-400 font-mono">{language || "code"}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 text-gray-400 hover:text-white transition-colors"
        >
          {copied ? (
            <>
              <Check size={12} />
              <span>已复制</span>
            </>
          ) : (
            <>
              <Copy size={12} />
              <span>复制</span>
            </>
          )}
        </button>
      </div>
      <SyntaxHighlighter
        language={language || "text"}
        style={oneDark}
        customStyle={{
          margin: 0,
          borderTopLeftRadius: 0,
          borderTopRightRadius: 0,
          borderBottomLeftRadius: "0.5rem",
          borderBottomRightRadius: "0.5rem",
          fontSize: "0.875rem",
        }}
        showLineNumbers={children.split("\n").length > 3}
        wrapLines
      >
        {children}
      </SyntaxHighlighter>
    </div>
  );
};

// Markdown renderer with code highlighting
const MarkdownContent = ({ content }: { content: string }) => {
  return (
    <div className="prose prose-sm dark:prose-invert max-w-none prose-pre:p-0 prose-pre:bg-transparent prose-code:before:content-none prose-code:after:content-none">
      <ReactMarkdown
        components={{
          code({ className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || "");
          const isInline = !match && !className;
          
          if (isInline) {
            return (
              <code
                className="px-1.5 py-0.5 rounded bg-muted text-sm font-mono text-foreground"
                {...props}
              >
                {children}
              </code>
            );
          }
          
          return (
            <CodeBlock language={match ? match[1] : ""}>
              {String(children).replace(/\n$/, "")}
            </CodeBlock>
          );
        },
        pre({ children }) {
          return <>{children}</>;
        },
        p({ children }) {
          return <p className="mb-3 last:mb-0 leading-relaxed">{children}</p>;
        },
        ul({ children }) {
          return <ul className="list-disc pl-4 mb-3 space-y-1">{children}</ul>;
        },
        ol({ children }) {
          return <ol className="list-decimal pl-4 mb-3 space-y-1">{children}</ol>;
        },
        li({ children }) {
          return <li className="leading-relaxed">{children}</li>;
        },
        h1({ children }) {
          return <h1 className="text-xl font-bold mb-3 mt-4 first:mt-0">{children}</h1>;
        },
        h2({ children }) {
          return <h2 className="text-lg font-bold mb-2 mt-3 first:mt-0">{children}</h2>;
        },
        h3({ children }) {
          return <h3 className="text-base font-bold mb-2 mt-3 first:mt-0">{children}</h3>;
        },
        blockquote({ children }) {
          return (
            <blockquote className="border-l-4 border-primary/50 pl-4 italic text-muted-foreground my-3">
              {children}
            </blockquote>
          );
        },
        a({ href, children }) {
          return (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              {children}
            </a>
          );
        },
        table({ children }) {
          return (
            <div className="overflow-x-auto my-3">
              <table className="min-w-full border border-border rounded-lg overflow-hidden">
                {children}
              </table>
            </div>
          );
        },
        th({ children }) {
          return (
            <th className="bg-muted px-3 py-2 text-left font-semibold border-b border-border">
              {children}
            </th>
          );
        },
        td({ children }) {
          return (
            <td className="px-3 py-2 border-b border-border">{children}</td>
          );
        },
        img({ src, alt }) {
          return (
            <img
              src={src}
              alt={alt || ""}
              className="max-w-full h-auto rounded-lg my-3"
            />
          );
        },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export const ChatMessage = ({ message, onRegenerate, isLast }: ChatMessageProps) => {
  const isUser = message.role === "user";
  const [copied, setCopied] = useState(false);
  const [thinkingExpanded, setThinkingExpanded] = useState(true);

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
        {/* Thinking process for assistant - only show if there's thinking content */}
        {!isUser && message.thinking && (
          <div className="w-full mb-2">
            <button
              onClick={() => setThinkingExpanded(!thinkingExpanded)}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <Brain className="w-4 h-4" />
              <span>思考过程</span>
              {thinkingExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
            {thinkingExpanded && (
              <div className="mt-2 p-3 bg-muted/30 rounded-lg border border-border/50 text-sm text-muted-foreground">
                <MarkdownContent content={message.thinking} />
              </div>
            )}
          </div>
        )}

        {/* Only show content box when there's actual content (not during thinking-only phase) */}
        {(isUser || message.content) && (
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
              <div className="text-sm">
                <MarkdownContent content={message.content} />
              </div>
            )}
          </div>
        )}

        {/* Action buttons for assistant messages */}
        {!isUser && message.content && (
          <div className="flex items-center gap-1 mt-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
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
            
            {isLast && onRegenerate && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onRegenerate}
                className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
              >
                <RefreshCw size={12} className="mr-1" />
                重新生成
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
