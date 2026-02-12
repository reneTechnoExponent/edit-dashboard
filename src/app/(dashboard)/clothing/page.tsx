"use client";

import { useState } from "react";
import { DataTable, DataTableColumn } from "@/components/data-table";
import { DetailPanel } from "@/components/detail-panel";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Trash2, RefreshCw, Loader2 } from "lucide-react";
import {
  useGetClothingItemsQuery,
  useGetClothingItemDetailsQuery,
  useDeleteClothingItemMutation,
  useTriggerRecategorizationMutation,
  useBulkDeleteClothingItemsMutation,
} from "@/features/clothing/clothingApi";
import type { ClothingItem, User } from "@/types";

export default function ClothingPage() {
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [userFilter, setUserFilter] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [subcategoryFilter, setSubcategoryFilter] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  // Fetch clothing items with filters
  const { data, isLoading, isFetching } = useGetClothingItemsQuery({
    page,
    limit: pageSize,
    sortBy,
    sortOrder,
    ...(userFilter && { user: userFilter }),
    ...(categoryFilter && { category: categoryFilter }),
    ...(subcategoryFilter && { subcategory: subcategoryFilter }),
    ...(startDate && { startDate }),
    ...(endDate && { endDate }),
  });

  // Fetch selected item details
  const { data: itemDetails, isLoading: isLoadingDetails } = useGetClothingItemDetailsQuery(
    selectedItemId!,
    { skip: !selectedItemId }
  );

  const [deleteClothingItem, { isLoading: isDeleting }] = useDeleteClothingItemMutation();
  const [triggerRecategorization, { isLoading: isRecategorizing }] = useTriggerRecategorizationMutation();
  const [bulkDeleteClothingItems, { isLoading: isBulkDeleting }] = useBulkDeleteClothingItemsMutation();

  // Column definitions
  const columns: DataTableColumn<ClothingItem>[] = [
    {
      id: "title",
      header: "Title",
      accessorKey: "title",
      sortable: true,
      cell: (row) => (
        <div className="max-w-[200px] truncate" title={row.title}>
          {row.title || "Untitled"}
        </div>
      ),
    },
    {
      id: "brand",
      header: "Brand",
      accessorKey: "brand",
      sortable: true,
      cell: (row) => row.brand || "—",
    },
    {
      id: "price",
      header: "Price",
      accessorKey: "price",
      sortable: true,
      cell: (row) => (row.price ? `$${row.price.toFixed(2)}` : "—"),
    },
    {
      id: "user",
      header: "User",
      cell: (row) => {
        const user = row.user as User;
        return (
          <div className="max-w-[150px] truncate" title={user?.email}>
            {user?.email || "Unknown"}
          </div>
        );
      },
    },
    {
      id: "createdAt",
      header: "Created Date",
      accessorKey: "createdAt",
      sortable: true,
      cell: (row) => new Date(row.createdAt).toLocaleDateString(),
    },
  ];

  const handleSortChange = (newSortBy: string, newSortOrder: "asc" | "desc") => {
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
    setPage(1);
  };

  const handleRowClick = (row: ClothingItem) => {
    setSelectedItemId(row._id);
  };

  const handleUserFilterChange = (value: string) => {
    setUserFilter(value === "all" ? "" : value);
    setPage(1);
  };

  const handleCategoryFilterChange = (value: string) => {
    setCategoryFilter(value === "all" ? "" : value);
    setPage(1);
  };

  const handleSubcategoryFilterChange = (value: string) => {
    setSubcategoryFilter(value === "all" ? "" : value);
    setPage(1);
  };

  const handleDelete = (id: string) => {
    setItemToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;

    try {
      await deleteClothingItem({ id: itemToDelete }).unwrap();
      toast.success("Clothing item deleted successfully");
      setSelectedItemId(null);
    } catch (error: any) {
      const errorMessage =
        error?.data?.message || error?.message || "Failed to delete clothing item";
      toast.error(errorMessage);
    }
  };

  const handleBulkDelete = () => {
    if (selectedItems.length === 0) {
      toast.error("No items selected");
      return;
    }
    setBulkDeleteDialogOpen(true);
  };

  const confirmBulkDelete = async () => {
    try {
      const result = await bulkDeleteClothingItems({ ids: selectedItems }).unwrap();
      toast.success(
        `Bulk delete completed: ${result.data.successCount} succeeded, ${result.data.failureCount} failed`
      );
      setSelectedItems([]);
    } catch (error: any) {
      const errorMessage =
        error?.data?.message || error?.message || "Failed to delete clothing items";
      toast.error(errorMessage);
    }
  };

  const handleRecategorize = async () => {
    if (!selectedItemId) return;

    try {
      await triggerRecategorization({ id: selectedItemId }).unwrap();
      toast.success("AI re-categorization triggered successfully");
    } catch (error: any) {
      const errorMessage =
        error?.data?.message || error?.message || "Failed to trigger re-categorization";
      toast.error(errorMessage);
    }
  };

  const item = itemDetails?.data?.clothingItem;
  const itemUser = item?.user as User | undefined;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Clothing Items</h1>
        <p className="text-muted-foreground">
          Manage clothing items across all users
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Filter clothing items by various criteria</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {/* User Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">User</label>
              <Input
                placeholder="Enter user ID or email..."
                value={userFilter}
                onChange={(e) => setUserFilter(e.target.value)}
              />
            </div>

            {/* Category Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <Input
                placeholder="Enter category..."
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              />
            </div>

            {/* Subcategory Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Subcategory</label>
              <Input
                placeholder="Enter subcategory..."
                value={subcategoryFilter}
                onChange={(e) => setSubcategoryFilter(e.target.value)}
              />
            </div>

            {/* Date Range */}
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

      {/* Bulk Actions */}
      {selectedItems.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {selectedItems.length} item(s) selected
              </p>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleBulkDelete}
                disabled={isBulkDeleting}
              >
                {isBulkDeleting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Selected
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={data?.data?.items || []}
        total={data?.data?.pagination?.total || 0}
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onSortChange={handleSortChange}
        onRowClick={handleRowClick}
        isLoading={isLoading || isFetching}
        emptyMessage="No clothing items found"
        selectable
        onSelectionChange={setSelectedItems}
      />

      {/* Detail Panel */}
      <DetailPanel
        open={!!selectedItemId}
        onOpenChange={(open) => !open && setSelectedItemId(null)}
        title="Clothing Item Details"
        description={item?.title}
      >
        {isLoadingDetails ? (
          <div className="space-y-4">
            <div className="h-4 bg-muted animate-pulse rounded" />
            <div className="h-4 bg-muted animate-pulse rounded" />
            <div className="h-4 bg-muted animate-pulse rounded" />
          </div>
        ) : item ? (
          <div className="space-y-6">
            {/* Image */}
            {item.image && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Image</h3>
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-auto rounded-lg border"
                />
              </div>
            )}

            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Basic Information</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Title</p>
                  <p className="font-medium">{item.title || "Untitled"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Brand</p>
                  <p className="font-medium">{item.brand || "—"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Price</p>
                  <p className="font-medium">
                    {item.price ? `$${item.price.toFixed(2)}` : "—"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Size</p>
                  <p className="font-medium">{item.size || "—"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Color</p>
                  <p className="font-medium">{item.color || "—"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Subcategory</p>
                  <p className="font-medium">{item.subcategory || "—"}</p>
                </div>
                {item.purchasedon && (
                  <div>
                    <p className="text-sm text-muted-foreground">Purchased On</p>
                    <p className="font-medium">
                      {new Date(item.purchasedon).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* AI Data */}
            <div>
              <h3 className="text-lg font-semibold mb-3">AI Processing</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Parsed by AI</span>
                  <Badge variant={item.isParsedByAi ? "default" : "outline"}>
                    {item.isParsedByAi ? "Yes" : "No"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Background Removed by AI</span>
                  <Badge variant={item.isBackgroundRemovedByAi ? "default" : "outline"}>
                    {item.isBackgroundRemovedByAi ? "Yes" : "No"}
                  </Badge>
                </div>
              </div>
            </div>

            <Separator />

            {/* Attributes */}
            {item.attributes && item.attributes.length > 0 && (
              <>
                <div>
                  <h3 className="text-lg font-semibold mb-3">Attributes</h3>
                  <div className="space-y-2">
                    {item.attributes.map((attr, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          {attr.attribute}
                        </span>
                        <span className="text-sm font-medium">{attr.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <Separator />
              </>
            )}

            {/* Owner Information */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Owner Information</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">User Email</p>
                  <p className="font-medium">{itemUser?.email || "Unknown"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">User ID</p>
                  <p className="font-mono text-sm">{typeof item.user === 'string' ? item.user : itemUser?._id}</p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Dates */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Dates</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Created At</p>
                  <p className="font-medium">
                    {new Date(item.createdAt).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Last Updated</p>
                  <p className="font-medium">
                    {new Date(item.updatedAt).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Actions */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Actions</h3>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleRecategorize}
                  disabled={isRecategorizing}
                >
                  {isRecategorizing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Re-categorizing...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Trigger AI Re-categorization
                    </>
                  )}
                </Button>
                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={() => handleDelete(item._id)}
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Item
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        ) : null}
      </DetailPanel>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Clothing Item"
        description="Are you sure you want to delete this clothing item? This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        variant="destructive"
      />

      {/* Bulk Delete Confirmation Dialog */}
      <ConfirmDialog
        open={bulkDeleteDialogOpen}
        onOpenChange={setBulkDeleteDialogOpen}
        title="Delete Multiple Items"
        description={`Are you sure you want to delete ${selectedItems.length} clothing item(s)? This action cannot be undone.`}
        confirmLabel="Delete All"
        onConfirm={confirmBulkDelete}
        variant="destructive"
      />
    </div>
  );
}
