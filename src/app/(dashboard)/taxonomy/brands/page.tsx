"use client";

import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Edit, Trash2 } from "lucide-react";
import { DataTable } from "@/components/DataTable";
import { DataTableToolbar } from "@/components/DataTableToolbar";
import { Button } from "@/components/ui/button";
import { DeleteConfirmDialog } from "@/components/DeleteConfirmDialog";
import { EntityDialog } from "@/components/EntityDialog";
import { BrandForm, BrandFormRef, BrandFormData } from "@/components/BrandForm";
import {
  getBrands,
  deleteBrand,
  createBrand,
  updateBrand,
  Brand,
} from "@/lib/api/taxonomy";
import { useRouter } from "next/navigation";

export default function BrandsPage() {
  const router = useRouter();
  const [data, setData] = React.useState<Brand[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [searchValue, setSearchValue] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(20);
  const [total, setTotal] = React.useState(0);
  const [totalPages, setTotalPages] = React.useState(0);
  const [sortBy, setSortBy] = React.useState<string | undefined>("brandName");
  const [sortOrder, setSortOrder] = React.useState<"asc" | "desc">("asc");

  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [deleteTarget, setDeleteTarget] = React.useState<{
    id: string;
    brandName: string;
  } | null>(null);
  const [deleteLoading, setDeleteLoading] = React.useState(false);
  const [deleteError, setDeleteError] = React.useState<string | null>(null);

  // Create/Edit dialog state
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [dialogMode, setDialogMode] = React.useState<"create" | "edit">("create");
  const [editTarget, setEditTarget] = React.useState<Brand | null>(null);
  const [dialogLoading, setDialogLoading] = React.useState(false);
  const [dialogError, setDialogError] = React.useState<string | null>(null);
  const formRef = React.useRef<BrandFormRef>(null);

  // Fetch data
  const fetchData = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getBrands({
        page,
        limit: pageSize,
        search: searchValue || undefined,
        sortBy,
        sortOrder,
      });
      setData(response.data.items);
      setTotal(response.data.total);
      setTotalPages(response.data.pages);
    } catch (err: any) {
      console.error("Error fetching brands:", err);
      if (err.response?.status === 401) {
        router.push("/login");
      } else {
        setError(err.response?.data?.message || "Failed to fetch brands");
      }
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, searchValue, sortBy, sortOrder, router]);

  // Fetch data on mount and when dependencies change
  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle delete click - opens dialog
  const handleDeleteClick = (id: string, brandName: string) => {
    setDeleteTarget({ id, brandName });
    setDeleteError(null);
    setDeleteDialogOpen(true);
  };

  // Handle delete confirm - performs actual deletion
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;

    try {
      setDeleteLoading(true);
      setDeleteError(null);
      await deleteBrand(deleteTarget.id);
      setDeleteDialogOpen(false);
      setDeleteTarget(null);
      fetchData(); // Refresh data
    } catch (err: any) {
      console.error("Error deleting brand:", err);
      setDeleteError(err.response?.data?.message || "Failed to delete brand");
    } finally {
      setDeleteLoading(false);
    }
  };

  // Handle search
  const handleSearchChange = (value: string) => {
    setSearchValue(value);
    setPage(1); // Reset to first page on search
  };

  // Handle page change
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  // Handle page size change
  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setPage(1); // Reset to first page
  };

  // Handle sort change
  const handleSortChange = (column: string, order: "asc" | "desc") => {
    setSortBy(column);
    setSortOrder(order);
  };

  // Handle create
  const handleCreate = () => {
    setDialogMode("create");
    setEditTarget(null);
    setDialogError(null);
    setDialogOpen(true);
  };

  // Handle edit
  const handleEdit = (brand: Brand) => {
    setDialogMode("edit");
    setEditTarget(brand);
    setDialogError(null);
    setDialogOpen(true);
  };

  // Handle dialog submit
  const handleDialogSubmit = async () => {
    if (!formRef.current) return;

    // Validate form
    if (!formRef.current.validate()) {
      return;
    }

    const formData = formRef.current.getData();

    try {
      setDialogLoading(true);
      setDialogError(null);

      if (dialogMode === "create") {
        await createBrand(formData);
      } else if (dialogMode === "edit" && editTarget) {
        await updateBrand(editTarget._id, formData);
      }

      setDialogOpen(false);
      setEditTarget(null);
      fetchData(); // Refresh data
    } catch (err: any) {
      console.error(`Error ${dialogMode === "create" ? "creating" : "updating"} brand:`, err);
      setDialogError(
        err.response?.data?.message ||
          `Failed to ${dialogMode === "create" ? "create" : "update"} brand`
      );
    } finally {
      setDialogLoading(false);
    }
  };

  // Define columns
  const columns: ColumnDef<Brand>[] = [
    {
      accessorKey: "brandName",
      header: "Brand Name",
      enableSorting: true,
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEdit(row.original)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              handleDeleteClick(row.original._id, row.original.brandName)
            }
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      ),
      enableSorting: false,
    },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold">Brands</h1>
        <p className="text-muted-foreground">
          Manage fashion brands
        </p>
      </div>

      <DataTableToolbar
        searchPlaceholder="Search by brand name..."
        searchValue={searchValue}
        onSearchChange={handleSearchChange}
        onCreateClick={handleCreate}
        createButtonLabel="Create New"
      />

      {deleteError && (
        <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
          {deleteError}
        </div>
      )}

      <DataTable
        columns={columns}
        data={data}
        loading={loading}
        error={error}
        pagination={{
          page,
          pageSize,
          total,
          totalPages,
        }}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        onSortChange={handleSortChange}
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Brand"
        description='Are you sure you want to delete "{entityName}"? This action cannot be undone.'
        entityName={deleteTarget?.brandName || ""}
        onConfirm={handleDeleteConfirm}
        loading={deleteLoading}
      />

      <EntityDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={dialogMode === "create" ? "Create Brand" : "Edit Brand"}
        onSubmit={handleDialogSubmit}
        loading={dialogLoading}
        mode={dialogMode}
      >
        {dialogError && (
          <div className="mb-4 rounded-md bg-destructive/15 p-3 text-sm text-destructive">
            {dialogError}
          </div>
        )}
        <BrandForm
          ref={formRef}
          initialData={
            editTarget
              ? {
                  _id: editTarget._id,
                  brandName: editTarget.brandName,
                }
              : undefined
          }
        />
      </EntityDialog>
    </div>
  );
}
