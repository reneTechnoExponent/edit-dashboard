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
  SubcategoryAttributeForm,
  SubcategoryAttributeFormRef,
} from "@/components/SubcategoryAttributeForm";
import {
  getSubcategoryAttributes,
  getSubcategories,
  getAttributes,
  deleteSubcategoryAttribute,
  createSubcategoryAttribute,
  updateSubcategoryAttribute,
  SubcategoryAttribute,
  Subcategory,
  Attribute,
  AttributeValue,
} from "@/lib/api/taxonomy";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function SubcategoryAttributesPage() {
  const router = useRouter();
  const [data, setData] = React.useState<SubcategoryAttribute[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [subcategoryFilter, setSubcategoryFilter] = React.useState<string>("");
  const [attributeFilter, setAttributeFilter] = React.useState<string>("");
  const [subcategories, setSubcategories] = React.useState<Subcategory[]>([]);
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
    name: string;
  } | null>(null);
  const [deleteLoading, setDeleteLoading] = React.useState(false);
  const [deleteError, setDeleteError] = React.useState<string | null>(null);

  // Create/Edit dialog state
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [dialogMode, setDialogMode] = React.useState<"create" | "edit">("create");
  const [editTarget, setEditTarget] = React.useState<SubcategoryAttribute | null>(null);
  const [dialogLoading, setDialogLoading] = React.useState(false);
  const [dialogError, setDialogError] = React.useState<string | null>(null);
  const formRef = React.useRef<SubcategoryAttributeFormRef>(null);

  // Fetch subcategories and attributes for filter dropdowns
  React.useEffect(() => {
    const fetchFilters = async () => {
      try {
        const [subcategoriesRes, attributesRes] = await Promise.all([
          getSubcategories({ limit: 1000 }),
          getAttributes({ limit: 1000 }),
        ]);
        setSubcategories(subcategoriesRes.data.items);
        setAttributes(attributesRes.data.items);
      } catch (err: any) {
        console.error("Error fetching filters:", err);
      }
    };
    fetchFilters();
  }, []);

  // Fetch data
  const fetchData = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getSubcategoryAttributes({
        page,
        limit: pageSize,
        subcategory: subcategoryFilter || undefined,
        attribute: attributeFilter || undefined,
        sortBy,
        sortOrder,
      });
      setData(response.data.items);
      setTotal(response.data.total);
      setTotalPages(response.data.pages);
    } catch (err: any) {
      console.error("Error fetching subcategory attributes:", err);
      if (err.response?.status === 401) {
        router.push("/login");
      } else {
        setError(
          err.response?.data?.message || "Failed to fetch subcategory attributes"
        );
      }
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, subcategoryFilter, attributeFilter, sortBy, sortOrder, router]);

  // Fetch data on mount and when dependencies change
  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle delete click - opens dialog
  const handleDeleteClick = (id: string, name: string) => {
    setDeleteTarget({ id, name });
    setDeleteError(null);
    setDeleteDialogOpen(true);
  };

  // Handle delete confirm - performs actual deletion
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;

    try {
      setDeleteLoading(true);
      setDeleteError(null);
      await deleteSubcategoryAttribute(deleteTarget.id);
      setDeleteDialogOpen(false);
      setDeleteTarget(null);
      fetchData(); // Refresh data
    } catch (err: any) {
      console.error("Error deleting subcategory attribute:", err);
      setDeleteError(
        err.response?.data?.message || "Failed to delete subcategory attribute"
      );
    } finally {
      setDeleteLoading(false);
    }
  };

  // Handle subcategory filter change
  const handleSubcategoryFilterChange = (value: string) => {
    setSubcategoryFilter(value === "all" ? "" : value);
    setPage(1); // Reset to first page on filter change
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
  const handleEdit = (subcategoryAttribute: SubcategoryAttribute) => {
    setDialogMode("edit");
    setEditTarget(subcategoryAttribute);
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
        await createSubcategoryAttribute(formData);
      } else if (dialogMode === "edit" && editTarget) {
        await updateSubcategoryAttribute(editTarget._id, formData);
      }

      setDialogOpen(false);
      setEditTarget(null);
      fetchData(); // Refresh data
    } catch (err: any) {
      console.error("Error saving subcategory attribute:", err);
      setDialogError(
        err.response?.data?.message || "Failed to save subcategory attribute"
      );
    } finally {
      setDialogLoading(false);
    }
  };

  // Define columns
  const columns: ColumnDef<SubcategoryAttribute>[] = [
    {
      accessorKey: "subcategory",
      header: "Subcategory",
      cell: ({ row }) => {
        const subcategory = row.original.subcategory;
        if (!subcategory) return <span className="text-muted-foreground">-</span>;
        // If subcategory is populated as an object, show title; otherwise show ID
        if (typeof subcategory === "object" && subcategory !== null && "title" in subcategory) {
          return (subcategory as Subcategory).title;
        }
        return subcategory;
      },
      enableSorting: false,
    },
    {
      accessorKey: "attribute",
      header: "Attribute",
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
      accessorKey: "allowedValues",
      header: "Allowed Values Count",
      cell: ({ row }) => {
        const allowedValues = row.original.allowedValues;
        if (!allowedValues) return 0;
        return Array.isArray(allowedValues) ? allowedValues.length : 0;
      },
      enableSorting: false,
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const subcategory = row.original.subcategory;
        const attribute = row.original.attribute;
        const subcategoryName = typeof subcategory === "object" && subcategory !== null && "title" in subcategory
          ? (subcategory as Subcategory).title
          : "Unknown";
        const attributeName = typeof attribute === "object" && attribute !== null && "name" in attribute
          ? (attribute as Attribute).name
          : "Unknown";
        const displayName = `${subcategoryName} - ${attributeName}`;

        return (
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
                handleDeleteClick(row.original._id, displayName)
              }
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        );
      },
      enableSorting: false,
    },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold">Subcategory Attributes</h1>
        <p className="text-muted-foreground">
          Manage attribute assignments and allowed values for subcategories
        </p>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex-1">
          <DataTableToolbar
            searchPlaceholder=""
            searchValue=""
            onSearchChange={() => {}}
            onCreateClick={handleCreate}
            createButtonLabel="Create New"
            hideSearch
          />
        </div>
        <div className="w-[200px]">
          <Select
            value={subcategoryFilter || "all"}
            onValueChange={handleSubcategoryFilterChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filter by subcategory" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Subcategories</SelectItem>
              {subcategories.map((sub) => (
                <SelectItem key={sub._id} value={sub._id}>
                  {sub.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
        title="Delete Subcategory Attribute"
        description='Are you sure you want to delete "{entityName}"? This action cannot be undone.'
        entityName={deleteTarget?.name || ""}
        onConfirm={handleDeleteConfirm}
        loading={deleteLoading}
      />

      <EntityDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={dialogMode === "create" ? "Create Subcategory Attribute" : "Edit Subcategory Attribute"}
        description={
          dialogMode === "create"
            ? "Assign an attribute to a subcategory with allowed values"
            : "Update the subcategory attribute mapping"
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
        <SubcategoryAttributeForm
          ref={formRef}
          initialData={
            editTarget
              ? {
                  _id: editTarget._id,
                  subcategory:
                    typeof editTarget.subcategory === "object"
                      ? editTarget.subcategory._id
                      : editTarget.subcategory,
                  attribute:
                    typeof editTarget.attribute === "object"
                      ? editTarget.attribute._id
                      : editTarget.attribute,
                  allowedValues: Array.isArray(editTarget.allowedValues)
                    ? editTarget.allowedValues.map((val) =>
                        typeof val === "object" && val !== null && "_id" in val
                          ? (val as AttributeValue)._id
                          : val
                      )
                    : [],
                }
              : undefined
          }
        />
      </EntityDialog>
    </div>
  );
}
