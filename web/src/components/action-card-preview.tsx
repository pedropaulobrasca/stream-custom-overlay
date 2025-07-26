import { Badge } from "@/components/ui/badge";

interface AlbionItem {
  uniqueName: string;
  name: string;
  imageUrl: string;
}

interface ActionCardPreviewProps {
  name: string;
  description: string;
  emoji: string;
  bitCost: number;
  albionItem?: AlbionItem;
}

export function ActionCardPreview({ name, description, emoji, bitCost, albionItem }: ActionCardPreviewProps) {
  return (
    <div className="bg-slate-700 text-white rounded-lg p-4 flex items-center gap-3 max-w-md">
      <div className="min-w-[64px] h-[64px] flex items-center justify-center">
        {albionItem ? (
          <img 
            src={albionItem.imageUrl}
            alt={albionItem.name}
            className="w-16 h-16 object-contain"
            onError={(e) => {
              // Fallback to emoji if image fails to load
              const target = e.currentTarget as HTMLImageElement;
              target.style.display = 'none';
              const sibling = target.nextElementSibling as HTMLElement;
              if (sibling) sibling.style.display = 'block';
            }}
          />
        ) : null}
        <div className={`text-4xl ${albionItem ? 'hidden' : 'block'}`}>
          {emoji || "⚡"}
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-sm truncate">
          {name || "Action Name"}
        </h3>
        {description && (
          <p className="text-xs text-slate-300 truncate">
            {description}
          </p>
        )}
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
