import { useEffect, useState } from "react";

export const ZaiTitle = () => {
  const fullText = "Hi, I'm Z.ai";
  const [displayText, setDisplayText] = useState(fullText);
  const [isAnimating, setIsAnimating] = useState(true);

  useEffect(() => {
    // Start with animation after a brief delay
    const timer = setTimeout(() => {
      setIsAnimating(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="text-center">
      <h1 className="text-5xl md:text-6xl lg:text-7xl font-semibold tracking-tight">
        <span className="zai-title-gradient">
          {displayText}
        </span>
      </h1>
    </div>
  );
};
