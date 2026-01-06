import { ExternalLink } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="fixed bottom-0 left-0 right-0 py-4 text-center">
      <div className="flex flex-wrap items-center justify-center gap-2 text-sm text-muted-foreground">
        <a
          href="#"
          className="hover:text-foreground transition-colors flex items-center gap-1"
        >
          Tech Blog
        </a>
        <span className="text-border">|</span>
        <a
          href="#"
          className="hover:text-foreground transition-colors"
        >
          Contact us
        </a>
        <span className="text-border">|</span>
        <span>
          <a href="#" className="hover:text-foreground transition-colors">
            Terms of Service
          </a>
          {" "}and{" "}
          <a href="#" className="hover:text-foreground transition-colors">
            Privacy Policy
          </a>
        </span>
      </div>
    </footer>
  );
};
