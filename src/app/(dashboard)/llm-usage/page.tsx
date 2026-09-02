'use client';

import { useState } from 'react';
import { Activity, Coins, DollarSign, Hash, Users as UsersIcon } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { StatCard } from '@/components/StatCard';
import { DataTable, type DataTableColumn } from '@/components/data-table';
import { cn } from '@/lib/utils';
import { formatCurrency, formatDate, formatDateTime, formatNumber } from '@/lib/format';
import { toast } from 'sonner';
import { useAppSelector } from '@/lib/hooks';
import {
  useGetLlmOverviewQuery,
  useGetLlmPricingQuery,
  useGetLlmUserSummaryQuery,
  useSyncLlmPricingMutation,
  useBackfillLlmCostsMutation,
  type LlmPricingRow,
  type LlmUserSummaryRow,
} from '@/features/llmUsage/llmUsageApi';
import { BreakdownBarChart } from './_components/BreakdownBarChart';
import { TrendChart } from './_components/TrendChart';
import { UserUsageSheet } from './_components/UserUsageSheet';

type Tab = 'overview' | 'users' | 'pricing';
type SortField =
  | 'totalCostUsd'
  | 'totalTokens'
  | 'totalInputTokens'
  | 'totalOutputTokens'
  | 'requests'
  | 'lastUsedAt';

