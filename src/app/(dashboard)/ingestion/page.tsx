"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DataTable, DataTableColumn } from "@/components/data-table";
import { StatCard } from "@/components/StatCard";
import { EmailDetailPanel } from "@/components/EmailDetailPanel";
import {
  useGetIngestionOverviewQuery,
  useGetRetailerBreakdownQuery,
  useGetSkipFailureReasonsQuery,
  useGetIngestionTrendsQuery,
  useGetParserMismatchesQuery,
} from "@/features/ingestion/ingestionApi";
import type { ParserMismatchItem } from "@/types";
import { formatDuration, formatNumber } from "@/lib/format";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Mail,
  Inbox,
  CheckCircle2,
  SkipForward,
  AlertTriangle,
  Timer,
  RefreshCw,
  PackageCheck,
} from "lucide-react";

// ── Pipeline funnel ──────────────────────────────────────────────
const FUNNEL_STAGES: { key: string; label: string }[] = [
  { key: "sentToAirParser", label: "Sent to AirParser" },
  { key: "webhookProcessed", label: "Webhook Processed" },
  { key: "airParserRawItems", label: "Parser Raw Items" },
  { key: "filteredItems", label: "Filtered Items" },
  { key: "itemsCreated", label: "Items Created" },
  { key: "itemsSkipped", label: "Items Skipped" },
];

