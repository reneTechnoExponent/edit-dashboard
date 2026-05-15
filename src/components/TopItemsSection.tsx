"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  ShoppingBag,
  Users,
  Bookmark,
  Calendar,
} from "lucide-react";
import { useGetItemFrequencyQuery } from "@/features/analytics/analyticsApi";
import type { ItemFrequencyEntry } from "@/types";

interface TopItemsSectionProps {
  dateParams: { startDate?: string; endDate?: string };
}

function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString();
}

function ItemDetailDialog({
  item,
  open,
  onOpenChange,
  rank,
}: {
  item: ItemFrequencyEntry | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rank: number;
}) {
  if (!item) return null;

  const closetPercentage =
    item.count > 0 ? ((item.fromClosetCount / item.count) * 100).toFixed(0) : "0";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Item Details — Rank #{rank}</DialogTitle>
          <DialogDescription>
            Saved outfit item analytics and metadata
          </DialogDescription>
        </DialogHeader>

        {/* Item image + basic info */}
        <div className="flex gap-4">
          {item.image ? (
            <div className="h-24 w-24 shrink-0 overflow-hidden rounded-lg border bg-muted">
              <img
                src={item.image}
                alt={item.title || "Clothing item"}
                className="h-full w-full object-cover"
              />
            </div>
          ) : (
            <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-lg border bg-muted">
              <ShoppingBag className="h-8 w-8 text-muted-foreground" />
            </div>
          )}
          <div className="flex flex-col justify-center gap-1">
            <h3 className="text-lg font-semibold">{item.title || "Untitled Item"}</h3>
            {item.brand && (
              <p className="text-sm text-muted-foreground">{item.brand}</p>
            )}
            <div className="flex flex-wrap gap-1.5 mt-1">
              {item.category && (
                <Badge variant="secondary" className="text-xs">
                  {item.category}
                </Badge>
              )}
              {item.color && (
                <Badge variant="outline" className="text-xs">
                  {item.color}
                </Badge>
              )}
              {item.size && (
                <Badge variant="outline" className="text-xs">
                  Size: {item.size}
                </Badge>
              )}
            </div>
          </div>
        </div>

        <Separator />

        {/* Save statistics */}
        <div>
          <h4 className="text-sm font-semibold mb-3">Save Statistics</h4>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border p-3">
              <div className="flex items-center gap-2 mb-1">
                <Bookmark className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Total Saves</span>
              </div>
              <p className="text-2xl font-bold">{item.count}</p>
            </div>
            <div className="rounded-lg border p-3">
              <div className="flex items-center gap-2 mb-1">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Unique Users</span>
              </div>
              <p className="text-2xl font-bold">{item.uniqueUserCount}</p>
            </div>
            <div className="rounded-lg border p-3">
              <div className="flex items-center gap-2 mb-1">
                <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">From Closet</span>
              </div>
              <p className="text-xl font-bold">
                {item.fromClosetCount}{" "}
                <span className="text-sm font-normal text-muted-foreground">
                  ({closetPercentage}%)
                </span>
              </p>
            </div>
            <div className="rounded-lg border p-3">
              <div className="flex items-center gap-2 mb-1">
                <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Recommended</span>
              </div>
              <p className="text-xl font-bold">
                {item.count - item.fromClosetCount}{" "}
                <span className="text-sm font-normal text-muted-foreground">
                  ({item.count > 0 ? (100 - Number(closetPercentage)).toFixed(0) : 0}%)
                </span>
              </p>
            </div>
          </div>
        </div>

        <Separator />

        {/* Timeline */}
        <div>
          <h4 className="text-sm font-semibold mb-3">Timeline</h4>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border p-3">
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">First Saved</span>
              </div>
              <p className="text-sm font-medium">{formatDate(item.firstSavedAt)}</p>
            </div>
            <div className="rounded-lg border p-3">
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Last Saved</span>
              </div>
              <p className="text-sm font-medium">{formatDate(item.lastSavedAt)}</p>
            </div>
          </div>
        </div>

        <Separator />

        {/* Item ID */}
        <div>
          <h4 className="text-sm font-semibold mb-2">Reference</h4>
          <div className="rounded-lg border p-3">
            <p className="text-xs text-muted-foreground mb-1">Item ID</p>
            <p className="font-mono text-xs break-all">{item.item_id}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function TopItemsSection({ dateParams }: TopItemsSectionProps) {
  const [page, setPage] = useState(1);
  const [selectedItem, setSelectedItem] = useState<ItemFrequencyEntry | null>(null);
  const [selectedRank, setSelectedRank] = useState(0);
  const limit = 10;

  const { data: itemFrequency, isLoading, isFetching } = useGetItemFrequencyQuery({
    page,
    limit,
    ...dateParams,
  });

  const topItems = itemFrequency?.data;
  const pagination = topItems?.pagination;

  const handleRowClick = (item: ItemFrequencyEntry, index: number) => {
    setSelectedItem(item);
    setSelectedRank((page - 1) * limit + index + 1);
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Top Items (Saved Outfits)</h2>
      {isLoading ? (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
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
              {pagination && pagination.total > 0 && (
                <> · {pagination.total} distinct items</>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {topItems.items.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No saved-outfit events in this window
              </p>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">#</TableHead>
                        <TableHead className="w-[60px]">Image</TableHead>
                        <TableHead>Item</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Brand</TableHead>
                        <TableHead className="text-right">Saves</TableHead>
                        <TableHead className="text-right">Users</TableHead>
                        <TableHead className="text-right">Closet %</TableHead>
                        <TableHead>Last Saved</TableHead>
                        <TableHead className="w-[70px]" />
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {topItems.items.map((item, index) => {
                        const rank = (page - 1) * limit + index + 1;
                        const closetPct =
                          item.count > 0
                            ? ((item.fromClosetCount / item.count) * 100).toFixed(0)
                            : "0";
                        return (
                          <TableRow
                            key={item.item_id}
                            className="cursor-pointer"
                            onClick={() => handleRowClick(item, index)}
                          >
                            <TableCell className="font-semibold text-muted-foreground">
                              {rank}
                            </TableCell>
                            <TableCell>
                              {item.image ? (
                                <div className="h-10 w-10 overflow-hidden rounded border bg-muted">
                                  <img
                                    src={item.image}
                                    alt={item.title || "Item"}
                                    className="h-full w-full object-cover"
                                  />
                                </div>
                              ) : (
                                <div className="flex h-10 w-10 items-center justify-center rounded border bg-muted">
                                  <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                                </div>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col">
                                <span className="font-medium text-sm max-w-[200px] truncate">
                                  {item.title || "Untitled"}
                                </span>
                                {item.color && (
                                  <span className="text-xs text-muted-foreground">
                                    {item.color}
                                    {item.size ? ` · ${item.size}` : ""}
                                  </span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              {item.category ? (
                                <Badge variant="secondary" className="text-xs">
                                  {item.category}
                                </Badge>
                              ) : (
                                <span className="text-xs text-muted-foreground">—</span>
                              )}
                            </TableCell>
                            <TableCell className="text-sm">
                              {item.brand || "—"}
                            </TableCell>
                            <TableCell className="text-right font-semibold">
                              {item.count.toLocaleString()}
                            </TableCell>
                            <TableCell className="text-right">
                              {item.uniqueUserCount}
                            </TableCell>
                            <TableCell className="text-right">
                              <span className="text-sm">{closetPct}%</span>
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground">
                              {formatDate(item.lastSavedAt)}
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRowClick(item, index);
                                }}
                                aria-label="View item details"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                {pagination && pagination.pages > 1 ? (
                  <div className="mt-4 flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      Page {pagination.page} of {pagination.pages} · {pagination.total} items
                    </span>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={page <= 1 || isFetching}
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                      >
                        <ChevronLeft className="h-4 w-4" />
                        <span className="ml-1">Previous</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={page >= pagination.pages || isFetching}
                        onClick={() => setPage((p) => p + 1)}
                      >
                        <span className="mr-1">Next</span>
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ) : null}
              </>
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

      <ItemDetailDialog
        item={selectedItem}
        open={!!selectedItem}
        onOpenChange={(open) => {
          if (!open) setSelectedItem(null);
        }}
        rank={selectedRank}
      />
    </div>
  );
}
