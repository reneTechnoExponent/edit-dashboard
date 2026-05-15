"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Activity,
  Bookmark,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Repeat,
  RefreshCw,
  Sparkles,
  Wand2,
} from "lucide-react";
import {
  useGetUserAnalyticsSummaryQuery,
  useGetUserEventsQuery,
} from "@/features/analytics/analyticsApi";
import type {
  AnalyticsEventEntry,
  AnalyticsEventType,
  AnalyticsUserStatsRow,
} from "@/types";

interface UserAnalyticsDialogProps {
  user: AnalyticsUserStatsRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  startDate?: string;
  endDate?: string;
}

const EVENT_TYPE_LABELS: Record<AnalyticsEventType, string> = {
  outfit_generated: "Generated",
  outfit_saved: "Saved",
  item_swapped: "Swapped",
  regenerate_triggered: "Regenerated",
  manual_outfit_created: "Manual",
};

const EVENT_TYPE_ICONS: Record<AnalyticsEventType, React.ComponentType<{ className?: string }>> = {
  outfit_generated: Sparkles,
  outfit_saved: Bookmark,
  item_swapped: Repeat,
  regenerate_triggered: RefreshCw,
  manual_outfit_created: Wand2,
};

const EVENT_TYPE_BADGE: Record<AnalyticsEventType, string> = {
  outfit_generated: "bg-blue-100 text-blue-800 hover:bg-blue-100",
  outfit_saved: "bg-emerald-100 text-emerald-800 hover:bg-emerald-100",
  item_swapped: "bg-amber-100 text-amber-800 hover:bg-amber-100",
  regenerate_triggered: "bg-purple-100 text-purple-800 hover:bg-purple-100",
  manual_outfit_created: "bg-pink-100 text-pink-800 hover:bg-pink-100",
};

const EVENT_TYPE_OPTIONS: AnalyticsEventType[] = [
  "outfit_generated",
  "outfit_saved",
  "item_swapped",
  "regenerate_triggered",
  "manual_outfit_created",
];

const formatDateTime = (value: string | null | undefined) => {
  if (!value) return "—";
  return new Date(value).toLocaleString();
};

const renderEventDetail = (evt: AnalyticsEventEntry) => {
  if (evt.event_type === "item_swapped") {
    return (
      <div className="space-y-1 text-xs">
        <div>
          <span className="text-muted-foreground">Category:</span>{" "}
          <span className="font-medium">{evt.data.category || "—"}</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="rounded bg-muted px-2 py-0.5">
            {evt.data.original_item?.title || evt.data.original_item_id || "?"}
          </span>
          <span>→</span>
          <span className="rounded bg-muted px-2 py-0.5">
            {evt.data.new_item?.title || evt.data.new_item_id || "?"}
          </span>
        </div>
      </div>
    );
  }

  if (evt.event_type === "regenerate_triggered") {
    return (
      <div className="text-xs">
        <span className="text-muted-foreground">Type:</span>{" "}
        <span className="font-medium capitalize">{evt.data.type || "—"}</span>
        {evt.data.category ? (
          <>
            {" · "}
            <span className="text-muted-foreground">Category:</span>{" "}
            <span className="font-medium">{evt.data.category}</span>
          </>
        ) : null}
      </div>
    );
  }

  // outfit_generated, outfit_saved, manual_outfit_created — list item_ids
  if (evt.data.item_ids.length === 0) {
    return <span className="text-xs text-muted-foreground">No items</span>;
  }
  return (
    <div className="flex flex-wrap gap-1">
      {evt.data.item_ids.slice(0, 6).map((entry, idx) => (
        <span
          key={`${entry.item_id || "missing"}-${idx}`}
          title={entry.item_id || ""}
          className="inline-flex items-center gap-1 rounded border border-border bg-muted px-2 py-0.5 text-xs"
        >
          <span className="max-w-[140px] truncate">
            {entry.item?.title || entry.item_id?.slice(-6) || "?"}
          </span>
          <Badge
            variant="outline"
            className="h-4 px-1 text-[10px] font-normal"
          >
            {entry.is_from_closet ? "closet" : "rec"}
          </Badge>
        </span>
      ))}
      {evt.data.item_ids.length > 6 ? (
        <span className="text-xs text-muted-foreground">
          +{evt.data.item_ids.length - 6} more
        </span>
      ) : null}
    </div>
  );
};

