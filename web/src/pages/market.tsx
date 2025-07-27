import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, DollarSign, Clock, MapPin, RefreshCw } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getQualityBgColor, formatSilver, calculateProfitMargin, getMarketCities } from "@/lib/albion-utils";
import { albionDataApi, POPULAR_ITEMS, AlbionMarketPrice } from "@/lib/albion-data-api";

const cities = ["All Cities", ...getMarketCities()];

function MarketPage() {
  const [selectedCity, setSelectedCity] = useState("All Cities");
  const [sortBy, setSortBy] = useState("profit");
  const [marketData, setMarketData] = useState<AlbionMarketPrice[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Get popular items for initial load
  const popularItems = [
    ...POPULAR_ITEMS.WEAPONS.SWORDS.slice(0, 2),
    ...POPULAR_ITEMS.WEAPONS.AXES.slice(0, 2),
    ...POPULAR_ITEMS.ARMOR.PLATE.slice(0, 2),
    ...POPULAR_ITEMS.TOOLS.GATHERING.slice(0, 2),
  ];

  const fetchMarketData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await albionDataApi.getMarketData(popularItems);
      setMarketData(data);
      setLastRefresh(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch market data');
      console.error('Failed to fetch market data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMarketData();
  }, []);

  const filteredData = marketData.filter(item =>
    selectedCity === "All Cities" || item.city === selectedCity,
  );

  const sortedData = [...filteredData].sort((a, b) => {
    switch (sortBy) {
    case "profit":
      return (b.sellPrice - b.buyPrice) - (a.sellPrice - a.buyPrice);
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
          {lastRefresh && (
            <p className="text-xs text-muted-foreground mt-1">
              Last updated: {lastRefresh.toLocaleTimeString()}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={fetchMarketData} 
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Loading...' : 'Refresh Data'}
          </Button>
          <Button>
            <DollarSign className="w-4 h-4 mr-2" />
            Set Price Alerts
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Active Listings</CardDescription>
            <CardTitle className="text-2xl">{sortedData.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm text-green-600">
              <TrendingUp className="w-4 h-4" />
              Live market data
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Average Profit Margin</CardDescription>
            <CardTitle className="text-2xl">
              {sortedData.length > 0 ? 
                `${(sortedData.reduce((sum, item) => 
                  sum + calculateProfitMargin(item.sellPrice, item.buyPrice), 0
                ) / sortedData.length).toFixed(1)}%` : '0%'
              }
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm text-blue-600">
              <TrendingUp className="w-4 h-4" />
              Real-time calculations
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Best Trading Opportunities</CardDescription>
            <CardTitle className="text-2xl">
              {sortedData.filter(item => {
                const profit = item.sellPrice - item.buyPrice;
                return profit > 1000;
              }).length}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm text-purple-600">
              <DollarSign className="w-4 h-4" />
              Profit > 1K silver
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
            <SelectItem value="price">Item Value</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Error Display */}
      {error && (
        <Card className="mb-6 border-red-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-600">
              <TrendingDown className="w-4 h-4" />
              <span>Error loading market data: {error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {isLoading && sortedData.length === 0 && (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Loading market data from Albion Online Data API...</span>
            </div>
          </CardContent>
        </Card>
      )}

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
              {sortedData.length === 0 && !isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No market data available. Try refreshing or check your connection.
                  </TableCell>
                </TableRow>
              ) : (
                sortedData.map((item) => (
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
                      {item.buyPrice > 0 ? formatSilver(item.buyPrice) : 'No orders'}
                    </TableCell>
                    <TableCell className="font-mono font-semibold">
                      {item.sellPrice > 0 ? formatSilver(item.sellPrice) : 'No orders'}
                    </TableCell>
                    <TableCell>
                      {item.sellPrice > 0 && item.buyPrice > 0 ? (
                        <div className="flex flex-col">
                          <span className="font-semibold text-green-600">
                            +{formatSilver(item.sellPrice - item.buyPrice)}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {calculateProfitMargin(item.sellPrice, item.buyPrice).toFixed(1)}%
                          </span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">No profit calc</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">Live Data</Badge>
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
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

export default MarketPage;
