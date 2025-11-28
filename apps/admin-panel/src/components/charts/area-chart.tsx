"use client";

import React from "react";
import {
  AreaChart as RechartsAreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  TooltipProps,
} from "recharts";
import { ChartContainer } from "./chart-container";

export interface AreaChartDataPoint {
  name: string;
  [key: string]: string | number;
}

export interface AreaChartProps {
  title: string;
  description?: string;
  data: AreaChartDataPoint[];
  areas: Array<{
    dataKey: string;
    name: string;
    color: string;
  }>;
  xAxisKey?: string;
  yAxisLabel?: string;
  height?: number;
  actions?: React.ReactNode;
  formatTooltip?: (value: number) => string;
  stacked?: boolean;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name?: string;
    value?: number;
    color?: string;
  }>;
  label?: string;
  formatTooltip?: (value: number) => string;
}

const CustomTooltip = ({
  active,
  payload,
  label,
  formatTooltip,
}: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border bg-background p-3 shadow-sm">
        <p className="text-sm font-medium mb-2">{label}</p>
        {payload.map((entry, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {formatTooltip && entry.value !== undefined ? formatTooltip(entry.value) : entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export function AreaChart({
  title,
  description,
  data,
  areas,
  xAxisKey = "name",
  yAxisLabel,
  height = 300,
  actions,
  formatTooltip,
  stacked = false,
}: AreaChartProps) {
  return (
    <ChartContainer title={title} description={description} actions={actions}>
      <ResponsiveContainer width="100%" height={height}>
        <RechartsAreaChart
          data={data}
          margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
        >
          <defs>
            {areas.map((area) => (
              <linearGradient
                key={`gradient-${area.dataKey}`}
                id={`color-${area.dataKey}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="5%" stopColor={area.color} stopOpacity={0.8} />
                <stop offset="95%" stopColor={area.color} stopOpacity={0.1} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis
            dataKey={xAxisKey}
            className="text-xs"
            tick={{ fill: "hsl(var(--muted-foreground))" }}
          />
          <YAxis
            className="text-xs"
            tick={{ fill: "hsl(var(--muted-foreground))" }}
            label={
              yAxisLabel
                ? {
                    value: yAxisLabel,
                    angle: -90,
                    position: "insideLeft",
                    style: { fill: "hsl(var(--muted-foreground))" },
                  }
                : undefined
            }
          />
          <Tooltip content={<CustomTooltip formatTooltip={formatTooltip} />} />
          <Legend
            wrapperStyle={{ paddingTop: "20px" }}
            iconType="rect"
          />
          {areas.map((area) => (
            <Area
              key={area.dataKey}
              type="monotone"
              dataKey={area.dataKey}
              name={area.name}
              stroke={area.color}
              fill={`url(#color-${area.dataKey})`}
              stackId={stacked ? "stack" : undefined}
            />
          ))}
        </RechartsAreaChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
