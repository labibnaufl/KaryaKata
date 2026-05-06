"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface TrafficChartProps {
  data: Array<{
    month: string;
    views: number;
  }>;
}

export function TrafficChart({ data }: TrafficChartProps) {
  // Debug: log data to console
  console.log("[TrafficChart] Data:", data);

  // Handle empty data
  if (!data || data.length === 0) {
    return (
      <div className="h-64 w-full flex items-center justify-center text-muted-foreground">
        Tidak ada data traffic
      </div>
    );
  }

  return (
    <div style={{ height: 300, width: '100%' }}>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#05D9FF" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#05D9FF" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
          <XAxis 
            dataKey="month" 
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            dy={10}
          />
          <YAxis 
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(value) => value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: "hsl(var(--card))", 
              border: "1px solid hsl(var(--border))",
              borderRadius: "12px",
              boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)"
            }}
            itemStyle={{ color: "#427AB5", fontWeight: 600 }}
          />
          <Area 
            type="monotone" 
            dataKey="views" 
            stroke="#05D9FF" 
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#colorViews)" 
            dot={{ r: 4, strokeWidth: 2, fill: "white", stroke: "#05D9FF" }}
            activeDot={{ r: 6, strokeWidth: 0, fill: "#427AB5" }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