function FunnelBars({ funnel }: { funnel: Record<string, number> }) {
  const max = Math.max(1, ...FUNNEL_STAGES.map((s) => funnel[s.key] ?? 0));
  return (
    <div className="space-y-3">
      {FUNNEL_STAGES.map((stage) => {
        const value = funnel[stage.key] ?? 0;
        const pct = Math.round((value / max) * 100);
        return (
          <div key={stage.key} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{stage.label}</span>
              <span className="font-medium">{formatNumber(value)}</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function IngestionMonitorPage() {
  const [userIdInput, setUserIdInput] = useState("");
  const [userId, setUserId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [mismatchPage, setMismatchPage] = useState(1);
  const [mismatchPageSize, setMismatchPageSize] = useState(20);
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);

  const filterParams = {
    ...(userId && { userId }),
    ...(startDate && { startDate }),
    ...(endDate && { endDate }),
  };

  const { data: overviewData, isLoading: loadingOverview } =
    useGetIngestionOverviewQuery(filterParams);
  const { data: retailerData, isLoading: loadingRetailers } =
    useGetRetailerBreakdownQuery({ ...filterParams, limit: 50 });
  const { data: skipFailureData, isLoading: loadingSkipFailure } =
    useGetSkipFailureReasonsQuery(filterParams);
  const { data: trendsData, isLoading: loadingTrends } =
    useGetIngestionTrendsQuery(filterParams);
  const {
    data: mismatchData,
    isLoading: loadingMismatches,
    isFetching: fetchingMismatches,
  } = useGetParserMismatchesQuery({
    ...filterParams,
    page: mismatchPage,
    limit: mismatchPageSize,
  });

  const overview = overviewData?.data;
  const totals = overview?.totals;
  const funnel = overview?.funnel;
  const quality = overview?.quality;
  const sync = overview?.sync;

  const retailers = retailerData?.data?.items ?? [];
  const skipReasons = skipFailureData?.data?.skipReasons ?? [];
  const failureReasons = skipFailureData?.data?.failureReasons ?? [];
  const blocked = skipFailureData?.data?.blockedCounters;
  const daily = trendsData?.data?.daily ?? [];
  const syncHealth = trendsData?.data?.syncHealth ?? [];

  const mismatchSummary = mismatchData?.data?.summary;
  const mismatchItems = mismatchData?.data?.items ?? [];
  const mismatchTotal = mismatchData?.data?.pagination?.total ?? 0;

  const applyUserId = () => {
    setUserId(userIdInput.trim());
    setMismatchPage(1);
  };

  const blockedTiles = blocked
    ? [
        { label: "Blocked · Keywords", value: blocked.blockedByKeywords },
        { label: "Blocked · Order Pre-filter", value: blocked.blockedByOrderPreFilter },
        { label: "Blocked · Non-purchase", value: blocked.blockedByNonPurchaseFilter },
        { label: "Blocked · ClassifyMail", value: blocked.blockedByClassifyMail },
        { label: "Already Processed", value: blocked.alreadyProcessed },
        { label: "ClassifyMail Failed", value: blocked.classifyMailFailed },
      ]
    : [];

  const mismatchColumns: DataTableColumn<ParserMismatchItem>[] = [
    {
      id: "subject",
      header: "Email",
      cell: (row) => (
        <div className="max-w-[260px]">
          <p className="truncate font-medium">{row.subject || "(no subject)"}</p>
          <p className="truncate text-xs text-muted-foreground">{row.from || "—"}</p>
        </div>
      ),
    },
    {
      id: "category",
      header: "Category",
      cell: (row) =>
        row.classifyMailCategory ? (
          <Badge variant="outline">{row.classifyMailCategory}</Badge>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
    {
      id: "aiVsParser",
      header: "AI → Parser",
      cell: (row) => (
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm">
            {row.extractedItemCount} → {row.airParserRawItemCount}
          </span>
          {row.aiVsParserMismatch && <Badge variant="destructive">mismatch</Badge>}
        </div>
      ),
    },
    {
      id: "drop",
      header: "Created / Dropped",
      cell: (row) => (
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm">{row.itemsCreatedCount} created</span>
          {row.parserVsCreatedDrop > 0 && (
            <Badge variant="secondary">-{row.parserVsCreatedDrop}</Badge>
          )}
        </div>
      ),
    },
    {
      id: "webhook",
      header: "Webhook",
      cell: (row) => (
        <Badge variant={row.webhookProcessed ? "default" : "destructive"}>
          {row.webhookProcessed ? "processed" : "missing"}
        </Badge>
      ),
    },
    {
      id: "createdAt",
      header: "Date",
      cell: (row) => new Date(row.createdAt).toLocaleDateString(),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Ingestion Monitor</h1>
        <p className="text-muted-foreground">
          Email receipt ingestion pipeline health, retailer breakdown, and parser QA
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>
            Scope the pipeline metrics to a specific user and/or date range
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">User ID</label>
              <div className="flex gap-2">
                <Input
                  placeholder="Mongo user _id (optional)"
                  value={userIdInput}
                  onChange={(e) => setUserIdInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && applyUserId()}
                />
                <Button onClick={applyUserId}>Apply</Button>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Start Date</label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setMismatchPage(1);
                }}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">End Date</label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setMismatchPage(1);
                }}
              />
            </div>
          </div>
          {userId && (
            <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
              <span>Filtering by user:</span>
              <Badge variant="secondary" className="font-mono">{userId}</Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setUserId("");
                  setUserIdInput("");
                  setMismatchPage(1);
                }}
              >
                Clear
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Overview tiles */}
      <div>
        <h2 className="mb-4 text-xl font-semibold">Overview</h2>
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
          <StatCard
            label="Gmail API Returned"
            value={formatNumber(totals?.gmailApiReturned ?? 0)}
            icon={Mail}
            isLoading={loadingOverview}
            hint="Emails Gmail returned pre-filter"
          />
          <StatCard
            label="Emails Processed Log"
            value={formatNumber(totals?.totalEmails ?? 0)}
            icon={Inbox}
            isLoading={loadingOverview}
            hint="Rows in processing log"
          />
          <StatCard
            label="Processed"
            value={formatNumber(totals?.processed ?? 0)}
            icon={CheckCircle2}
            tone="success"
            isLoading={loadingOverview}
          />
          <StatCard
            label="Skipped"
            value={formatNumber(totals?.skipped ?? 0)}
            icon={SkipForward}
            tone="warning"
            isLoading={loadingOverview}
          />
          <StatCard
            label="Errored"
            value={formatNumber(totals?.errored ?? 0)}
            icon={AlertTriangle}
            tone="danger"
            isLoading={loadingOverview}
          />
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-4">
          <StatCard
            label="Avg Processing Time"
            value={formatDuration(quality?.avgProcessingMs ?? null)}
            icon={Timer}
            isLoading={loadingOverview}
          />
          <StatCard
            label="Sync Runs"
            value={formatNumber(sync?.totalSyncRuns ?? 0)}
            icon={RefreshCw}
            isLoading={loadingOverview}
          />
          <StatCard
            label="Avg Sync Duration"
            value={formatDuration(sync?.avgSyncDurationMs ?? null)}
            icon={Timer}
            isLoading={loadingOverview}
          />
          <StatCard
            label="AI Fallbacks Used"
            value={formatNumber(
              (quality?.usedClassifyFallback ?? 0) + (quality?.usedAiItemsFallback ?? 0)
            )}
            icon={PackageCheck}
            isLoading={loadingOverview}
            hint="classify + items fallbacks"
          />
        </div>
      </div>

      {/* Funnel + trend */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Pipeline Funnel</CardTitle>
            <CardDescription>Item flow from AirParser to closet</CardDescription>
          </CardHeader>
          <CardContent>
            {funnel ? (
              <FunnelBars funnel={funnel as unknown as Record<string, number>} />
            ) : (
              <p className="text-sm text-muted-foreground">No data</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Daily Ingestion Trend</CardTitle>
            <CardDescription>Emails processed, skipped, and items created</CardDescription>
          </CardHeader>
          <CardContent>
            {daily.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={daily}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="processed" name="Processed" fill="#10b981" />
                  <Bar dataKey="skipped" name="Skipped" fill="#f59e0b" />
                  <Bar dataKey="itemsCreated" name="Items Created" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="py-12 text-center text-sm text-muted-foreground">
                {loadingTrends ? "Loading trend…" : "No ingestion activity in range"}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Sync health */}
      <Card>
        <CardHeader>
          <CardTitle>Sync Run Health</CardTitle>
          <CardDescription>Sync runs grouped by completion status</CardDescription>
        </CardHeader>
        <CardContent>
          {syncHealth.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-3">
              {syncHealth.map((run) => (
                <div key={run.status ?? "unknown"} className="rounded-lg border p-4">
                  <div className="flex items-center justify-between">
                    <Badge
                      variant={
                        run.status === "completed"
                          ? "default"
                          : run.status === "failed"
                            ? "destructive"
                            : "secondary"
                      }
                    >
                      {run.status ?? "unknown"}
                    </Badge>
                    <span className="text-2xl font-bold">{formatNumber(run.runs)}</span>
                  </div>
                  <div className="mt-3 space-y-1 text-sm text-muted-foreground">
                    <p>Avg duration: {formatDuration(run.avgDurationMs)}</p>
                    <p>Gmail emails: {formatNumber(run.gmailApiEmails)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              {loadingTrends ? "Loading…" : "No sync runs in range"}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Retailer breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Retailer Breakdown</CardTitle>
          <CardDescription>Volume and outcomes grouped by sender domain</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Retailer</TableHead>
                <TableHead className="text-right">Emails</TableHead>
                <TableHead className="text-right">Processed</TableHead>
                <TableHead className="text-right">Skipped</TableHead>
                <TableHead className="text-right">Items Created</TableHead>
                <TableHead>Categories</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {retailers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                    {loadingRetailers ? "Loading…" : "No retailer data in range"}
                  </TableCell>
                </TableRow>
              ) : (
                retailers.map((r, idx) => (
                  <TableRow key={r.retailer ?? `unknown-${idx}`}>
                    <TableCell className="font-medium">{r.retailer || "(unknown)"}</TableCell>
                    <TableCell className="text-right">{formatNumber(r.emails)}</TableCell>
                    <TableCell className="text-right text-emerald-600">
                      {formatNumber(r.processed)}
                    </TableCell>
                    <TableCell className="text-right text-amber-600">
                      {formatNumber(r.skipped)}
                    </TableCell>
                    <TableCell className="text-right">{formatNumber(r.itemsCreated)}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {r.categories
                          .filter((c): c is string => Boolean(c))
                          .slice(0, 4)
                          .map((c) => (
                            <Badge key={c} variant="outline" className="text-xs">
                              {c}
                            </Badge>
                          ))}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Skip & failure reasons */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Skip Reasons</CardTitle>
            <CardDescription>Why emails were skipped before item creation</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Reason</TableHead>
                  <TableHead className="text-right">Count</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {skipReasons.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={2} className="py-6 text-center text-muted-foreground">
                      {loadingSkipFailure ? "Loading…" : "No skips in range"}
                    </TableCell>
                  </TableRow>
                ) : (
                  skipReasons.map((s, idx) => (
                    <TableRow key={s.reason ?? `none-${idx}`}>
                      <TableCell>{s.reason || "(no reason recorded)"}</TableCell>
                      <TableCell className="text-right font-medium">
                        {formatNumber(s.count)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Failure Reasons</CardTitle>
            <CardDescription>ClassifyMail / extractClothing errors</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Error</TableHead>
                  <TableHead className="text-right">Count</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {failureReasons.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={2} className="py-6 text-center text-muted-foreground">
                      {loadingSkipFailure ? "Loading…" : "No failures in range"}
                    </TableCell>
                  </TableRow>
                ) : (
                  failureReasons.map((f, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="text-sm">
                        {f.classifyMailError || f.extractClothingError || "(unknown error)"}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatNumber(f.count)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Blocked counters */}
      {blockedTiles.length > 0 && (
        <div>
          <h2 className="mb-4 text-xl font-semibold">Pre-filter Block Counters</h2>
          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
            {blockedTiles.map((tile) => (
              <StatCard
                key={tile.label}
                label={tile.label}
                value={formatNumber(tile.value)}
                isLoading={loadingSkipFailure}
              />
            ))}
          </div>
        </div>
      )}

      {/* Parser mismatches */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Parser Mismatches</h2>
            <p className="text-sm text-muted-foreground">
              Emails where pipeline stages disagree on item counts or the webhook never ran.
              Click a row for full processing detail.
            </p>
          </div>
        </div>

        {mismatchSummary && (
          <div className="mb-4 grid gap-4 md:grid-cols-4">
            <StatCard
              label="Sent to AirParser"
              value={formatNumber(mismatchSummary.totalSentToAirParser)}
            />
            <StatCard
              label="Webhook Missing"
              value={formatNumber(mismatchSummary.notWebhookProcessed)}
              tone="danger"
            />
            <StatCard
              label="Count Mismatches"
              value={formatNumber(mismatchSummary.countMismatch)}
              tone="warning"
            />
            <StatCard
              label="Items Dropped at Create"
              value={formatNumber(mismatchSummary.itemsDroppedAtCreate)}
              tone="warning"
            />
          </div>
        )}

        <DataTable
          columns={mismatchColumns}
          data={mismatchItems}
          total={mismatchTotal}
          page={mismatchPage}
          pageSize={mismatchPageSize}
          onPageChange={setMismatchPage}
          onPageSizeChange={(size) => {
            setMismatchPageSize(size);
            setMismatchPage(1);
          }}
          onSortChange={() => {
            /* backend uses a fixed mismatch sort */
          }}
          onRowClick={(row) => setSelectedMessageId(row.gmailMessageId)}
          isLoading={loadingMismatches || fetchingMismatches}
          emptyMessage="No parser mismatches in range"
        />
      </div>

      <EmailDetailPanel
        gmailMessageId={selectedMessageId}
        onClose={() => setSelectedMessageId(null)}
      />
    </div>
  );
}
