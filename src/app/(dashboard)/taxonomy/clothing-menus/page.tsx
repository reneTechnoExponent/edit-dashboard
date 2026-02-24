"use client";

import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Edit, Trash2 } from "lucide-react";
import { DataTable } from "@/components/DataTable";
import { DataTableToolbar } from "@/components/DataTableToolbar";
import { Button } from "@/components/ui/button";
import { DeleteConfirmDialog } from "@/components/DeleteConfirmDialog";
import {
  getClothingMenus,
  deleteClothingMenu,
  ClothingMenu,
} from "@/lib/api/taxonomy";
import { useRouter } from "next/navigation";

export default function ClothingMenusPage() {
  const router = useRouter();
  const [data, setData] = React.useState<ClothingMenu[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [searchValue, setSearchValue] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(20);
  const [total, setTotal] = React.useState(0);
  const [totalPages, setTotalPages] = React.useState(0);
  const [sortBy, setSortBy] = React.useState<string | undefined>();
  const [sortOrder, setSortOrder] = React.useState<"asc" | "desc">("asc");

  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [deleteTarget, setDeleteTarget] = React.useState<{
    id: string;
    title: string;
  } | null>(null);
  const [deleteLoading, setDeleteLoading] = React.useState(false);
  const [deleteError, setDeleteError] = React.useState<string | null>(null);

  // Fetch data
  const fetchData = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getClothingMenus({
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
      console.error("Error fetching clothing menus:", err);
      if (err.response?.status === 401) {
        router.push("/login");
      } else {
        setError(
          err.response?.data?.message || "Failed to fetch clothing menus"
        );
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
  const handleDeleteClick = (id: string, title: string) => {
    setDeleteTarget({ id, title });
    setDeleteError(null);
    setDeleteDialogOpen(true);
  };

  // Handle delete confirm - performs actual deletion
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;

    try {
      setDeleteLoading(true);
      setDeleteError(null);
      await deleteClothingMenu(deleteTarget.id);
      setDeleteDialogOpen(false);
      setDeleteTarget(null);
      fetchData(); // Refresh data
    } catch (err: any) {
      console.error("Error deleting clothing menu:", err);
      setDeleteError(
        err.response?.data?.message || "Failed to delete clothing menu"
      );
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
    // TODO: Open create dialog (will be implemented in task 9.2)
    alert("Create functionality will be implemented in task 9.2");
  };

  // Handle edit
  const handleEdit = (menu: ClothingMenu) => {
    // TODO: Open edit dialog (will be implemented in task 9.3)
    alert(`Edit functionality for "${menu.title}" will be implemented in task 9.3`);
  };

  // Define columns
  const columns: ColumnDef<ClothingMenu>[] = [
    {
      accessorKey: "title",
      header: "Title",
      enableSorting: true,
    },
    {
      accessorKey: "isUserCreated",
      header: "User Created",
      cell: ({ row }) => (row.original.isUserCreated ? "Yes" : "No"),
      enableSorting: false,
    },
    {
      accessorKey: "user",
      header: "User",
      cell: ({ row }) => {
        const user = row.original.user;
        if (!user) return <span className="text-muted-foreground">-</span>;
        // If user is populated as an object, show email; otherwise show ID
        if (typeof user === "object" && user !== null && "email" in user) {
          return (user as any).email;
        }
        return user;
      },
      enableSorting: false,
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
            onClick={() => handleDeleteClick(row.original._id, row.original.title)}
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
        <h1 className="text-3xl font-bold">Clothing Menus</h1>
        <p className="text-muted-foreground">
          Manage top-level clothing categories
        </p>
      </div>

      <DataTableToolbar
        searchPlaceholder="Search by title..."
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
        title="Delete Clothing Menu"
        description='Are you sure you want to delete "{entityName}"? This will also delete all related subcategories. This action cannot be undone.'
        entityName={deleteTarget?.title || ""}
        onConfirm={handleDeleteConfirm}
        loading={deleteLoading}
      />
    </div>
  );
}
