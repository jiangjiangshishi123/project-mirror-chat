import { useState, useRef } from "react";
import { Send, Search, Brain, Paperclip } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface ChatInputBoxProps {
  onSend: (message: string, options: { search: boolean; think: boolean }) => void;
  disabled?: boolean;
}

export const ChatInputBox = ({ onSend, disabled }: ChatInputBoxProps) => {
  const [message, setMessage] = useState("");
  const [searchEnabled, setSearchEnabled] = useState(false);
  const [thinkEnabled, setThinkEnabled] = useState(true); // Default on
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = () => {
    if (message.trim() && !disabled) {
      onSend(message.trim(), { search: searchEnabled, think: thinkEnabled });
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

  const handleAttachClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      // TODO: Handle file upload
      console.log("Selected files:", files);
    }
  };

  return (
    <div className="bg-card/80 backdrop-blur-xl border border-border/50 rounded-2xl shadow-lg transition-all duration-200 hover:shadow-xl hover:border-border">
      <div className="p-4 pb-2">
        <Textarea
          ref={textareaRef}
          value={message}
          onChange={handleInput}
          onKeyDown={(e) => {
            // Only prevent send on Enter when disabled
            if (e.key === "Enter" && !e.shiftKey && disabled) {
              e.preventDefault();
              return;
            }
            handleKeyDown(e);
          }}
          placeholder="向 Z.ai 提问..."
          className="min-h-[44px] max-h-[200px] resize-none border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 p-0 text-base placeholder:text-muted-foreground/60"
          rows={1}
        />
      </div>

      <div className="flex items-center justify-between px-4 pb-3">
        <div className="flex items-center gap-1">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            multiple
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleAttachClick}
            className="text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg h-8 w-8 p-0"
          >
            <Paperclip size={18} />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          {/* Search toggle */}
          <button
            type="button"
            onClick={() => setSearchEnabled(!searchEnabled)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 border",
              searchEnabled
                ? "bg-primary/10 text-primary border-primary/30"
                : "text-muted-foreground hover:text-foreground border-transparent hover:bg-muted/50"
            )}
          >
            <Search size={14} />
            <span>搜索</span>
          </button>
          
          {/* Deep Think toggle */}
          <button
            type="button"
            onClick={() => setThinkEnabled(!thinkEnabled)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 border",
              thinkEnabled
                ? "bg-primary/10 text-primary border-primary/30"
                : "text-muted-foreground hover:text-foreground border-transparent hover:bg-muted/50"
            )}
          >
            <Brain size={14} />
            <span>深度思考</span>
          </button>

          <Button
            type="button"
            onClick={handleSubmit}
            disabled={!message.trim() || disabled}
            size="icon"
            className="rounded-full h-9 w-9 bg-primary hover:bg-primary/90 shadow-md transition-all duration-200 hover:shadow-lg disabled:opacity-40"
          >
            <Send size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
};
