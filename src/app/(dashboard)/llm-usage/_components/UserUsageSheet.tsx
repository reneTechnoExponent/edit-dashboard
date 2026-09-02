'use client';

import { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DataTable, type DataTableColumn } from '@/components/data-table';
import { formatCurrency, formatDateTime, formatNumber } from '@/lib/format';
import {
  useGetLlmUserDetailQuery,
  useGetLlmUserLogsQuery,
  type LlmBreakdownRow,
  type LlmUsageLogRow,
} from '@/features/llmUsage/llmUsageApi';

interface UserUsageSheetProps {
  userId: string | null;
  email: string | null;
  startDate?: string;
  endDate?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const basisTone: Record<LlmUsageLogRow['costBasis'], 'default' | 'secondary' | 'destructive'> = {
  exact: 'default',
  approximate: 'secondary',
  unpriced: 'destructive',
};

function BreakdownList({ title, rows }: { title: string; rows: LlmBreakdownRow[] }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">No data</p>
        ) : (
          <div className="space-y-2">
            {rows.slice(0, 8).map((r) => (
              <div key={r.key} className="flex items-center justify-between text-sm">
                <span className="truncate pr-2 font-mono text-xs">{r.key}</span>
                <span className="flex shrink-0 gap-3">
                  <span className="text-muted-foreground">{formatNumber(r.totalTokens)} tok</span>
                  <span className="font-medium">{formatCurrency(r.totalCostUsd)}</span>
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function UserUsageSheet({
  userId,
  email,
  startDate,
  endDate,
  open,
  onOpenChange,
}: UserUsageSheetProps) {
  const [logPage, setLogPage] = useState(1);
  const [logPageSize, setLogPageSize] = useState(20);

  const dateParams = {
    ...(startDate && { startDate }),
    ...(endDate && { endDate }),
  };

  const { data: detail, isFetching: detailLoading } = useGetLlmUserDetailQuery(
    { userId: userId!, ...dateParams },
    { skip: !userId || !open }
  );

  const { data: logs, isFetching: logsLoading } = useGetLlmUserLogsQuery(
    { userId: userId!, page: logPage, limit: logPageSize, ...dateParams },
    { skip: !userId || !open }
  );

  const totals = detail?.data?.totals;

  const logColumns: DataTableColumn<LlmUsageLogRow>[] = [
    { id: 'createdAt', header: 'Date', cell: (r) => <span className="text-xs">{formatDateTime(r.createdAt)}</span> },
    { id: 'endpoint', header: 'Endpoint', cell: (r) => <span className="font-mono text-xs">{r.endpoint}</span> },
    { id: 'model', header: 'Model', cell: (r) => <span className="text-xs">{r.model || '—'}</span> },
    { id: 'inputTokens', header: 'Input', cell: (r) => formatNumber(r.inputTokens) },
    { id: 'outputTokens', header: 'Output', cell: (r) => formatNumber(r.outputTokens) },
    { id: 'totalTokens', header: 'Total', cell: (r) => formatNumber(r.totalTokens) },
    { id: 'inputCostUsd', header: 'In Cost', cell: (r) => <span className="text-xs">{formatCurrency(r.inputCostUsd)}</span> },
    { id: 'outputCostUsd', header: 'Out Cost', cell: (r) => <span className="text-xs">{formatCurrency(r.outputCostUsd)}</span> },
    {
      id: 'totalCostUsd',
      header: 'Cost',
      cell: (r) => (
        <span className="flex items-center gap-1">
          <span className="font-medium">{formatCurrency(r.totalCostUsd)}</span>
          {r.costBasis !== 'exact' && (
            <Badge variant={basisTone[r.costBasis]} className="text-[10px]">
              {r.costBasis}
            </Badge>
          )}
        </span>
      ),
    },
  ];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-3xl">
        <SheetHeader>
          <SheetTitle>LLM Usage — {email || 'User'}</SheetTitle>
          <SheetDescription>
            Token usage, cost breakdown, and per-call logs for this user.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 px-4 pb-8">
          {/* Totals */}
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">Total Cost</p>
              <p className="text-lg font-bold">{formatCurrency(totals?.totalCostUsd ?? 0)}</p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">Requests</p>
              <p className="text-lg font-bold">{formatNumber(totals?.requests ?? 0)}</p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">Input Tokens</p>
              <p className="text-lg font-bold">{formatNumber(totals?.totalInputTokens ?? 0)}</p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">Output Tokens</p>
              <p className="text-lg font-bold">{formatNumber(totals?.totalOutputTokens ?? 0)}</p>
            </div>
          </div>

          {/* Breakdowns */}
          <div className="grid gap-3 md:grid-cols-3">
            <BreakdownList title="By Provider" rows={detail?.data?.byProvider || []} />
            <BreakdownList title="By Model" rows={detail?.data?.byModel || []} />
            <BreakdownList title="By Endpoint" rows={detail?.data?.byEndpoint || []} />
          </div>

          {/* Logs */}
          <div>
            <h3 className="mb-3 text-sm font-semibold">Usage Logs</h3>
            <DataTable
              columns={logColumns}
              data={logs?.data?.items || []}
              total={logs?.data?.pagination?.total || 0}
              page={logPage}
              pageSize={logPageSize}
              onPageChange={setLogPage}
              onPageSizeChange={(size) => {
                setLogPageSize(size);
                setLogPage(1);
              }}
              onSortChange={() => {}}
              isLoading={detailLoading || logsLoading}
              emptyMessage="No usage logs for this user in the selected range"
            />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
