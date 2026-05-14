"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import {
  Download,
  Loader2,
  TrendingUp,
  Users,
  ShoppingBag,
  CreditCard,
  Sparkles,
  Bookmark,
  Repeat,
  RefreshCw,
  Wand2,
  Activity,
} from "lucide-react";
import {
  useGetUserMetricsQuery,
  useGetClothingItemMetricsQuery,
  useGetSubscriptionMetricsQuery,
  useExportAnalyticsMutation,
  useGetEventSummaryQuery,
  useGetItemFrequencyQuery,
} from "@/features/analytics/analyticsApi";
import type { AnalyticsEventType } from "@/types";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const EVENT_TYPE_LABELS: Record<AnalyticsEventType, string> = {
  outfit_generated: "Outfits Generated",
  outfit_saved: "Outfits Saved",
  item_swapped: "Items Swapped",
  regenerate_triggered: "Regenerations",
  manual_outfit_created: "Manual Outfits",
};

const EVENT_TYPE_ICONS: Record<AnalyticsEventType, React.ComponentType<{ className?: string }>> = {
  outfit_generated: Sparkles,
  outfit_saved: Bookmark,
  item_swapped: Repeat,
  regenerate_triggered: RefreshCw,
  manual_outfit_created: Wand2,
};

export default function AnalyticsPage() {
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  const dateParams = {
    ...(startDate && { startDate }),
    ...(endDate && { endDate }),
  };

  const { data: userMetrics, isLoading: isLoadingUsers } = useGetUserMetricsQuery(dateParams);
  const { data: clothingMetrics, isLoading: isLoadingClothing } = useGetClothingItemMetricsQuery(dateParams);
  const { data: subscriptionMetrics, isLoading: isLoadingSubscriptions } = useGetSubscriptionMetricsQuery(dateParams);
  const { data: eventSummary, isLoading: isLoadingEventSummary } = useGetEventSummaryQuery(dateParams);
  const { data: itemFrequency, isLoading: isLoadingItemFrequency } = useGetItemFrequencyQuery(dateParams);

  const [exportAnalytics, { isLoading: isExporting }] = useExportAnalyticsMutation();

  const handleExport = async () => {
    try {
      const blob = await exportAnalytics(dateParams).unwrap();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("Analytics exported successfully");
    } catch (error: any) {
      const errorMessage =
        error?.data?.message || error?.message || "Failed to export analytics";
      toast.error(errorMessage);
    }
  };

  const users = userMetrics?.data?.users;
  const clothing = clothingMetrics?.data?.clothingItems;
  const subscriptions = subscriptionMetrics?.data?.subscriptions;
  const events = eventSummary?.data;
  const topItems = itemFrequency?.data;

  // Prepare chart data for category distribution
  const categoryChartData = clothing?.categoryDistribution?.map((item) => ({
    name: item._id || "Unknown",
    count: item.count,
  })) || [];

  // Event-type chart data (ordered by label)
  const eventTypeChartData = events
    ? (Object.entries(events.events_by_type) as [AnalyticsEventType, number][]).map(
        ([key, count]) => ({
          name: EVENT_TYPE_LABELS[key],
          count,
        })
      )
    : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">
            Platform metrics and insights
          </p>
        </div>
        <Button onClick={handleExport} disabled={isExporting}>
          {isExporting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Exporting...
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </>
          )}
        </Button>
      </div>

      {/* Date Range Filter */}
      <Card>
        <CardHeader>
          <CardTitle>Date Range</CardTitle>
          <CardDescription>Filter analytics by date range</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Start Date</label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">End Date</label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* User Metrics */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">User Metrics</h2>
        {isLoadingUsers ? (
          <div className="grid gap-4 md:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <div className="h-4 bg-muted animate-pulse rounded" />
                </CardHeader>
                <CardContent>
                  <div className="h-8 bg-muted animate-pulse rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : users ? (
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{users.totalUsers}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">New Users</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{users.newUsers}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{users.activeUsers}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Growth Rate</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{users.growthRate.toFixed(1)}%</div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">User metrics unavailable</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Clothing Item Metrics */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Clothing Item Metrics</h2>
        {isLoadingClothing ? (
          <div className="grid gap-4 md:grid-cols-2">
            {[1, 2].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <div className="h-4 bg-muted animate-pulse rounded" />
                </CardHeader>
                <CardContent>
                  <div className="h-8 bg-muted animate-pulse rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : clothing ? (
          <>
            <div className="grid gap-4 md:grid-cols-2 mb-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Items</CardTitle>
                  <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{clothing.totalItems}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg Items per User</CardTitle>
                  <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{clothing.averageItemsPerUser.toFixed(1)}</div>
                </CardContent>
              </Card>
            </div>

            {/* Category Distribution Chart */}
            {categoryChartData.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Category Distribution</CardTitle>
                  <CardDescription>Number of items by category</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={categoryChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="count" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}
          </>
        ) : (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">Clothing metrics unavailable</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Subscription Metrics */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Subscription Metrics</h2>
        {isLoadingSubscriptions ? (
          <div className="grid gap-4 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <div className="h-4 bg-muted animate-pulse rounded" />
                </CardHeader>
                <CardContent>
                  <div className="h-8 bg-muted animate-pulse rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : subscriptions ? (
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{subscriptions.activeSubscriptions}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">New Subscriptions</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{subscriptions.newSubscriptions}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{subscriptions.conversionRate.toFixed(1)}%</div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">Subscription metrics unavailable</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Event Tracking Metrics */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Event Tracking</h2>
        {isLoadingEventSummary ? (
          <div className="grid gap-4 md:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <div className="h-4 bg-muted animate-pulse rounded" />
                </CardHeader>
                <CardContent>
                  <div className="h-8 bg-muted animate-pulse rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : events ? (
          <>
            {/* High-level KPIs */}
            <div className="grid gap-4 md:grid-cols-4 mb-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Events</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{events.total_events.toLocaleString()}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Unique Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{events.unique_users.toLocaleString()}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Save Rate</CardTitle>
                  <Bookmark className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{(events.save_rate * 100).toFixed(1)}%</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    outfit_saved / outfit_generated
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Outfits Saved</CardTitle>
                  <Bookmark className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {events.events_by_type.outfit_saved.toLocaleString()}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Per-event-type cards */}
            <div className="grid gap-4 md:grid-cols-5 mb-4">
              {(Object.keys(events.events_by_type) as AnalyticsEventType[]).map((eventType) => {
                const Icon = EVENT_TYPE_ICONS[eventType];
                return (
                  <Card key={eventType}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        {EVENT_TYPE_LABELS[eventType]}
                      </CardTitle>
                      <Icon className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-xl font-bold">
                        {events.events_by_type[eventType].toLocaleString()}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Events by type chart */}
            {events.total_events > 0 && (
              <Card className="mb-4">
                <CardHeader>
                  <CardTitle>Events by Type</CardTitle>
                  <CardDescription>Distribution of tracked events</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={eventTypeChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="count" fill="#10b981" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}
          </>
        ) : (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">Event metrics unavailable</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Top Items by Frequency */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Top Items (Saved Outfits)</h2>
        {isLoadingItemFrequency ? (
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-8 bg-muted animate-pulse rounded" />
                ))}
              </div>
            </CardContent>
          </Card>
        ) : topItems ? (
          <Card>
            <CardHeader>
              <CardTitle>
                Most-Saved Items — Last {topItems.window_days} Days
              </CardTitle>
              <CardDescription>
                {topItems.total_saves.toLocaleString()} total outfit_saved events in window
              </CardDescription>
            </CardHeader>
            <CardContent>
              {topItems.items.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No saved-outfit events in this window
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16">Rank</TableHead>
                      <TableHead>Item ID</TableHead>
                      <TableHead className="text-right">Save Count</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topItems.items.map((item, index) => (
                      <TableRow key={item.item_id}>
                        <TableCell className="font-medium">#{index + 1}</TableCell>
                        <TableCell className="font-mono text-xs">{item.item_id}</TableCell>
                        <TableCell className="text-right font-semibold">
                          {item.count.toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">Item frequency unavailable</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
