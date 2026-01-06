import { useState, useRef } from "react";
import { Plus, Search, Sparkles, Send, Paperclip } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface ChatInputProps {
  onSend: (message: string, mode: "search" | "think") => void;
}

export const ChatInput = ({ onSend }: ChatInputProps) => {
  const [message, setMessage] = useState("");
  const [mode, setMode] = useState<"search" | "think">("search");
  const [advancedSearch, setAdvancedSearch] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = () => {
    if (message.trim()) {
      onSend(message, mode);
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
            placeholder="Ask Z.ai anything..."
            className="w-full min-h-[120px] p-4 pb-2 bg-transparent resize-none outline-none text-foreground placeholder:text-muted-foreground"
            rows={3}
          />
          
          {/* Files indicator */}
          {files.length > 0 && (
            <div className="px-4 pb-2">
              <span className="text-sm text-muted-foreground">
                Files: {files.map(f => f.name).join(", ")}
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

              {/* Search mode button */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={mode === "search" ? "secondary" : "ghost"}
                    size="sm"
                    className="gap-1.5 h-8"
                    onClick={() => setMode("search")}
                  >
                    <Search className="h-4 w-4" />
                    Search
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-72" align="start">
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <div className="font-medium">Search</div>
                      <p className="text-sm text-muted-foreground">
                        Single-round search, quickly get information
                      </p>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="font-medium">Advanced Search</div>
                        <p className="text-sm text-muted-foreground">
                          Multi-round search, in-depth research and analysis
                        </p>
                      </div>
                      <Switch
                        checked={advancedSearch}
                        onCheckedChange={setAdvancedSearch}
                      />
                    </div>
                  </div>
                </PopoverContent>
              </Popover>

              {/* Deep Think mode button */}
              <Button
                variant={mode === "think" ? "secondary" : "ghost"}
                size="sm"
                className="gap-1.5 h-8"
                onClick={() => setMode("think")}
              >
                <Sparkles className="h-4 w-4" />
                Deep Think
              </Button>
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

      {/* File upload hint */}
      <div className="flex justify-center mt-2">
        <span className="text-sm text-muted-foreground">
          Files: {files.length > 0 ? files.length + " selected" : "No file chosen"}
        </span>
      </div>
    </div>
  );
};
