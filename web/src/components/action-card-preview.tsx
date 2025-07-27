
interface AlbionItem {
  uniqueName: string;
  name: string;
  quality: number;
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
    <div className="relative flex flex-col items-center">
      {/* Main Item Image - matching overlay style */}
      <div className="ring-2 ring-white/20 bg-black/20 w-16 h-16 rounded-2xl overflow-hidden backdrop-blur-sm transition-all duration-300 relative group hover:scale-110">
        {albionItem ? (
          <img
            src={albionItem.imageUrl}
            alt={albionItem.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.currentTarget as HTMLImageElement;
              target.style.display = "none";
              const sibling = target.nextElementSibling as HTMLElement;
              if (sibling) sibling.style.display = "flex";
            }}
          />
        ) : null}
        <div className={`w-full h-full flex items-center justify-center text-xl ${!albionItem ? "flex" : "hidden"}`}>
          {emoji || "⚡"}
        </div>
      </div>

      {/* Compact Info - matching overlay style */}
      <div className="mt-2 text-center">
        <div className="text-white text-xs font-bold truncate max-w-[100px] drop-shadow-lg">
          {name || "Action Name"}
        </div>
        <div className="text-yellow-400 text-xs font-bold">
          {bitCost || 0} bits
        </div>
      </div>
    </div>
  );
}
