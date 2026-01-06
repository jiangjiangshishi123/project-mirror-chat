import { ChevronDown, ExternalLink, LogOut, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { HistoryPanel } from "@/components/HistoryPanel";
import { useAuth } from "@/hooks/useAuth";

const models = [
  { id: "glm-4.7", name: "GLM-4.7", isNew: true },
  { id: "glm-4.7-pro", name: "GLM-4.7 Pro", isNew: false },
  { id: "gpt-5", name: "GPT-5", isNew: false },
  { id: "gpt-5-mini", name: "GPT-5 Mini", isNew: false },
];

interface HeaderProps {
  selectedModel: string;
  onModelChange: (model: string) => void;
}

export const Header = ({ selectedModel, onModelChange }: HeaderProps) => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const currentModel = models.find((m) => m.id === selectedModel) || models[0];

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3 bg-background/80 backdrop-blur-sm border-b border-border/50">
      {/* Left side */}
      <div className="flex items-center gap-2">
        <HistoryPanel />
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-1.5 font-medium">
              {currentModel.name}
              {currentModel.isNew && (
                <span className="text-xs px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                  New
                </span>
              )}
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {models.map((model) => (
              <DropdownMenuItem
                key={model.id}
                onClick={() => onModelChange(model.id)}
                className="flex items-center gap-2"
              >
                {model.name}
                {model.isNew && (
                  <span className="text-xs px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                    New
                  </span>
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2">
        <Button 
          variant="ghost" 
          className="gap-1 text-muted-foreground hover:text-foreground"
          onClick={() => window.open("https://open.bigmodel.cn/", "_blank")}
        >
          API
          <ExternalLink className="h-3.5 w-3.5" />
        </Button>
        
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline max-w-[120px] truncate">
                  {user.email?.split("@")[0]}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem disabled className="text-muted-foreground">
                {user.email}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                <LogOut className="h-4 w-4 mr-2" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button variant="outline" onClick={() => navigate("/auth")}>
            Sign in
          </Button>
        )}
      </div>
    </header>
  );
};
