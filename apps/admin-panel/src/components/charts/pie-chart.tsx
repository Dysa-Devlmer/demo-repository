"use client";

import React from "react";
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  TooltipProps,
} from "recharts";
import { ChartContainer } from "./chart-container";

export interface PieChartDataPoint {
  name: string;
  value: number;
  color?: string;
}

export interface PieChartProps {
  title: string;
  description?: string;
  data: PieChartDataPoint[];
  height?: number;
  actions?: React.ReactNode;
  formatTooltip?: (value: number) => string;
  innerRadius?: number;
  outerRadius?: number;
  showLabels?: boolean;
}

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name?: string;
    value?: number;
    payload?: {
      fill?: string;
    };
  }>;
  formatTooltip?: (value: number) => string;
}

const CustomTooltip = ({
  active,
  payload,
  formatTooltip,
}: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="rounded-lg border bg-background p-3 shadow-sm">
        <p className="text-sm font-medium mb-1">{data.name}</p>
        <p className="text-sm" style={{ color: data.payload?.fill }}>
          {formatTooltip && data.value !== undefined ? formatTooltip(data.value) : data.value}
        </p>
      </div>
    );
  }
  return null;
};

const renderCustomLabel = (entry: any) => {
  return `${entry.name}: ${entry.value}`;
};

export function PieChart({
  title,
  description,
  data,
  height = 300,
  actions,
  formatTooltip,
  innerRadius = 0,
  outerRadius = 80,
  showLabels = false,
}: PieChartProps) {
  return (
    <ChartContainer title={title} description={description} actions={actions}>
      <ResponsiveContainer width="100%" height={height}>
        <RechartsPieChart>
          <Pie
            data={data as any}
            cx="50%"
            cy="50%"
            labelLine={showLabels}
            label={showLabels ? renderCustomLabel : false}
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.color || COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip formatTooltip={formatTooltip} />} />
          <Legend
            verticalAlign="bottom"
            height={36}
            iconType="circle"
          />
        </RechartsPieChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
