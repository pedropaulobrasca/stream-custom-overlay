import { useState } from "react";
import { Search, Filter, Shield, Sword, Shirt, Hammer } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getQualityBgColor, formatSilver } from "@/lib/albion-utils";

interface AlbionItem {
  id: string;
  name: string;
  tier: number;
  enchantment: number;
  category: "weapon" | "armor" | "tool" | "consumable" | "mount";
  subcategory: string;
  quality: number;
  marketValue: number;
  description: string;
}

const mockItems: AlbionItem[] = [
  {
    id: "T4_SWORD",
    name: "Adept's Broadsword",
    tier: 4,
    enchantment: 0,
    category: "weapon",
    subcategory: "sword",
    quality: 1,
    marketValue: 15420,
    description: "A reliable broadsword for aspiring warriors",
  },
  {
    id: "T5_PLATE_ARMOR_SET1@1",
    name: "Expert's Soldier Armor",
    tier: 5,
    enchantment: 1,
    category: "armor",
    subcategory: "plate",
    quality: 2,
    marketValue: 89350,
    description: "Enhanced plate armor providing superior protection",
  },
  {
    id: "T6_PICKAXE",
    name: "Master's Pickaxe",
    tier: 6,
    enchantment: 0,
    category: "tool",
    subcategory: "gathering",
    quality: 1,
    marketValue: 45230,
    description: "Professional mining tool for resource gathering",
  },
  {
    id: "T8_MAIN_AXE@3",
    name: "Grandmaster's Greataxe",
    tier: 8,
    enchantment: 3,
    category: "weapon",
    subcategory: "axe",
    quality: 4,
    marketValue: 2450000,
    description: "Legendary two-handed axe with devastating power",
  },
];

const categoryIcons = {
  weapon: Sword,
  armor: Shield,
  tool: Hammer,
  consumable: Shirt,
  mount: Shirt,
};


function ItemsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedTier, setSelectedTier] = useState<string>("all");

  const filteredItems = mockItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
    const matchesTier = selectedTier === "all" || item.tier.toString() === selectedTier;

    return matchesSearch && matchesCategory && matchesTier;
  });

  return (
    <div className="flex flex-1 flex-col p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Albion Online Item Database</h1>
          <p className="text-muted-foreground">
            Browse and search through the complete Albion Online item database
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search items by name or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="weapon">Weapons</SelectItem>
            <SelectItem value="armor">Armor</SelectItem>
            <SelectItem value="tool">Tools</SelectItem>
            <SelectItem value="consumable">Consumables</SelectItem>
            <SelectItem value="mount">Mounts</SelectItem>
          </SelectContent>
        </Select>
        <Select value={selectedTier} onValueChange={setSelectedTier}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="All Tiers" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Tiers</SelectItem>
            {[1, 2, 3, 4, 5, 6, 7, 8].map(tier => (
              <SelectItem key={tier} value={tier.toString()}>Tier {tier}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="outline">
          <Filter className="w-4 h-4 mr-2" />
          More Filters
        </Button>
      </div>

      {/* Results */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredItems.map((item) => {
          const CategoryIcon = categoryIcons[item.category];
          return (
            <Card key={item.id} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded ${getQualityBgColor(item.quality)}`} />
                    <Badge variant="outline">T{item.tier}{item.enchantment > 0 ? `.${item.enchantment}` : ""}</Badge>
                  </div>
                  <CategoryIcon className="w-4 h-4 text-muted-foreground" />
                </div>
                <CardTitle className="text-lg">{item.name}</CardTitle>
                <CardDescription>{item.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Market Value
                  </div>
                  <div className="flex items-center gap-1 font-semibold">
                    <div className="w-4 h-4 bg-yellow-500 rounded-full" />
                    {formatSilver(item.marketValue, true)}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No items found matching your criteria.</p>
        </div>
      )}
    </div>
  );
}

export default ItemsPage;
