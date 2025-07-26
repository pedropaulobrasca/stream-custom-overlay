import React, { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Package } from "lucide-react";

// Import the Albion items data
import albionItems from "@shared/albion/items.json";

interface AlbionItem {
  UniqueName: string;
  LocalizedNames: {
    "EN-US": string;
  };
  LocalizedDescriptions?: {
    "EN-US": string;
  };
  Index: string;
}

interface AlbionItemSelectorProps {
  selectedItem?: AlbionItem | null;
  onItemSelect: (item: AlbionItem | null) => void;
  placeholder?: string;
}

export function AlbionItemSelector({ 
  selectedItem, 
  onItemSelect, 
  placeholder = "Select an Albion item..." 
}: AlbionItemSelectorProps) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Get image URL for Albion item
  const getItemImageUrl = (itemId: string) => {
    return `https://render.albiononline.com/v1/item/${itemId}.png`;
  };

  // Parse and filter items
  const items = useMemo(() => {
    return (albionItems as AlbionItem[])
      .filter(item => 
        item.LocalizedNames?.["EN-US"] && 
        item.UniqueName &&
        // Filter out some item types that might not be useful for streaming
        !item.UniqueName.includes("UNIQUE_HIDEOUT") &&
        !item.UniqueName.includes("QUESTITEM") &&
        // Focus on equipment, resources, and weapons
        (item.UniqueName.includes("T") || 
         item.UniqueName.includes("TOOL") ||
         item.UniqueName.includes("WEAPON") ||
         item.UniqueName.includes("ARMOR") ||
         item.UniqueName.includes("BAG") ||
         item.UniqueName.includes("CAPE") ||
         item.UniqueName.includes("SHOES") ||
         item.UniqueName.includes("HEAD") ||
         item.UniqueName.includes("CHEST") ||
         item.UniqueName.includes("OFF") ||
         item.UniqueName.includes("2H") ||
         item.UniqueName.includes("MAIN"))
      )
      .slice(0, 500); // Limit to first 500 items for performance
  }, []);

  // Filter items based on search
  const filteredItems = useMemo(() => {
    if (!searchTerm) return items.slice(0, 50); // Show first 50 when no search

    const lowerSearch = searchTerm.toLowerCase();
    return items
      .filter(item => 
        item.LocalizedNames["EN-US"]?.toLowerCase().includes(lowerSearch) ||
        item.UniqueName.toLowerCase().includes(lowerSearch)
      )
      .slice(0, 100); // Limit search results
  }, [items, searchTerm]);

  // Get tier from item name
  const getItemTier = (uniqueName: string) => {
    const match = uniqueName.match(/T(\d)/);
    return match ? `T${match[1]}` : "";
  };

  // Get quality from item name  
  const getItemQuality = (uniqueName: string) => {
    const match = uniqueName.match(/@(\d)/);
    return match ? `@${match[1]}` : "";
  };

  const handleSelect = (item: AlbionItem) => {
    onItemSelect(item);
    setOpen(false);
  };

  const handleClear = () => {
    onItemSelect(null);
    setOpen(false);
  };

  return (
    <div className="space-y-2">
      <Label>Albion Item</Label>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button 
            variant="outline" 
            className="w-full h-auto p-3 justify-start text-left"
          >
            {selectedItem ? (
              <div className="flex items-center space-x-3 w-full">
                <img 
                  src={getItemImageUrl(selectedItem.UniqueName)}
                  alt={selectedItem.LocalizedNames["EN-US"]}
                  className="w-8 h-8 object-contain"
                  onError={(e) => {
                    e.currentTarget.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIGZpbGw9Im5vbmUiIHZpZXdCb3g9IjAgMCAzMiAzMiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiBmaWxsPSIjZjNmNGY2IiByeD0iNCIvPgo8cGF0aCBkPSJtMTYgMTBjMS4xIDAgMiAuOSAyIDJzLS45IDItMiAyLTItLjktMi0yIC45LTIgMi0yem0wIDhjMy4zIDAgNi0yLjcgNi02cy0yLjctNi02LTYtNiAyLjctNiA2IDIuNyA2IDYgNnoiIGZpbGw9IiM5Y2EzYWYiLz4KPC9zdmc+";
                  }}
                />
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">
                    {selectedItem.LocalizedNames["EN-US"]}
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                    <span className="truncate">{selectedItem.UniqueName}</span>
                    {getItemTier(selectedItem.UniqueName) && (
                      <Badge variant="outline" className="text-xs px-1 py-0">
                        {getItemTier(selectedItem.UniqueName)}
                      </Badge>
                    )}
                    {getItemQuality(selectedItem.UniqueName) && (
                      <Badge variant="outline" className="text-xs px-1 py-0">
                        {getItemQuality(selectedItem.UniqueName)}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-2 text-muted-foreground">
                <Package className="h-4 w-4" />
                <span>{placeholder}</span>
              </div>
            )}
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Select Albion Online Item</DialogTitle>
            <DialogDescription>
              Choose an item that will be displayed in your stream overlay
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search items by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <ScrollArea className="h-[400px] border rounded-lg">
              <div className="p-2">
                {selectedItem && (
                  <div className="mb-2">
                    <Button 
                      variant="outline" 
                      onClick={handleClear}
                      className="w-full text-muted-foreground"
                    >
                      Clear selection
                    </Button>
                  </div>
                )}
                
                <div className="space-y-1">
                  {filteredItems.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      {searchTerm ? "No items found" : "Loading items..."}
                    </div>
                  ) : (
                    filteredItems.map((item) => (
                      <Button
                        key={item.UniqueName}
                        variant="ghost"
                        onClick={() => handleSelect(item)}
                        className="w-full h-auto p-3 justify-start hover:bg-accent"
                      >
                        <div className="flex items-center space-x-3 w-full">
                          <img 
                            src={getItemImageUrl(item.UniqueName)}
                            alt={item.LocalizedNames["EN-US"]}
                            className="w-10 h-10 object-contain flex-shrink-0"
                            onError={(e) => {
                              e.currentTarget.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIGZpbGw9Im5vbmUiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjZjNmNGY2IiByeD0iNCIvPgo8cGF0aCBkPSJtMjAgMTJjMS4xIDAgMiAuOSAyIDJzLS45IDItMiAyLTItLjktMi0yIC45LTIgMi0yem0wIDEwYzQuNCAwIDgtMy42IDgtOHMtMy42LTgtOC04LTggMy42LTggOCAzLjYgOCA4IDh6IiBmaWxsPSIjOWNhM2FmIi8+Cjwvc3ZnPg==";
                            }}
                          />
                          <div className="flex-1 min-w-0 text-left">
                            <div className="font-medium truncate">
                              {item.LocalizedNames["EN-US"]}
                            </div>
                            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                              <span className="truncate">{item.UniqueName}</span>
                              {getItemTier(item.UniqueName) && (
                                <Badge variant="outline" className="text-xs px-1 py-0">
                                  {getItemTier(item.UniqueName)}
                                </Badge>
                              )}
                              {getItemQuality(item.UniqueName) && (
                                <Badge variant="outline" className="text-xs px-1 py-0">
                                  {getItemQuality(item.UniqueName)}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </Button>
                    ))
                  )}
                </div>
              </div>
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}