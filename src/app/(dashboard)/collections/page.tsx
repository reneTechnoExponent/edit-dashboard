"use client";

import { useState } from "react";
import { DataTable, DataTableColumn } from "@/components/data-table";
import { DetailPanel } from "@/components/detail-panel";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Trash2, Loader2 } from "lucide-react";
import {
  useGetCollectionsQuery,
  useGetCollectionDetailsQuery,
  useDeleteCollectionMutation,
} from "@/features/collections/collectionsApi";
import type { UserCollection, User } from "@/types";

export default function CollectionsPage() {
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [userFilter, setUserFilter] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [selectedCollectionId, setSelectedCollectionId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [collectionToDelete, setCollectionToDelete] = useState<string | null>(null);

  // Fetch collections with filters
  const { data, isLoading, isFetching } = useGetCollectionsQuery({
    page,
    limit: pageSize,
    sortBy,
    sortOrder,
    ...(userFilter && { user: userFilter }),
    ...(startDate && { startDate }),
    ...(endDate && { endDate }),
  });

  // Fetch selected collection details
  const { data: collectionDetails, isLoading: isLoadingDetails } = useGetCollectionDetailsQuery(
    selectedCollectionId!,
    { skip: !selectedCollectionId }
  );

  const [deleteCollection, { isLoading: isDeleting }] = useDeleteCollectionMutation();

  // Column definitions
  const columns: DataTableColumn<UserCollection>[] = [
    {
      id: "title",
      header: "Title",
      accessorKey: "title",
      sortable: true,
      cell: (row) => (
        <div className="max-w-[250px] truncate" title={row.title}>
          {row.title || "Untitled"}
        </div>
      ),
    },
    {
      id: "user",
      header: "User",
      cell: (row) => {
        const user = row.user as User;
        return (
          <div className="max-w-[200px] truncate" title={user?.email}>
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

  const handleRowClick = (row: UserCollection) => {
    setSelectedCollectionId(row._id);
  };

  const handleDelete = (id: string) => {
    setCollectionToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!collectionToDelete) return;

    try {
      await deleteCollection({ id: collectionToDelete }).unwrap();
      toast.success("Collection deleted successfully");
      setSelectedCollectionId(null);
    } catch (error: any) {
      const errorMessage =
        error?.data?.message || error?.message || "Failed to delete collection";
      toast.error(errorMessage);
    }
  };

  const collection = collectionDetails?.data?.collection;
  const collectionUser = collection?.user as User | undefined;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Collections</h1>
        <p className="text-muted-foreground">
          Manage user collections and outfits
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Filter collections by user and date range</CardDescription>
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
        emptyMessage="No collections found"
      />

      {/* Detail Panel */}
      <DetailPanel
        open={!!selectedCollectionId}
        onOpenChange={(open) => !open && setSelectedCollectionId(null)}
        title="Collection Details"
        description={collection?.title}
      >
        {isLoadingDetails ? (
          <div className="space-y-4">
            <div className="h-4 bg-muted animate-pulse rounded" />
            <div className="h-4 bg-muted animate-pulse rounded" />
            <div className="h-4 bg-muted animate-pulse rounded" />
          </div>
        ) : collection ? (
          <div className="space-y-6">
            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Basic Information</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Title</p>
                  <p className="font-medium">{collection.title || "Untitled"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Description</p>
                  <p className="font-medium">{collection.description || "—"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Collection ID</p>
                  <p className="font-mono text-sm">{collection._id}</p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Owner Information */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Owner Information</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">User Email</p>
                  <p className="font-medium">{collectionUser?.email || "Unknown"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">User ID</p>
                  <p className="font-mono text-sm">
                    {typeof collection.user === 'string' ? collection.user : collectionUser?._id}
                  </p>
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
                    {new Date(collection.createdAt).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Last Updated</p>
                  <p className="font-medium">
                    {new Date(collection.updatedAt).toLocaleString()}
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
                  variant="destructive"
                  className="w-full"
                  onClick={() => handleDelete(collection._id)}
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
                      Delete Collection
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
        title="Delete Collection"
        description="Are you sure you want to delete this collection? This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        variant="destructive"
      />
    </div>
  );
}
