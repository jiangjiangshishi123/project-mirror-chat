import { useState, useRef } from "react";
import { Plus, Search, Brain, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  onSend: (message: string, options: { search: boolean; think: boolean }) => void;
}

export const ChatInput = ({ onSend }: ChatInputProps) => {
  const [message, setMessage] = useState("");
  const [searchEnabled, setSearchEnabled] = useState(false);
  const [thinkEnabled, setThinkEnabled] = useState(true);
  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = () => {
    if (message.trim()) {
      onSend(message, { search: searchEnabled, think: thinkEnabled });
      setMessage("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="relative bg-card border border-border rounded-2xl shadow-lg input-glow transition-shadow">
        {/* Input area */}
        <div className="flex flex-col">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="向 Z.ai 提问..."
            className="w-full min-h-[120px] p-4 pb-2 bg-transparent resize-none outline-none text-foreground placeholder:text-muted-foreground"
            rows={3}
          />
          
          {/* Files indicator */}
          {files.length > 0 && (
            <div className="px-4 pb-2">
              <span className="text-sm text-muted-foreground">
                文件: {files.map(f => f.name).join(", ")}
              </span>
            </div>
          )}

          {/* Bottom toolbar */}
          <div className="flex items-center justify-between px-3 py-2 border-t border-border/50">
            <div className="flex items-center gap-1">
              {/* Add file button */}
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                onClick={() => fileInputRef.current?.click()}
              >
                <Plus className="h-4 w-4" />
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={handleFileChange}
              />

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
                <Search className="h-4 w-4" />
                搜索
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
                <Brain className="h-4 w-4" />
                深度思考
              </button>
            </div>

            {/* Send button */}
            <Button
              size="icon"
              className="h-8 w-8 rounded-full"
              onClick={handleSubmit}
              disabled={!message.trim()}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
