import { Presentation, Layers, Wand2, Code, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FeatureTag {
  id: string;
  label: string;
  icon: React.ReactNode;
}

const features: FeatureTag[] = [
  { id: "slides", label: "AI Slides", icon: <Presentation className="h-4 w-4" /> },
  { id: "fullstack", label: "Full-Stack", icon: <Layers className="h-4 w-4" /> },
  { id: "design", label: "Magic Design", icon: <Wand2 className="h-4 w-4" /> },
  { id: "code", label: "Write Code", icon: <Code className="h-4 w-4" /> },
  { id: "research", label: "Deep Research", icon: <BookOpen className="h-4 w-4" /> },
];

interface FeatureTagsProps {
  onTagClick: (featureId: string) => void;
}

export const FeatureTags = ({ onTagClick }: FeatureTagsProps) => {
  return (
    <div className="flex flex-wrap justify-center gap-2 mt-6">
      {features.map((feature) => (
        <Button
          key={feature.id}
          variant="outline"
          size="sm"
          className="gap-2 feature-tag rounded-full px-4 py-2 bg-card hover:bg-accent"
          onClick={() => onTagClick(feature.id)}
        >
          {feature.icon}
          {feature.label}
        </Button>
      ))}
    </div>
  );
};
