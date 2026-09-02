'use client';

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/format';
import type { LlmTrendPoint } from '@/features/llmUsage/llmUsageApi';

interface TrendChartProps {
  points: LlmTrendPoint[];
}

/**
 * Dual-axis trend: cost (left) and total tokens (right) over time. Answers
 * "is spend trending up, and is it tokens or price driving it?".
 */
export function TrendChart({ points }: TrendChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Cost & Token Usage Over Time</CardTitle>
        <CardDescription>Estimated USD cost and total tokens per period</CardDescription>
      </CardHeader>
      <CardContent>
        {points.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted-foreground">
            No usage in this range
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={points} margin={{ left: 8, right: 8 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis
                yAxisId="cost"
                tick={{ fontSize: 11 }}
                tickFormatter={(v) => `$${Number(v).toFixed(2)}`}
                width={70}
              />
              <YAxis
                yAxisId="tokens"
                orientation="right"
                tick={{ fontSize: 11 }}
                tickFormatter={(v) => Number(v).toLocaleString()}
                width={70}
              />
              <Tooltip
                formatter={(value, name) => {
                  const n = Number(value) || 0;
                  return name === 'Cost'
                    ? [formatCurrency(n), 'Cost']
                    : [n.toLocaleString(), 'Tokens'];
                }}
              />
              <Line
                yAxisId="cost"
                type="monotone"
                dataKey="totalCostUsd"
                name="Cost"
                stroke="#6366f1"
                strokeWidth={2}
                dot={false}
              />
              <Line
                yAxisId="tokens"
                type="monotone"
                dataKey="totalTokens"
                name="Tokens"
                stroke="#10b981"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
