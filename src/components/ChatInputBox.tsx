import { useState, useRef } from "react";
import { Send, Search, Brain, Paperclip } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface ChatInputBoxProps {
  onSend: (message: string, mode: "search" | "think") => void;
  disabled?: boolean;
}

export const ChatInputBox = ({ onSend, disabled }: ChatInputBoxProps) => {
  const [message, setMessage] = useState("");
  const [mode, setMode] = useState<"search" | "think">("search");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = () => {
    if (message.trim() && !disabled) {
      onSend(message.trim(), mode);
      setMessage("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = "auto";
    textarea.style.height = Math.min(textarea.scrollHeight, 200) + "px";
  };

  return (
    <div className="bg-card border border-border rounded-2xl shadow-lg">
      <div className="p-4">
        <Textarea
          ref={textareaRef}
          value={message}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder="Ask Z.ai anything..."
          disabled={disabled}
          className="min-h-[44px] max-h-[200px] resize-none border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 p-0 text-base"
          rows={1}
        />
      </div>

      <div className="flex items-center justify-between px-4 pb-4">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground"
          >
            <Paperclip size={18} />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center bg-muted rounded-full p-1">
            <button
              type="button"
              onClick={() => setMode("search")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-all",
                mode === "search"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Search size={14} />
              <span>Search</span>
            </button>
            <button
              type="button"
              onClick={() => setMode("think")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-all",
                mode === "think"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Brain size={14} />
              <span>Deep Think</span>
            </button>
          </div>

          <Button
            type="button"
            onClick={handleSubmit}
            disabled={!message.trim() || disabled}
            size="icon"
            className="rounded-full h-9 w-9"
          >
            <Send size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
};
