import { Sparkles } from "lucide-react";

import { Button } from "../../../components/ui/Button";

export function GenerateInsightsButton({ disabled, isGenerating, onGenerate }) {
  return (
    <Button type="button" onClick={onGenerate} disabled={disabled || isGenerating}>
      <Sparkles aria-hidden="true" size={18} />
      {isGenerating ? "Generating..." : "Generate Insights"}
    </Button>
  );
}
