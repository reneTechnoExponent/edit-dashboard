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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  useGetEmailSyncLogsQuery,
  useGetEmailProcessingLogsQuery,
  useGetEmailSyncSummaryQuery,
} from "@/features/emailLogs/emailLogsApi";
import type { EmailProcessingLog, EmailSyncLog, LogUserRef } from "@/types";
import { formatDateTime, formatDuration, formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { RefreshCw, Inbox, ListFilter, X } from "lucide-react";

type LogView = "sync" | "processing" | "summary";

const VIEWS: { key: LogView; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: "sync", label: "Sync Runs", icon: RefreshCw },
  { key: "processing", label: "Processing Logs", icon: Inbox },
  { key: "summary", label: "Summary", icon: ListFilter },
];

function userEmailOf(user: string | LogUserRef | null | undefined, fallback?: string | null): string {
  if (user && typeof user !== "string") return user.email || user._id;
  if (typeof user === "string" && fallback) return fallback;
  return fallback || "—";
}

function userIdOf(user: string | LogUserRef | null | undefined): string | null {
  if (!user) return null;
  return typeof user === "string" ? user : user._id;
}

function syncStatusVariant(status: EmailSyncLog["status"]): "default" | "destructive" | "secondary" {
  if (status === "completed") return "default";
  if (status === "failed") return "destructive";
  return "secondary";
}

