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
  EmailTemplateForm,
  EmailTemplateFormRef,
  EmailTemplateFormData,
} from "@/components/EmailTemplateForm";
import {
  getEmailTemplates,
  deleteEmailTemplate,
  createEmailTemplate,
  updateEmailTemplate,
  EmailTemplate,
} from "@/lib/api/content";
import { useRouter } from "next/navigation";

export default function EmailTemplatesPage() {
  const router = useRouter();
  const [data, setData] = React.useState<EmailTemplate[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [searchValue, setSearchValue] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(20);
  const [total, setTotal] = React.useState(0);
  const [totalPages, setTotalPages] = React.useState(0);
  const [sortBy, setSortBy] = React.useState<string | undefined>("purpose");
  const [sortOrder, setSortOrder] = React.useState<"asc" | "desc">("asc");

  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [deleteTarget, setDeleteTarget] = React.useState<{
    id: string;
    purpose: string;
  } | null>(null);
  const [deleteLoading, setDeleteLoading] = React.useState(false);
  const [deleteError, setDeleteError] = React.useState<string | null>(null);

  // Create/Edit dialog state
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [dialogMode, setDialogMode] = React.useState<"create" | "edit">("create");
  const [editTarget, setEditTarget] = React.useState<EmailTemplate | null>(null);
  const [dialogLoading, setDialogLoading] = React.useState(false);
  const [dialogError, setDialogError] = React.useState<string | null>(null);
  const formRef = React.useRef<EmailTemplateFormRef>(null);

  // Fetch data
  const fetchData = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getEmailTemplates({
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
      console.error("Error fetching email templates:", err);
      if (err.response?.status === 401) {
        router.push("/login");
      } else {
        setError(err.response?.data?.message || "Failed to fetch email templates");
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
  const handleDeleteClick = (id: string, purpose: string) => {
    setDeleteTarget({ id, purpose });
    setDeleteError(null);
    setDeleteDialogOpen(true);
  };

  // Handle delete confirm - performs actual deletion
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;

    try {
      setDeleteLoading(true);
      setDeleteError(null);
      await deleteEmailTemplate(deleteTarget.id);
      setDeleteDialogOpen(false);
      setDeleteTarget(null);
      fetchData(); // Refresh data
    } catch (err: any) {
      console.error("Error deleting email template:", err);
      setDeleteError(err.response?.data?.message || "Failed to delete email template");
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
  const handleEdit = (template: EmailTemplate) => {
    setDialogMode("edit");
    setEditTarget(template);
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
        await createEmailTemplate(formData);
      } else if (dialogMode === "edit" && editTarget) {
        await updateEmailTemplate(editTarget._id, formData);
      }

      setDialogOpen(false);
      setEditTarget(null);
      fetchData(); // Refresh data
    } catch (err: any) {
      console.error(
        `Error ${dialogMode === "create" ? "creating" : "updating"} email template:`,
        err
      );
      setDialogError(
        err.response?.data?.message ||
          `Failed to ${dialogMode === "create" ? "create" : "update"} email template`
      );
    } finally {
      setDialogLoading(false);
    }
  };

  // Truncate content for preview
  const truncateContent = (content: string, maxLength: number = 50) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + "...";
  };

  // Define columns
  const columns: ColumnDef<EmailTemplate>[] = [
    {
      accessorKey: "purpose",
      header: "Purpose",
      enableSorting: true,
    },
    {
      accessorKey: "subject",
      header: "Subject",
      enableSorting: true,
    },
    {
      accessorKey: "content",
      header: "Content Preview",
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {truncateContent(row.original.content)}
        </span>
      ),
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
              handleDeleteClick(row.original._id, row.original.purpose)
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
        <h1 className="text-3xl font-bold">Email Templates</h1>
        <p className="text-muted-foreground">
          Manage automated email templates
        </p>
      </div>

      <DataTableToolbar
        searchPlaceholder="Search by purpose or subject..."
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
        title="Delete Email Template"
        description='Are you sure you want to delete the email template for "{entityName}"? This action cannot be undone.'
        entityName={deleteTarget?.purpose || ""}
        onConfirm={handleDeleteConfirm}
        loading={deleteLoading}
      />

      <EntityDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={
          dialogMode === "create"
            ? "Create Email Template"
            : "Edit Email Template"
        }
        onSubmit={handleDialogSubmit}
        loading={dialogLoading}
        mode={dialogMode}
      >
        {dialogError && (
          <div className="mb-4 rounded-md bg-destructive/15 p-3 text-sm text-destructive">
            {dialogError}
          </div>
        )}
        <EmailTemplateForm
          ref={formRef}
          initialData={
            editTarget
              ? {
                  _id: editTarget._id,
                  purpose: editTarget.purpose,
                  subject: editTarget.subject,
                  content: editTarget.content,
                }
              : undefined
          }
        />
      </EntityDialog>
    </div>
  );
}
