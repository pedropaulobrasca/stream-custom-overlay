import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

interface Action {
  id: string;
  name: string;
  description: string;
  image: string;
  bitCost: number;
  enabled: boolean;
}

export default function OverlayPage() {
  const { game } = useParams<{ game: string }>();
  const [actions, setActions] = useState<Action[]>([]);

  useEffect(() => {
    // Mock data for Albion Online actions based on the image
    if (game === "albion") {
      setActions([
        {
          id: "1",
          name: "Wood Collection",
          description: "Collect wood resources",
          image: "🪓",
          bitCost: 139,
          enabled: true,
        },
        {
          id: "2",
          name: "Stone Collection",
          description: "Collect stone resources",
          image: "⛏️",
          bitCost: 85,
          enabled: true,
        },
        {
          id: "3",
          name: "Ore Collection",
          description: "Collect ore resources",
          image: "⚒️",
          bitCost: 13,
          enabled: true,
        },
        {
          id: "4",
          name: "Fiber Collection",
          description: "Collect fiber resources",
          image: "🌾",
          bitCost: 65,
          enabled: true,
        },
        {
          id: "5",
          name: "Hide Collection",
          description: "Collect hide resources",
          image: "🦌",
          bitCost: 25,
          enabled: true,
        },
      ]);
    }
  }, [game]);

  if (!game) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center">
        <div className="text-white text-xl">Game not specified</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent p-4">
      <div className="flex flex-col gap-3 max-w-xs">
        {actions.map((action) => (
          <div
            key={action.id}
            className="bg-gray-800/90 backdrop-blur-sm rounded-lg p-3 flex items-center gap-3 border border-gray-700/50 shadow-lg"
          >
            <div className="text-2xl bg-gray-700/50 rounded-lg p-2 min-w-[48px] h-12 flex items-center justify-center">
              {action.image}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-white font-medium text-sm truncate">
                {action.name}
              </div>
              <div className="text-gray-300 text-xs truncate">
                {action.description}
              </div>
            </div>
            <div className="bg-yellow-500/20 border border-yellow-500/30 rounded px-2 py-1 text-yellow-400 text-xs font-bold">
              {action.bitCost}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}