const renderLinkedEvent = (evt: AnalyticsEventEntry) => {
  if (!evt.outfit) {
    return (
      <span className="font-mono text-xs text-muted-foreground">
        {evt.outfit_id ? evt.outfit_id.slice(-8) : "—"}
      </span>
    );
  }
  if (!evt.outfit.event) {
    return (
      <span className="text-xs text-muted-foreground">
        {evt.outfit.kind === "savedOutfit" ? "Saved outfit" : "Recommendation"} (no event)
      </span>
    );
  }
  return (
    <div className="flex items-start gap-1.5">
      <Calendar className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
      <div className="space-y-0.5">
        <div className="text-xs font-medium">{evt.outfit.event.title}</div>
        <div className="text-[11px] text-muted-foreground">
          {formatDateTime(evt.outfit.event.startTime)}
        </div>
        <Badge variant="outline" className="h-4 px-1 text-[10px] font-normal">
          {evt.outfit.event.source}
        </Badge>
      </div>
    </div>
  );
};

export function UserAnalyticsDialog({
  user,
  open,
  onOpenChange,
  startDate,
  endDate,
}: UserAnalyticsDialogProps) {
  const [eventTypeFilter, setEventTypeFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const limit = 20;

  const dateParams = {
    ...(startDate ? { startDate } : {}),
    ...(endDate ? { endDate } : {}),
  };

  const userId = user?._id ?? "";

  const { data: summary, isLoading: isLoadingSummary } =
    useGetUserAnalyticsSummaryQuery({ userId, ...dateParams }, { skip: !userId });

  const { data: eventsResp, isLoading: isLoadingEvents, isFetching: isFetchingEvents } =
    useGetUserEventsQuery(
      {
        userId,
        page,
        limit,
        ...(eventTypeFilter !== "all"
          ? { eventType: eventTypeFilter as AnalyticsEventType }
          : {}),
        ...dateParams,
      },
      { skip: !userId },
    );

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setPage(1);
      setEventTypeFilter("all");
    }
    onOpenChange(next);
  };

  const data = summary?.data;
  const events = eventsResp?.data?.items ?? [];
  const pagination = eventsResp?.data?.pagination;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-[calc(100%-2rem)] overflow-y-auto sm:max-w-5xl">
        <DialogHeader>
          <DialogTitle>User Analytics</DialogTitle>
          <DialogDescription>
            {user?.email ?? "—"} · raw event history with item, outfit, and calendar links
          </DialogDescription>
        </DialogHeader>

        {/* Summary KPIs */}
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-medium">Total Events</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoadingSummary ? (
                  <Skeleton className="h-7 w-16" />
                ) : (
                  (data?.totalEvents ?? 0).toLocaleString()
                )}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-medium">Save Rate</CardTitle>
              <Bookmark className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoadingSummary ? (
                  <Skeleton className="h-7 w-16" />
                ) : (
                  `${((data?.saveRate ?? 0) * 100).toFixed(1)}%`
                )}
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground">saved / generated</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="space-y-0 pb-2">
              <CardTitle className="text-xs font-medium">First Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm font-medium">
                {isLoadingSummary ? <Skeleton className="h-5 w-32" /> : formatDateTime(data?.firstEventAt)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="space-y-0 pb-2">
              <CardTitle className="text-xs font-medium">Last Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm font-medium">
                {isLoadingSummary ? <Skeleton className="h-5 w-32" /> : formatDateTime(data?.lastEventAt)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Per-event-type counts */}
        <div className="grid gap-3 sm:grid-cols-3 md:grid-cols-5">
          {EVENT_TYPE_OPTIONS.map((eventType) => {
            const Icon = EVENT_TYPE_ICONS[eventType];
            const count = data?.eventsByType[eventType] ?? 0;
            return (
              <Card key={eventType}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs font-medium">
                    {EVENT_TYPE_LABELS[eventType]}
                  </CardTitle>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl font-bold">
                    {isLoadingSummary ? <Skeleton className="h-6 w-10" /> : count.toLocaleString()}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Linked entities */}
        <div className="grid gap-3 sm:grid-cols-2">
          <Card>
            <CardHeader className="space-y-0 pb-2">
              <CardTitle className="text-xs font-medium">Linked Outfit Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold">
                {isLoadingSummary ? (
                  <Skeleton className="h-6 w-12" />
                ) : (
                  (data?.linkedOutfitCount ?? 0).toLocaleString()
                )}
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground">
                Distinct outfit_id values from generated/regenerated events
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="space-y-0 pb-2">
              <CardTitle className="text-xs font-medium">Saved Outfits</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold">
                {isLoadingSummary ? (
                  <Skeleton className="h-6 w-12" />
                ) : (
                  (data?.linkedSavedOutfitCount ?? 0).toLocaleString()
                )}
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground">
                Distinct outfit_id values from outfit_saved events
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Top items */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top Saved Items</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingSummary ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-8 w-full" />
                ))}
              </div>
            ) : !data?.topItems || data.topItems.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No saved-outfit items in this window.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>Item</TableHead>
                    <TableHead>Item ID</TableHead>
                    <TableHead className="text-right">Saves</TableHead>
                    <TableHead className="text-right">From Closet</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.topItems.map((item, index) => (
                    <TableRow key={item.item_id}>
                      <TableCell className="font-medium">{index + 1}</TableCell>
                      <TableCell>{item.title || "—"}</TableCell>
                      <TableCell className="font-mono text-[11px]">
                        {item.item_id.slice(-8)}
                      </TableCell>
                      <TableCell className="text-right">{item.count}</TableCell>
                      <TableCell className="text-right">{item.fromCloset}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Separator />

        {/* Event timeline (raw events) */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-base">Event Timeline</CardTitle>
              <p className="text-xs text-muted-foreground">
                Raw events with server timestamps · reconstructs the user journey
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Select
                value={eventTypeFilter}
                onValueChange={(value) => {
                  setEventTypeFilter(value);
                  setPage(1);
                }}
              >
                <SelectTrigger className="h-8 w-[200px] text-xs">
                  <SelectValue placeholder="All event types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All event types</SelectItem>
                  {EVENT_TYPE_OPTIONS.map((eventType) => (
                    <SelectItem key={eventType} value={eventType}>
                      {EVENT_TYPE_LABELS[eventType]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {isLoadingEvents ? (
              <div className="space-y-2">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : events.length === 0 ? (
              <p className="text-sm text-muted-foreground">No events in this window.</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[140px]">Type</TableHead>
                      <TableHead className="w-[170px]">Timestamp</TableHead>
                      <TableHead>Items / Detail</TableHead>
                      <TableHead className="w-[220px]">Linked Calendar Event</TableHead>
                      <TableHead className="w-[120px]">Outfit ID</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {events.map((evt) => (
                      <TableRow key={evt._id}>
                        <TableCell>
                          <Badge
                            variant="secondary"
                            className={EVENT_TYPE_BADGE[evt.event_type]}
                          >
                            {EVENT_TYPE_LABELS[evt.event_type]}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs">
                          {formatDateTime(evt.timestamp)}
                        </TableCell>
                        <TableCell>{renderEventDetail(evt)}</TableCell>
                        <TableCell>{renderLinkedEvent(evt)}</TableCell>
                        <TableCell className="font-mono text-[11px] text-muted-foreground">
                          {evt.outfit_id ? evt.outfit_id.slice(-8) : "—"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {/* Pagination */}
            {pagination && pagination.total > limit ? (
              <div className="mt-3 flex items-center justify-between text-xs">
                <span className="text-muted-foreground">
                  Page {pagination.page} of {pagination.pages} · {pagination.total} events
                </span>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1 || isFetchingEvents}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= pagination.pages || isFetchingEvents}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
}
