import { Clock, FileEdit, ChevronDown, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const models = [
  { id: "glm-4.7", name: "GLM-4.7", isNew: true },
  { id: "glm-4.6", name: "GLM-4.6", isNew: false },
];

interface HeaderProps {
  selectedModel: string;
  onModelChange: (model: string) => void;
}

export const Header = ({ selectedModel, onModelChange }: HeaderProps) => {
  const currentModel = models.find((m) => m.id === selectedModel) || models[0];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3 bg-background/80 backdrop-blur-sm">
      {/* Left side */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
          <Clock className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
          <FileEdit className="h-5 w-5" />
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-1.5 font-medium">
              {currentModel.name}
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
        <Button variant="ghost" className="gap-1 text-muted-foreground hover:text-foreground">
          API
          <ExternalLink className="h-3.5 w-3.5" />
        </Button>
        <Button variant="outline" className="font-medium">
          Sign in
        </Button>
      </div>
    </header>
  );
};
