import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

import { useIsMobile } from "@/hooks/use-mobile";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group";

export const description = "An interactive area chart";

const chartData = [
  { date: "2024-04-01", silver: 2220000, fame: 150000 },
  { date: "2024-04-02", silver: 970000, fame: 180000 },
  { date: "2024-04-03", silver: 1670000, fame: 120000 },
  { date: "2024-04-04", silver: 2420000, fame: 260000 },
  { date: "2024-04-05", silver: 3730000, fame: 290000 },
  { date: "2024-04-06", silver: 3010000, fame: 340000 },
  { date: "2024-04-07", silver: 2450000, fame: 180000 },
  { date: "2024-04-08", silver: 4090000, fame: 320000 },
  { date: "2024-04-09", silver: 590000, fame: 110000 },
  { date: "2024-04-10", silver: 2610000, fame: 190000 },
  { date: "2024-04-11", silver: 3270000, fame: 350000 },
  { date: "2024-04-12", silver: 2920000, fame: 210000 },
  { date: "2024-04-13", silver: 3420000, fame: 380000 },
  { date: "2024-04-14", silver: 1370000, fame: 220000 },
  { date: "2024-04-15", silver: 1200000, fame: 170000 },
  { date: "2024-04-16", silver: 1380000, fame: 190000 },
  { date: "2024-04-17", silver: 4460000, fame: 360000 },
  { date: "2024-04-18", silver: 3640000, fame: 410000 },
  { date: "2024-04-19", silver: 2430000, fame: 180000 },
  { date: "2024-04-20", silver: 890000, fame: 150000 },
  { date: "2024-04-21", silver: 1370000, fame: 200000 },
  { date: "2024-04-22", silver: 2240000, fame: 170000 },
  { date: "2024-04-23", silver: 1380000, fame: 230000 },
  { date: "2024-04-24", silver: 3870000, fame: 290000 },
  { date: "2024-04-25", silver: 2150000, fame: 250000 },
  { date: "2024-04-26", silver: 750000, fame: 130000 },
  { date: "2024-04-27", silver: 3830000, fame: 420000 },
  { date: "2024-04-28", silver: 1220000, fame: 180000 },
  { date: "2024-04-29", silver: 3150000, fame: 240000 },
  { date: "2024-04-30", silver: 4540000, fame: 380000 },
  { date: "2024-05-01", silver: 1650000, fame: 220000 },
  { date: "2024-05-02", silver: 2930000, fame: 310000 },
  { date: "2024-05-03", silver: 2470000, fame: 190000 },
  { date: "2024-05-04", silver: 3850000, fame: 420000 },
  { date: "2024-05-05", silver: 4810000, fame: 390000 },
  { date: "2024-05-06", silver: 4980000, fame: 520000 },
  { date: "2024-05-07", silver: 3880000, fame: 300000 },
  { date: "2024-05-08", silver: 1490000, fame: 210000 },
  { date: "2024-05-09", silver: 2270000, fame: 180000 },
  { date: "2024-05-10", silver: 2930000, fame: 330000 },
  { date: "2024-05-11", silver: 3350000, fame: 270000 },
  { date: "2024-05-12", silver: 1970000, fame: 240000 },
  { date: "2024-05-13", silver: 1970000, fame: 160000 },
  { date: "2024-05-14", silver: 4480000, fame: 490000 },
  { date: "2024-05-15", silver: 4730000, fame: 380000 },
  { date: "2024-05-16", silver: 3380000, fame: 400000 },
  { date: "2024-05-17", silver: 4990000, fame: 420000 },
  { date: "2024-05-18", silver: 3150000, fame: 350000 },
  { date: "2024-05-19", silver: 2350000, fame: 180000 },
  { date: "2024-05-20", silver: 1770000, fame: 230000 },
  { date: "2024-05-21", silver: 820000, fame: 140000 },
  { date: "2024-05-22", silver: 810000, fame: 120000 },
  { date: "2024-05-23", silver: 2520000, fame: 290000 },
  { date: "2024-05-24", silver: 2940000, fame: 220000 },
  { date: "2024-05-25", silver: 2010000, fame: 250000 },
  { date: "2024-05-26", silver: 2130000, fame: 170000 },
  { date: "2024-05-27", silver: 4200000, fame: 460000 },
  { date: "2024-05-28", silver: 2330000, fame: 190000 },
  { date: "2024-05-29", silver: 780000, fame: 130000 },
  { date: "2024-05-30", silver: 3400000, fame: 280000 },
  { date: "2024-05-31", silver: 1780000, fame: 230000 },
  { date: "2024-06-01", silver: 1780000, fame: 200000 },
  { date: "2024-06-02", silver: 4700000, fame: 410000 },
  { date: "2024-06-03", silver: 1030000, fame: 160000 },
  { date: "2024-06-04", silver: 4390000, fame: 380000 },
  { date: "2024-06-05", silver: 880000, fame: 140000 },
  { date: "2024-06-06", silver: 2940000, fame: 250000 },
  { date: "2024-06-07", silver: 3230000, fame: 370000 },
  { date: "2024-06-08", silver: 3850000, fame: 320000 },
  { date: "2024-06-09", silver: 4380000, fame: 480000 },
  { date: "2024-06-10", silver: 1550000, fame: 200000 },
  { date: "2024-06-11", silver: 920000, fame: 150000 },
  { date: "2024-06-12", silver: 4920000, fame: 420000 },
  { date: "2024-06-13", silver: 810000, fame: 130000 },
  { date: "2024-06-14", silver: 4260000, fame: 380000 },
  { date: "2024-06-15", silver: 3070000, fame: 350000 },
  { date: "2024-06-16", silver: 3710000, fame: 310000 },
  { date: "2024-06-17", silver: 4750000, fame: 520000 },
  { date: "2024-06-18", silver: 1070000, fame: 170000 },
  { date: "2024-06-19", silver: 3410000, fame: 290000 },
  { date: "2024-06-20", silver: 4080000, fame: 450000 },
  { date: "2024-06-21", silver: 1690000, fame: 210000 },
  { date: "2024-06-22", silver: 3170000, fame: 270000 },
  { date: "2024-06-23", silver: 4800000, fame: 530000 },
  { date: "2024-06-24", silver: 1320000, fame: 180000 },
  { date: "2024-06-25", silver: 1410000, fame: 190000 },
  { date: "2024-06-26", silver: 4340000, fame: 380000 },
  { date: "2024-06-27", silver: 4480000, fame: 490000 },
  { date: "2024-06-28", silver: 1490000, fame: 200000 },
  { date: "2024-06-29", silver: 1030000, fame: 160000 },
  { date: "2024-06-30", silver: 4460000, fame: 400000 },
];

