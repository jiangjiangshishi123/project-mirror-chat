import logo from "@/assets/logo.png";

interface ZaiTitleProps {
  showText?: boolean;
  size?: "sm" | "md" | "lg";
}

export const ZaiTitle = ({ showText = false, size = "md" }: ZaiTitleProps) => {
  const sizeClasses = {
    sm: "h-6",
    md: "h-8",
    lg: "h-12",
  };

  return (
    <div className="flex items-center gap-2">
      <img 
        src={logo} 
        alt="RICOH InnoAI Hub" 
        className={sizeClasses[size]}
      />
      {showText && (
        <span className="text-xl font-semibold text-foreground">RICOH InnoAI Hub</span>
      )}
    </div>
  );
};
