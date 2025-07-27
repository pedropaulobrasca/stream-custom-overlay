import { useState } from "react";
import { TrendingUp, TrendingDown, DollarSign, Clock, MapPin } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getQualityBgColor, formatSilver, calculateProfitMargin, getMarketCities } from "@/lib/albion-utils";

interface MarketData {
  itemId: string;
  itemName: string;
  city: string;
  sellPrice: number;
  buyPrice: number;
  lastUpdate: string;
  trend: "up" | "down" | "stable";
  volume: number;
  quality: number;
}

const mockMarketData: MarketData[] = [
  {
    itemId: "T4_SWORD",
    itemName: "Adept's Broadsword",
    city: "Caerleon",
    sellPrice: 15420,
    buyPrice: 12890,
    lastUpdate: "2 min ago",
    trend: "up",
    volume: 156,
    quality: 1,
  },
  {
    itemId: "T5_PLATE_ARMOR_SET1@1",
    itemName: "Expert's Soldier Armor",
    city: "Bridgewatch",
    sellPrice: 89350,
    buyPrice: 76200,
    lastUpdate: "5 min ago",
    trend: "down",
    volume: 23,
    quality: 2,
  },
  {
    itemId: "T6_PICKAXE",
    itemName: "Master's Pickaxe",
    city: "Lymhurst",
    sellPrice: 45230,
    buyPrice: 41100,
    lastUpdate: "1 min ago",
    trend: "stable",
    volume: 89,
    quality: 1,
  },
  {
    itemId: "T8_MAIN_AXE@3",
    itemName: "Grandmaster's Greataxe",
    city: "Thetford",
    sellPrice: 2450000,
    buyPrice: 2100000,
    lastUpdate: "8 min ago",
    trend: "up",
    volume: 5,
    quality: 4,
  },
];

const cities = ["All Cities", ...getMarketCities()];

function MarketPage() {
  const [selectedCity, setSelectedCity] = useState("All Cities");
  const [sortBy, setSortBy] = useState("profit");

  const filteredData = mockMarketData.filter(item =>
    selectedCity === "All Cities" || item.city === selectedCity,
  );

  const sortedData = [...filteredData].sort((a, b) => {
    switch (sortBy) {
    case "profit":
      return (b.sellPrice - b.buyPrice) - (a.sellPrice - a.buyPrice);
    case "volume":
      return b.volume - a.volume;
    case "price":
      return b.sellPrice - a.sellPrice;
    default:
      return 0;
    }
  });

  const getTrendIcon = (trend: string) => {
    switch (trend) {
    case "up":
      return <TrendingUp className="w-4 h-4 text-green-500" />;
    case "down":
      return <TrendingDown className="w-4 h-4 text-red-500" />;
    default:
      return <div className="w-4 h-4 rounded-full bg-gray-400" />;
    }
  };


  return (
    <div className="flex flex-1 flex-col p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Albion Online Market Tracker</h1>
          <p className="text-muted-foreground">
            Real-time market data and profitable trading opportunities
          </p>
        </div>
        <Button>
          <DollarSign className="w-4 h-4 mr-2" />
          Set Price Alerts
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Active Listings</CardDescription>
            <CardTitle className="text-2xl">1,247</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm text-green-600">
              <TrendingUp className="w-4 h-4" />
              +12% from yesterday
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Average Profit Margin</CardDescription>
            <CardTitle className="text-2xl">23.4%</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm text-blue-600">
              <TrendingUp className="w-4 h-4" />
              Stable market conditions
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Best Trading Opportunities</CardDescription>
            <CardTitle className="text-2xl">18</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm text-purple-600">
              <DollarSign className="w-4 h-4" />
              High-profit items available
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <Select value={selectedCity} onValueChange={setSelectedCity}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Select City" />
          </SelectTrigger>
          <SelectContent>
            {cities.map(city => (
              <SelectItem key={city} value={city}>{city}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="profit">Highest Profit</SelectItem>
            <SelectItem value="volume">Trading Volume</SelectItem>
            <SelectItem value="price">Item Value</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="outline">Refresh Data</Button>
      </div>

      {/* Market Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>Market Data</CardTitle>
          <CardDescription>
            Current buy/sell orders and trading opportunities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>City</TableHead>
                <TableHead>Buy Price</TableHead>
                <TableHead>Sell Price</TableHead>
                <TableHead>Profit</TableHead>
                <TableHead>Volume</TableHead>
                <TableHead>Trend</TableHead>
                <TableHead>Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedData.map((item) => (
                <TableRow key={`${item.itemId}-${item.city}`}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded ${getQualityBgColor(item.quality)}`} />
                      <span className="font-medium">{item.itemName}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-muted-foreground" />
                      {item.city}
                    </div>
                  </TableCell>
                  <TableCell className="font-mono">
                    {formatSilver(item.buyPrice)}
                  </TableCell>
                  <TableCell className="font-mono font-semibold">
                    {formatSilver(item.sellPrice)}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-semibold text-green-600">
                        +{formatSilver(item.sellPrice - item.buyPrice)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {calculateProfitMargin(item.sellPrice, item.buyPrice).toFixed(1)}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{item.volume}</Badge>
                  </TableCell>
                  <TableCell>
                    {getTrendIcon(item.trend)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {item.lastUpdate}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

export default MarketPage;