const chartConfig = {
  progress: {
    label: "Progress",
  },
  silver: {
    label: "Silver Earned",
    color: "hsl(45, 93%, 47%)",
  },
  fame: {
    label: "Fame Gained",
    color: "hsl(221, 83%, 53%)",
  },
} satisfies ChartConfig;

export function ChartAreaInteractive() {
  const isMobile = useIsMobile();
  const [timeRange, setTimeRange] = React.useState("90d");

  React.useEffect(() => {
    if (isMobile) {
      setTimeRange("7d");
    }
  }, [isMobile]);

  const filteredData = chartData.filter((item) => {
    const date = new Date(item.date);
    const referenceDate = new Date("2024-06-30");
    let daysToSubtract = 90;
    if (timeRange === "30d") {
      daysToSubtract = 30;
    } else if (timeRange === "7d") {
      daysToSubtract = 7;
    }
    const startDate = new Date(referenceDate);
    startDate.setDate(startDate.getDate() - daysToSubtract);
    return date >= startDate;
  });

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Albion Online Progress</CardTitle>
        <CardDescription>
          <span className="hidden @[540px]/card:block">
            Silver earned and Fame gained over the last 3 months
          </span>
          <span className="@[540px]/card:hidden">Progress tracking</span>
        </CardDescription>
        <CardAction>
          <ToggleGroup
            type="single"
            value={timeRange}
            onValueChange={setTimeRange}
            variant="outline"
            className="hidden *:data-[slot=toggle-group-item]:!px-4 @[767px]/card:flex"
          >
            <ToggleGroupItem value="90d">Last 3 months</ToggleGroupItem>
            <ToggleGroupItem value="30d">Last 30 days</ToggleGroupItem>
            <ToggleGroupItem value="7d">Last 7 days</ToggleGroupItem>
          </ToggleGroup>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger
              className="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
              size="sm"
              aria-label="Select a value"
            >
              <SelectValue placeholder="Last 3 months" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="90d" className="rounded-lg">
                Last 3 months
              </SelectItem>
              <SelectItem value="30d" className="rounded-lg">
                Last 30 days
              </SelectItem>
              <SelectItem value="7d" className="rounded-lg">
                Last 7 days
              </SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="fillSilver" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-silver)"
                  stopOpacity={1.0}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-silver)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillFame" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-fame)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-fame)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                });
              }}
            />
            <ChartTooltip
              cursor={false}
              defaultIndex={isMobile ? -1 : 10}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    });
                  }}
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="fame"
              type="natural"
              fill="url(#fillFame)"
              stroke="var(--color-fame)"
              stackId="a"
            />
            <Area
              dataKey="silver"
              type="natural"
              fill="url(#fillSilver)"
              stroke="var(--color-silver)"
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
