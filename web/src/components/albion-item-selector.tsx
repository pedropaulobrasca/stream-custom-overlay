import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Search, X } from "lucide-react";
import { AlbionItem, getAlbionItemImageUrl } from "@/lib/albion-utils";
import itemsData from "../../../shared/albion/items.json";

interface AlbionItemSelectorProps {
  selectedItem: AlbionItem | null;
  onItemSelect: (item: AlbionItem | null) => void;
  placeholder?: string;
}

export function AlbionItemSelector({
  selectedItem,
  onItemSelect,
  placeholder = "Select an item...",
}: AlbionItemSelectorProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filteredItems = useMemo(() => {
    if (!search) return (itemsData as AlbionItem[]).slice(0, 50); // Show first 50 items by default

    return (itemsData as AlbionItem[])
      .filter(item =>
        item.LocalizedNames?.["EN-US"]?.toLowerCase().includes(search.toLowerCase()) ||
        item.UniqueName?.toLowerCase().includes(search.toLowerCase()),
      )
      .slice(0, 100); // Limit to 100 results for performance
  }, [search]);

  const handleSelect = (item: AlbionItem) => {
    onItemSelect(item);
    setOpen(false);
    setSearch("");
  };

  const handleClear = () => {
    onItemSelect(null);
  };

  return (
    <div className="space-y-2">
      <Label>Albion Item (Optional)</Label>
      <div className="flex gap-2">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              className="flex-1 justify-start font-normal"
            >
              {selectedItem ? (
                <div className="flex items-center gap-2">
                  <img
                    src={getAlbionItemImageUrl(selectedItem.UniqueName, 1)}
                    alt={selectedItem.LocalizedNames?.["EN-US"] || selectedItem.UniqueName}
                    className="w-5 h-5 object-cover rounded"
                    onError={(e) => {
                      const target = e.currentTarget as HTMLImageElement;
                      target.style.display = "none";
                    }}
                  />
                  <span className="truncate">
                    {selectedItem.LocalizedNames?.["EN-US"] || selectedItem.UniqueName}
                  </span>
                </div>
              ) : (
                <span className="text-muted-foreground">{placeholder}</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0">
            <div className="p-3 border-b">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search items..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <div className="max-h-60 overflow-auto">
              {filteredItems.length === 0 ? (
                <div className="p-3 text-center text-muted-foreground">
                  No items found
                </div>
              ) : (
                filteredItems.map((item) => (
                  <button
                    key={item.UniqueName}
                    onClick={() => handleSelect(item)}
                    className="w-full flex items-center gap-2 p-2 hover:bg-muted transition-colors"
                  >
                    <img
                      src={getAlbionItemImageUrl(item.UniqueName, 1)}
                      alt={item.LocalizedNames?.["EN-US"] || item.UniqueName}
                      className="w-8 h-8 object-cover rounded flex-shrink-0"
                      onError={(e) => {
                        const target = e.currentTarget as HTMLImageElement;
                        target.style.display = "none";
                      }}
                    />
                    <div className="flex-1 text-left">
                      <div className="text-sm font-medium truncate">
                        {item.LocalizedNames?.["EN-US"] || item.UniqueName}
                      </div>
                      <div className="text-xs text-muted-foreground truncate">
                        {item.UniqueName}
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </PopoverContent>
        </Popover>
        {selectedItem && (
          <Button variant="outline" size="icon" onClick={handleClear}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      {selectedItem && (
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            {selectedItem.UniqueName}
          </Badge>
        </div>
      )}
    </div>
  );
}