export default function LlmUsagePage() {
  const [tab, setTab] = useState<Tab>('overview');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [interval, setInterval] = useState<'day' | 'month'>('day');

  // Users table state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [sortBy, setSortBy] = useState<SortField>('totalCostUsd');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');

  // Drill-down
  const [selectedUser, setSelectedUser] = useState<{ id: string; email: string } | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const [includeHistory, setIncludeHistory] = useState(false);

  // Maintenance actions (super-admin only)
  const isSuperAdmin = useAppSelector((s) => s.auth.admin?.role) === 'super_admin';
  const [syncPricing, { isLoading: syncing }] = useSyncLlmPricingMutation();
  const [backfillCosts, { isLoading: backfilling }] = useBackfillLlmCostsMutation();

  const handleSyncPricing = async () => {
    try {
      const res = await syncPricing().unwrap();
      toast.success(
        `Pricing synced — ${res.data.activePricingVersions} active version(s).`
      );
    } catch {
      toast.error('Pricing sync failed. Check the server logs and try again.');
    }
  };

  const handleBackfill = async () => {
    try {
      const res = await backfillCosts({ mode: 'approximate', onlyMissing: true }).unwrap();
      const s = res.data;
      toast.success(
        `Backfill complete — updated ${s.updated} log(s) across ${s.users} user(s) ` +
          `(${s.approximate} approximate, ${s.unpriced} still unpriced).`
      );
    } catch {
      toast.error(
        'Backfill failed. Make sure pricing has been synced first, then retry.'
      );
    }
  };

  const dateParams = {
    ...(startDate && { startDate }),
    ...(endDate && { endDate }),
  };

  const { data: overview, isLoading: overviewLoading } = useGetLlmOverviewQuery(
    { ...dateParams, interval },
    { skip: tab !== 'overview' }
  );

  const {
    data: users,
    isLoading: usersLoading,
    isFetching: usersFetching,
  } = useGetLlmUserSummaryQuery(
    { page, limit: pageSize, sortBy, sortOrder, ...dateParams, ...(search && { search }) },
    { skip: tab !== 'users' }
  );

  const { data: pricing, isLoading: pricingLoading } = useGetLlmPricingQuery(
    { includeHistory },
    { skip: tab !== 'pricing' }
  );

  const totals = overview?.data?.totals;

  const handleUserRowClick = (row: LlmUserSummaryRow) => {
    setSelectedUser({ id: row.userId, email: row.email });
    setSheetOpen(true);
  };

  const userColumns: DataTableColumn<LlmUserSummaryRow>[] = [
    { id: 'email', header: 'User', cell: (r) => <span className="font-medium">{r.email}</span> },
    { id: 'requests', header: 'Requests', sortable: true, cell: (r) => formatNumber(r.requests) },
    { id: 'totalInputTokens', header: 'Input', sortable: true, cell: (r) => formatNumber(r.totalInputTokens) },
    { id: 'totalOutputTokens', header: 'Output', sortable: true, cell: (r) => formatNumber(r.totalOutputTokens) },
    { id: 'totalTokens', header: 'Total Tokens', sortable: true, cell: (r) => formatNumber(r.totalTokens) },
    {
      id: 'totalCostUsd',
      header: 'Total Cost',
      sortable: true,
      cell: (r) => <span className="font-semibold">{formatCurrency(r.totalCostUsd)}</span>,
    },
    { id: 'lastUsedAt', header: 'Last Used', sortable: true, cell: (r) => <span className="text-xs">{formatDateTime(r.lastUsedAt)}</span> },
  ];

  const pricingColumns: DataTableColumn<LlmPricingRow>[] = [
    { id: 'provider', header: 'Provider', cell: (r) => <Badge variant="secondary">{r.provider}</Badge> },
    { id: 'model', header: 'Model', cell: (r) => <span className="font-mono text-xs">{r.model}</span> },
    { id: 'inputPricePer1M', header: 'Input / 1M', cell: (r) => formatCurrency(r.inputPricePer1M) },
    { id: 'outputPricePer1M', header: 'Output / 1M', cell: (r) => formatCurrency(r.outputPricePer1M) },
    {
      id: 'cacheReadPricePer1M',
      header: 'Cache Read / 1M',
      cell: (r) => (r.cacheReadPricePer1M != null ? formatCurrency(r.cacheReadPricePer1M) : '—'),
    },
    { id: 'currency', header: 'Currency', cell: (r) => r.currency },
    { id: 'source', header: 'Source', cell: (r) => <span className="text-xs">{r.source || '—'}</span> },
    { id: 'effectiveFrom', header: 'Effective From', cell: (r) => <span className="text-xs">{formatDate(r.effectiveFrom)}</span> },
    {
      id: 'active',
      header: 'Status',
      cell: (r) =>
        r.active ? (
          <Badge>Active</Badge>
        ) : (
          <Badge variant="outline" className="text-muted-foreground">
            {formatDate(r.effectiveTo)} (historical)
          </Badge>
        ),
    },
  ];

  const tabs: { id: Tab; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'users', label: 'Users' },
    { id: 'pricing', label: 'Pricing' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">LLM Usage &amp; Costs</h1>
        <p className="text-muted-foreground">
          Token usage and estimated cost across all AI calls. Costs are computed from versioned
          OpenRouter pricing and frozen per request.
        </p>
      </div>

      {/* Date range + interval */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Filters</CardTitle>
          <CardDescription>Filter usage and cost by date range</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Start Date</label>
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">End Date</label>
              <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Trend Interval</label>
              <Select value={interval} onValueChange={(v) => setInterval(v as 'day' | 'month')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">Daily</SelectItem>
                  <SelectItem value="month">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              'border-b-2 px-4 py-2 text-sm font-medium transition-colors',
              tab === t.id
                ? 'border-gray-900 text-gray-900'
                : 'border-transparent text-muted-foreground hover:text-gray-700'
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Overview ─────────────────────────────────────────────── */}
      {tab === 'overview' && (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
            <StatCard
              label="Total Cost"
              value={formatCurrency(totals?.totalCostUsd ?? 0)}
              icon={DollarSign}
              tone="success"
              isLoading={overviewLoading}
            />
            <StatCard
              label="Total Requests"
              value={formatNumber(totals?.requests ?? 0)}
              icon={Activity}
              isLoading={overviewLoading}
            />
            <StatCard
              label="Input Tokens"
              value={formatNumber(totals?.totalInputTokens ?? 0)}
              icon={Hash}
              isLoading={overviewLoading}
            />
            <StatCard
              label="Output Tokens"
              value={formatNumber(totals?.totalOutputTokens ?? 0)}
              icon={Hash}
              isLoading={overviewLoading}
            />
            <StatCard
              label="Total Tokens"
              value={formatNumber(totals?.totalTokens ?? 0)}
              icon={Coins}
              isLoading={overviewLoading}
            />
          </div>

          <TrendChart points={overview?.data?.trend || []} />

          <div className="grid gap-4 lg:grid-cols-2">
            <BreakdownBarChart
              title="Cost by Provider"
              description="Estimated spend grouped by LLM provider"
              rows={overview?.data?.byProvider || []}
              metric="totalCostUsd"
            />
            <BreakdownBarChart
              title="Cost by Model"
              description="Estimated spend grouped by model"
              rows={overview?.data?.byModel || []}
              metric="totalCostUsd"
            />
            <BreakdownBarChart
              title="Cost by Endpoint"
              description="Which AI features cost the most"
              rows={overview?.data?.byEndpoint || []}
              metric="totalCostUsd"
            />
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Top Users by Cost</CardTitle>
                <CardDescription>Highest-spending users in this range</CardDescription>
              </CardHeader>
              <CardContent>
                {(overview?.data?.topUsers || []).length === 0 ? (
                  <p className="py-12 text-center text-sm text-muted-foreground">No usage yet</p>
                ) : (
                  <div className="space-y-2">
                    {overview!.data.topUsers.map((u) => (
                      <div
                        key={u.userId}
                        className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
                      >
                        <span className="flex items-center gap-2">
                          <UsersIcon className="h-4 w-4 text-muted-foreground" />
                          <span className="truncate">{u.email}</span>
                        </span>
                        <span className="flex shrink-0 gap-3">
                          <span className="text-muted-foreground">{formatNumber(u.totalTokens)} tok</span>
                          <span className="font-semibold">{formatCurrency(u.totalCostUsd)}</span>
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* ── Users ────────────────────────────────────────────────── */}
      {tab === 'users' && (
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Search by email…"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setSearch(searchInput.trim());
                  setPage(1);
                }
              }}
              className="max-w-sm"
            />
            <Button
              onClick={() => {
                setSearch(searchInput.trim());
                setPage(1);
              }}
            >
              Search
            </Button>
            {search && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchInput('');
                  setSearch('');
                  setPage(1);
                }}
              >
                Clear
              </Button>
            )}
          </div>

          <DataTable
            columns={userColumns}
            data={users?.data?.items || []}
            total={users?.data?.pagination?.total || 0}
            page={page}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setPage(1);
            }}
            onSortChange={(field, order) => {
              setSortBy(field as SortField);
              setSortOrder(order);
              setPage(1);
            }}
            onRowClick={handleUserRowClick}
            isLoading={usersLoading || usersFetching}
            emptyMessage="No LLM usage recorded for any user in this range"
            showRowNumbers
          />
        </div>
      )}

      {/* ── Pricing ──────────────────────────────────────────────── */}
      {tab === 'pricing' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="max-w-xl text-sm text-muted-foreground">
              Pricing is synced daily from OpenRouter and versioned. Historical usage keeps the
              price that was effective when it was logged.
            </p>
            <div className="flex flex-wrap items-center gap-2">
              {isSuperAdmin && (
                <>
                  <Button variant="outline" size="sm" onClick={handleSyncPricing} disabled={syncing}>
                    {syncing ? 'Syncing…' : 'Sync pricing now'}
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleBackfill} disabled={backfilling}>
                    {backfilling ? 'Backfilling…' : 'Backfill missing costs'}
                  </Button>
                </>
              )}
              <Button
                variant={includeHistory ? 'default' : 'outline'}
                size="sm"
                onClick={() => setIncludeHistory((v) => !v)}
              >
                {includeHistory ? 'Showing history' : 'Show history'}
              </Button>
            </div>
          </div>
          {isSuperAdmin && (
            <p className="text-xs text-muted-foreground">
              Tip: run <strong>Sync pricing now</strong> first (populates current prices), then{' '}
              <strong>Backfill missing costs</strong> to estimate cost for older logs that were
              recorded before pricing existed. Backfilled rows are marked{' '}
              <em>approximate</em>.
            </p>
          )}

          <DataTable
            columns={pricingColumns}
            data={pricing?.data?.items || []}
            total={pricing?.data?.items?.length || 0}
            page={1}
            pageSize={pricing?.data?.items?.length || 1}
            onPageChange={() => {}}
            onSortChange={() => {}}
            isLoading={pricingLoading}
            emptyMessage="No pricing versions yet — run the pricing sync to populate."
          />
        </div>
      )}

      <UserUsageSheet
        userId={selectedUser?.id ?? null}
        email={selectedUser?.email ?? null}
        startDate={startDate || undefined}
        endDate={endDate || undefined}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
      />
    </div>
  );
}
