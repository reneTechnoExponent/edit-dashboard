'use client';

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/format';
import type { LlmBreakdownRow } from '@/features/llmUsage/llmUsageApi';

const PALETTE = [
  '#6366f1',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#06b6d4',
  '#ec4899',
  '#84cc16',
];

interface BreakdownBarChartProps {
  title: string;
  description?: string;
  rows: LlmBreakdownRow[];
  /** Which metric to plot. Cost renders as currency in the tooltip. */
  metric?: 'totalCostUsd' | 'totalTokens';
  emptyMessage?: string;
}

/**
 * Horizontal-friendly vertical bar chart for a provider/model/endpoint
 * breakdown. Reused across the overview and per-user drill-down.
 */
export function BreakdownBarChart({
  title,
  description,
  rows,
  metric = 'totalCostUsd',
  emptyMessage = 'No data for this range',
}: BreakdownBarChartProps) {
  const data = [...rows]
    .sort((a, b) => b[metric] - a[metric])
    .slice(0, 8)
    .map((r) => ({ name: r.key, value: r[metric] }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted-foreground">{emptyMessage}</p>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data} margin={{ left: 8, right: 8 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-15} textAnchor="end" height={50} />
              <YAxis
                tick={{ fontSize: 11 }}
                tickFormatter={(v) =>
                  metric === 'totalCostUsd' ? `$${Number(v).toFixed(2)}` : Number(v).toLocaleString()
                }
                width={70}
              />
              <Tooltip
                formatter={(value) => {
                  const n = Number(value) || 0;
                  return metric === 'totalCostUsd'
                    ? [formatCurrency(n), 'Cost']
                    : [n.toLocaleString(), 'Tokens'];
                }}
              />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {data.map((_, i) => (
                  <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
