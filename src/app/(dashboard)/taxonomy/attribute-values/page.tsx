"use client";

import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Edit, Trash2 } from "lucide-react";
import { DataTable } from "@/components/DataTable";
import { DataTableToolbar } from "@/components/DataTableToolbar";
import { Button } from "@/components/ui/button";
import { DeleteConfirmDialog } from "@/components/DeleteConfirmDialog";
import { EntityDialog } from "@/components/EntityDialog";
import {
  AttributeValueForm,
  AttributeValueFormRef,
  AttributeValueFormData,
} from "@/components/AttributeValueForm";
import {
  getAttributeValues,
  getAttributes,
  deleteAttributeValue,
  createAttributeValue,
  updateAttributeValue,
  AttributeValue,
  Attribute,
} from "@/lib/api/taxonomy";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function AttributeValuesPage() {
  const router = useRouter();
  const [data, setData] = React.useState<AttributeValue[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [searchValue, setSearchValue] = React.useState("");
  const [attributeFilter, setAttributeFilter] = React.useState<string>("");
  const [attributes, setAttributes] = React.useState<Attribute[]>([]);
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
    value: string;
  } | null>(null);
  const [deleteLoading, setDeleteLoading] = React.useState(false);
  const [deleteError, setDeleteError] = React.useState<string | null>(null);

  // Create/Edit dialog state
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [dialogMode, setDialogMode] = React.useState<"create" | "edit">("create");
  const [editTarget, setEditTarget] = React.useState<AttributeValue | null>(null);
  const [dialogLoading, setDialogLoading] = React.useState(false);
  const [dialogError, setDialogError] = React.useState<string | null>(null);
  const formRef = React.useRef<AttributeValueFormRef>(null);

  // Fetch attributes for filter dropdown
  React.useEffect(() => {
    const fetchAttributes = async () => {
      try {
        const response = await getAttributes({ limit: 1000 });
        setAttributes(response.data.items);
      } catch (err: any) {
        console.error("Error fetching attributes:", err);
      }
    };
    fetchAttributes();
  }, []);

  // Fetch data
  const fetchData = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getAttributeValues({
        page,
        limit: pageSize,
        search: searchValue || undefined,
        attribute: attributeFilter || undefined,
        sortBy,
        sortOrder,
      });
      setData(response.data.items);
      setTotal(response.data.total);
      setTotalPages(response.data.pages);
    } catch (err: any) {
      console.error("Error fetching attribute values:", err);
      if (err.response?.status === 401) {
        router.push("/login");
      } else {
        setError(
          err.response?.data?.message || "Failed to fetch attribute values"
        );
      }
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, searchValue, attributeFilter, sortBy, sortOrder, router]);

  // Fetch data on mount and when dependencies change
  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle delete click - opens dialog
  const handleDeleteClick = (id: string, value: string) => {
    setDeleteTarget({ id, value });
    setDeleteError(null);
    setDeleteDialogOpen(true);
  };

  // Handle delete confirm - performs actual deletion
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;

    try {
      setDeleteLoading(true);
      setDeleteError(null);
      await deleteAttributeValue(deleteTarget.id);
      setDeleteDialogOpen(false);
      setDeleteTarget(null);
      fetchData(); // Refresh data
    } catch (err: any) {
      console.error("Error deleting attribute value:", err);
      setDeleteError(
        err.response?.data?.message || "Failed to delete attribute value"
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

  // Handle attribute filter change
  const handleAttributeFilterChange = (value: string) => {
    setAttributeFilter(value === "all" ? "" : value);
    setPage(1); // Reset to first page on filter change
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
  const handleEdit = (attributeValue: AttributeValue) => {
    setDialogMode("edit");
    setEditTarget(attributeValue);
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
        await createAttributeValue(formData);
      } else if (dialogMode === "edit" && editTarget) {
        await updateAttributeValue(editTarget._id, formData);
      }

      setDialogOpen(false);
      setEditTarget(null);
      fetchData(); // Refresh data
    } catch (err: any) {
      console.error("Error saving attribute value:", err);
      setDialogError(
        err.response?.data?.message || "Failed to save attribute value"
      );
    } finally {
      setDialogLoading(false);
    }
  };

  // Define columns
  const columns: ColumnDef<AttributeValue>[] = [
    {
      accessorKey: "attribute",
      header: "Parent Attribute",
      cell: ({ row }) => {
        const attribute = row.original.attribute;
        if (!attribute) return <span className="text-muted-foreground">-</span>;
        // If attribute is populated as an object, show name; otherwise show ID
        if (typeof attribute === "object" && attribute !== null && "name" in attribute) {
          return (attribute as Attribute).name;
        }
        return attribute;
      },
      enableSorting: false,
    },
    {
      accessorKey: "value",
      header: "Value",
      enableSorting: true,
    },
    {
      accessorKey: "isPhase2",
      header: "Phase 2",
      cell: ({ row }) => (row.original.isPhase2 ? "Yes" : "No"),
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
            onClick={() =>
              handleDeleteClick(row.original._id, row.original.value)
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
        <h1 className="text-3xl font-bold">Attribute Values</h1>
        <p className="text-muted-foreground">
          Manage specific values for each attribute
        </p>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex-1">
          <DataTableToolbar
            searchPlaceholder="Search by value..."
            searchValue={searchValue}
            onSearchChange={handleSearchChange}
            onCreateClick={handleCreate}
            createButtonLabel="Create New"
          />
        </div>
        <div className="w-[200px]">
          <Select
            value={attributeFilter || "all"}
            onValueChange={handleAttributeFilterChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filter by attribute" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Attributes</SelectItem>
              {attributes.map((attr) => (
                <SelectItem key={attr._id} value={attr._id}>
                  {attr.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

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
        title="Delete Attribute Value"
        description='Are you sure you want to delete "{entityName}"? This action cannot be undone.'
        entityName={deleteTarget?.value || ""}
        onConfirm={handleDeleteConfirm}
        loading={deleteLoading}
      />

      <EntityDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={dialogMode === "create" ? "Create Attribute Value" : "Edit Attribute Value"}
        description={
          dialogMode === "create"
            ? "Add a new attribute value to the taxonomy"
            : "Update the attribute value details"
        }
        mode={dialogMode}
        onSubmit={handleDialogSubmit}
        loading={dialogLoading}
      >
        {dialogError && (
          <div className="mb-4 rounded-md bg-destructive/15 p-3 text-sm text-destructive">
            {dialogError}
          </div>
        )}
        <AttributeValueForm
          ref={formRef}
          initialData={
            editTarget
              ? {
                  _id: editTarget._id,
                  attribute:
                    typeof editTarget.attribute === "object"
                      ? editTarget.attribute._id
                      : editTarget.attribute,
                  value: editTarget.value,
                  isPhase2: editTarget.isPhase2,
                }
              : undefined
          }
        />
      </EntityDialog>
    </div>
  );
}
