import { Badge } from "@/components/ui/badge";

interface ActionCardPreviewProps {
  name: string;
  description: string;
  emoji: string;
  bitCost: number;
}

export function ActionCardPreview({ name, description, emoji, bitCost }: ActionCardPreviewProps) {
  return (
    <div className="bg-slate-700 text-white rounded-lg p-4 flex items-center gap-3 max-w-md">
      <div className="text-2xl min-w-[32px]">
        {emoji || "⚡"}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-sm truncate">
          {name || "Action Name"}
        </h3>
        <p className="text-xs text-slate-300 truncate">
          {description || "Action description..."}
        </p>
      </div>
      <Badge
        variant="secondary"
        className="bg-yellow-500 text-black hover:bg-yellow-500 text-xs font-medium px-2 py-1"
      >
        {bitCost || 0} bits
      </Badge>
    </div>
  );
}
