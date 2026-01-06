import { LogOut, User } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
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
import { ZaiTitle } from "@/components/ZaiTitle";

export const Header = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3 bg-background/80 backdrop-blur-sm border-b border-border/50">
      {/* Left side */}
      <div className="flex items-center gap-2">
        <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <ZaiTitle />
        </Link>
        
        <HistoryPanel />
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2">
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
                退出登录
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button variant="outline" onClick={() => navigate("/auth")}>
            登录
          </Button>
        )}
      </div>
    </header>
  );
};