export default function EmailLogsPage() {
  const [view, setView] = useState<LogView>("sync");

  // Shared filters
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [userId, setUserId] = useState("");
  const [userIdEmailLabel, setUserIdEmailLabel] = useState<string | null>(null);

  // Sync-view filter
  const [emailInput, setEmailInput] = useState("");
  const [userEmail, setUserEmail] = useState("");

  // Processing-view filters
  const [msgIdInput, setMsgIdInput] = useState("");
  const [gmailMessageId, setGmailMessageId] = useState("");
  const [categoryInput, setCategoryInput] = useState("");
  const [category, setCategory] = useState("");
  const [skipReasonInput, setSkipReasonInput] = useState("");
  const [skipReason, setSkipReason] = useState("");
  const [skippedOnly, setSkippedOnly] = useState(false);

  // Pagination
  const [syncPage, setSyncPage] = useState(1);
  const [syncPageSize, setSyncPageSize] = useState(20);
  const [procPage, setProcPage] = useState(1);
  const [procPageSize, setProcPageSize] = useState(20);

  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);

  const dateParams = {
    ...(startDate && { startDate }),
    ...(endDate && { endDate }),
  };

  const { data: syncData, isLoading: loadingSync, isFetching: fetchingSync } =
    useGetEmailSyncLogsQuery(
      {
        ...dateParams,
        ...(userId && { userId }),
        ...(userEmail && { userEmail }),
        page: syncPage,
        limit: syncPageSize,
      },
      { skip: view !== "sync" }
    );

  const { data: procData, isLoading: loadingProc, isFetching: fetchingProc } =
    useGetEmailProcessingLogsQuery(
      {
        ...dateParams,
        ...(userId && { userId }),
        ...(gmailMessageId && { gmailMessageId }),
        ...(category && { category }),
        ...(skipReason && { skipReason }),
        ...(skippedOnly && { skippedOnly: "true" }),
        page: procPage,
        limit: procPageSize,
      },
      { skip: view !== "processing" }
    );

  const { data: summaryData, isLoading: loadingSummary } = useGetEmailSyncSummaryQuery(
    { ...dateParams, ...(userId && { userId }) },
    { skip: view !== "summary" }
  );

  const drillToUser = (id: string | null, email: string | null) => {
    if (!id) {
      toast.error("This log has no linked user to drill into");
      return;
    }
    setUserId(id);
    setUserIdEmailLabel(email);
    setView("processing");
    setProcPage(1);
    toast.success(`Filtered processing logs to ${email || id}`);
  };

  const clearUserId = () => {
    setUserId("");
    setUserIdEmailLabel(null);
  };

  // ── Sync Runs columns ──
  const syncColumns: DataTableColumn<EmailSyncLog>[] = [
    {
      id: "user",
      header: "User",
      cell: (row) => (
        <span className="font-medium">{userEmailOf(row.user, row.userEmail)}</span>
      ),
    },
    {
      id: "status",
      header: "Status",
      cell: (row) => <Badge variant={syncStatusVariant(row.status)}>{row.status}</Badge>,
    },
    {
      id: "gmail",
      header: "Gmail Emails",
      cell: (row) => formatNumber(row.gmailApiTotalEmails),
    },
    {
      id: "outcome",
      header: "Processed / Skipped / Failed",
      cell: (row) => (
        <span className="font-mono text-sm">
          <span className="text-emerald-600">{row.emailsProcessed}</span>
          {" / "}
          <span className="text-amber-600">{row.emailsSkipped}</span>
          {" / "}
          <span className="text-destructive">{row.emailsFailed}</span>
        </span>
      ),
    },
    {
      id: "duration",
      header: "Duration",
      cell: (row) => formatDuration(row.syncDurationMs),
    },
    {
      id: "date",
      header: "Started",
      cell: (row) => formatDateTime(row.syncStartedAt ?? row.createdAt),
    },
  ];

  // ── Processing Logs columns ──
  const procColumns: DataTableColumn<EmailProcessingLog>[] = [
    {
      id: "email",
      header: "Email",
      cell: (row) => (
        <div className="max-w-[280px]">
          <p className="truncate font-medium">{row.subject || "(no subject)"}</p>
          <p className="truncate text-xs text-muted-foreground">{row.from || "—"}</p>
        </div>
      ),
    },
    {
      id: "user",
      header: "User",
      cell: (row) => (
        <span className="text-sm">{userEmailOf(row.user)}</span>
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
      id: "status",
      header: "Status",
      cell: (row) => {
        if (row.classifyMailError || row.extractClothingError) {
          return <Badge variant="destructive">error</Badge>;
        }
        if (row.wasSkipped) return <Badge variant="secondary">skipped</Badge>;
        return <Badge variant="default">processed</Badge>;
      },
    },
    {
      id: "items",
      header: "Items Created",
      cell: (row) => formatNumber(row.itemsCreatedCount),
    },
    {
      id: "date",
      header: "Date",
      cell: (row) => formatDateTime(row.createdAt),
    },
  ];

  const perUser = summaryData?.data?.perUser ?? [];
  const categoryDist = summaryData?.data?.categoryDistribution ?? [];
  const skipReasonDist = summaryData?.data?.skipReasonDistribution ?? [];
  const tabAnalysis = summaryData?.data?.tabAnalysis;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Email Logs</h1>
        <p className="text-muted-foreground">
          Gmail sync runs, per-email processing logs, and per-user ingestion summary
        </p>
      </div>

      {/* View switcher */}
      <div className="inline-flex rounded-lg border bg-muted/40 p-1">
        {VIEWS.map((v) => {
          const Icon = v.icon;
          const active = view === v.key;
          return (
            <button
              key={v.key}
              type="button"
              onClick={() => setView(v.key)}
              className={cn(
                "flex items-center gap-2 rounded-md px-4 py-1.5 text-sm font-medium transition-colors",
                active ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {v.label}
            </button>
          );
        })}
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>
            {view === "sync"
              ? "Filter sync runs by user email and date range"
              : view === "processing"
                ? "Filter per-email logs by message, category, skip reason, and date"
                : "Aggregate summary scoped by user and date range"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            {view === "sync" && (
              <div className="space-y-2">
                <label className="text-sm font-medium">User Email</label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Search by email…"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        setUserEmail(emailInput.trim());
                        setSyncPage(1);
                      }
                    }}
                  />
                  <Button
                    onClick={() => {
                      setUserEmail(emailInput.trim());
                      setSyncPage(1);
                    }}
                  >
                    Search
                  </Button>
                </div>
              </div>
            )}

            {view === "processing" && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Gmail Message ID</label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Exact message id…"
                    value={msgIdInput}
                    onChange={(e) => setMsgIdInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        setGmailMessageId(msgIdInput.trim());
                        setProcPage(1);
                      }
                    }}
                  />
                  <Button
                    onClick={() => {
                      setGmailMessageId(msgIdInput.trim());
                      setProcPage(1);
                    }}
                  >
                    Find
                  </Button>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">Start Date</label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setSyncPage(1);
                  setProcPage(1);
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
                  setSyncPage(1);
                  setProcPage(1);
                }}
              />
            </div>
          </div>

          {view === "processing" && (
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <div className="flex gap-2">
                  <Input
                    placeholder="classifyMail category…"
                    value={categoryInput}
                    onChange={(e) => setCategoryInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        setCategory(categoryInput.trim());
                        setProcPage(1);
                      }
                    }}
                  />
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setCategory(categoryInput.trim());
                      setProcPage(1);
                    }}
                  >
                    Apply
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Skip Reason</label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Partial skip reason…"
                    value={skipReasonInput}
                    onChange={(e) => setSkipReasonInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        setSkipReason(skipReasonInput.trim());
                        setProcPage(1);
                      }
                    }}
                  />
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setSkipReason(skipReasonInput.trim());
                      setProcPage(1);
                    }}
                  >
                    Apply
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Show</label>
                <Select
                  value={skippedOnly ? "skipped" : "all"}
                  onValueChange={(value) => {
                    setSkippedOnly(value === "skipped");
                    setProcPage(1);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All emails</SelectItem>
                    <SelectItem value="skipped">Skipped only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {userId && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Scoped to user:</span>
              <Badge variant="secondary" className="font-mono">
                {userIdEmailLabel || userId}
              </Badge>
              <Button variant="ghost" size="sm" onClick={clearUserId}>
                <X className="mr-1 h-3 w-3" /> Clear
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sync Runs view */}
      {view === "sync" && (
        <DataTable
          columns={syncColumns}
          data={syncData?.data?.items ?? []}
          total={syncData?.data?.pagination?.total ?? 0}
          page={syncPage}
          pageSize={syncPageSize}
          onPageChange={setSyncPage}
          onPageSizeChange={(size) => {
            setSyncPageSize(size);
            setSyncPage(1);
          }}
          onSortChange={() => {
            /* backend sorts by createdAt desc */
          }}
          onRowClick={(row) => drillToUser(userIdOf(row.user), userEmailOf(row.user, row.userEmail))}
          isLoading={loadingSync || fetchingSync}
          emptyMessage="No sync runs found"
          showRowNumbers
        />
      )}

      {/* Processing Logs view */}
      {view === "processing" && (
        <DataTable
          columns={procColumns}
          data={procData?.data?.items ?? []}
          total={procData?.data?.pagination?.total ?? 0}
          page={procPage}
          pageSize={procPageSize}
          onPageChange={setProcPage}
          onPageSizeChange={(size) => {
            setProcPageSize(size);
            setProcPage(1);
          }}
          onSortChange={() => {
            /* backend sorts by createdAt desc */
          }}
          onRowClick={(row) => setSelectedMessageId(row.gmailMessageId)}
          isLoading={loadingProc || fetchingProc}
          emptyMessage="No processing logs found"
          showRowNumbers
        />
      )}

      {/* Summary view */}
      {view === "summary" && (
        <div className="space-y-4">
          {tabAnalysis && (
            <Card>
              <CardHeader>
                <CardTitle>Gmail Query Tab Analysis</CardTitle>
                <CardDescription>{tabAnalysis.note}</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-6">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">Included</p>
                  <div className="flex flex-wrap gap-1">
                    {tabAnalysis.includedCategories.map((c) => (
                      <Badge key={c} variant="default">{c}</Badge>
                    ))}
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">Excluded</p>
                  <div className="flex flex-wrap gap-1">
                    {tabAnalysis.excludedCategories.map((c) => (
                      <Badge key={c} variant="secondary">{c}</Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Category Distribution</CardTitle>
                <CardDescription>classifyMail categories across processed emails</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Category</TableHead>
                      <TableHead className="text-right">Count</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {categoryDist.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={2} className="py-6 text-center text-muted-foreground">
                          {loadingSummary ? "Loading…" : "No data in range"}
                        </TableCell>
                      </TableRow>
                    ) : (
                      categoryDist.map((c, idx) => (
                        <TableRow key={c._id ?? `none-${idx}`}>
                          <TableCell>{c._id || "(uncategorized)"}</TableCell>
                          <TableCell className="text-right font-medium">
                            {formatNumber(c.count)}
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
                <CardTitle>Skip Reason Distribution</CardTitle>
                <CardDescription>Why emails were skipped</CardDescription>
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
                    {skipReasonDist.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={2} className="py-6 text-center text-muted-foreground">
                          {loadingSummary ? "Loading…" : "No skips in range"}
                        </TableCell>
                      </TableRow>
                    ) : (
                      skipReasonDist.map((s, idx) => (
                        <TableRow key={s._id ?? `none-${idx}`}>
                          <TableCell>{s._id || "(no reason)"}</TableCell>
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
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Per-User Sync Summary</CardTitle>
              <CardDescription>
                Aggregated sync outcomes per user. Click a row to view that user&apos;s processing logs.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead className="text-right">Sync Runs</TableHead>
                    <TableHead className="text-right">Gmail Emails</TableHead>
                    <TableHead className="text-right">Processed</TableHead>
                    <TableHead className="text-right">Skipped</TableHead>
                    <TableHead className="text-right">Failed</TableHead>
                    <TableHead>Last Sync</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {perUser.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                        {loadingSummary ? "Loading…" : "No sync activity in range"}
                      </TableCell>
                    </TableRow>
                  ) : (
                    perUser.map((u, idx) => (
                      <TableRow
                        key={u._id ?? `none-${idx}`}
                        className="cursor-pointer"
                        onClick={() => drillToUser(u._id, u.userEmail)}
                      >
                        <TableCell className="font-medium">{u.userEmail || u._id || "—"}</TableCell>
                        <TableCell className="text-right">{formatNumber(u.totalSyncRuns)}</TableCell>
                        <TableCell className="text-right">{formatNumber(u.totalGmailApiEmails)}</TableCell>
                        <TableCell className="text-right text-emerald-600">
                          {formatNumber(u.totalProcessed)}
                        </TableCell>
                        <TableCell className="text-right text-amber-600">
                          {formatNumber(u.totalSkipped)}
                        </TableCell>
                        <TableCell className="text-right text-destructive">
                          {formatNumber(u.totalFailed)}
                        </TableCell>
                        <TableCell>{formatDateTime(u.lastSyncAt)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}

      <EmailDetailPanel
        gmailMessageId={selectedMessageId}
        onClose={() => setSelectedMessageId(null)}
      />
    </div>
  );
}
