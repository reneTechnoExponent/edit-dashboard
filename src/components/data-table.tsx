"use client";

import * as React from "react";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
  type RowSelectionState,
} from "@tanstack/react-table";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ArrowUpDown } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export interface DataTableColumn<T> {
  id: string;
  header: string;
  accessorKey?: keyof T;
  cell?: (row: T) => React.ReactNode;
  sortable?: boolean;
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onSortChange: (sortBy: string, sortOrder: "asc" | "desc") => void;
  onRowClick?: (row: T) => void;
  selectable?: boolean;
  onSelectionChange?: (selectedIds: string[]) => void;
  isLoading?: boolean;
  emptyMessage?: string;
}

export function DataTable<T extends { _id: string }>({
  columns,
  data,
  total,
  page,
  pageSize,
  onPageChange,
  onSortChange,
  onRowClick,
  selectable = false,
  onSelectionChange,
  isLoading = false,
  emptyMessage = "No data available",
}: DataTableProps<T>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});

  // Convert custom columns to TanStack Table columns
  const tableColumns = React.useMemo<ColumnDef<T>[]>(() => {
    const cols: ColumnDef<T>[] = [];

    // Add selection column if selectable
    if (selectable) {
      cols.push({
        id: "select",
        header: ({ table }) => (
          <input
            type="checkbox"
            checked={table.getIsAllPageRowsSelected()}
            onChange={table.getToggleAllPageRowsSelectedHandler()}
            aria-label="Select all"
            className="h-4 w-4"
          />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            checked={row.getIsSelected()}
            onChange={row.getToggleSelectedHandler()}
            aria-label="Select row"
            className="h-4 w-4"
          />
        ),
        enableSorting: false,
      });
    }

    // Add data columns
    columns.forEach((col) => {
      cols.push({
        id: col.id,
        accessorKey: col.accessorKey as string,
        header: ({ column }) => {
          if (!col.sortable) {
            return <div>{col.header}</div>;
          }

          return (
            <Button
              variant="ghost"
              onClick={() => {
                const isSorted = column.getIsSorted();
                const newSortOrder = isSorted === "asc" ? "desc" : "asc";
                column.toggleSorting(isSorted === "asc");
                onSortChange(col.id, newSortOrder);
              }}
              className="-ml-4 h-8"
            >
              {col.header}
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => {
          if (col.cell) {
            return col.cell(row.original);
          }
          if (col.accessorKey) {
            return <div>{String(row.original[col.accessorKey] ?? "")}</div>;
          }
          return null;
        },
        enableSorting: col.sortable,
      });
    });

    return cols;
  }, [columns, selectable, onSortChange]);

  const table = useReactTable({
    data,
    columns: tableColumns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualSorting: true,
    pageCount: Math.ceil(total / pageSize),
    state: {
      sorting,
      rowSelection,
    },
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    getRowId: (row) => row._id,
  });

  // Handle selection changes
  React.useEffect(() => {
    if (selectable && onSelectionChange) {
      const selectedIds = table.getSelectedRowModel().rows.map((row) => row.original._id);
      onSelectionChange(selectedIds);
    }
  }, [rowSelection, selectable, onSelectionChange, table]);

  const totalPages = Math.ceil(total / pageSize);
  const canPreviousPage = page > 1;
  const canNextPage = page < totalPages;

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                {tableColumns.map((col) => (
                  <TableHead key={col.id}>
                    <Skeleton className="h-4 w-24" />
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: pageSize }).map((_, idx) => (
                <TableRow key={idx}>
                  {tableColumns.map((col) => (
                    <TableCell key={col.id}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  // Empty state
  if (data.length === 0) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {tableColumns.map((col, idx) => (
                <TableHead key={col.id || idx}>
                  {typeof col.header === "function"
                    ? flexRender(col.header, { column: table.getAllColumns()[idx], table } as any)
                    : col.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell colSpan={tableColumns.length} className="h-24 text-center">
                {emptyMessage}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
                onClick={() => onRowClick?.(row.original)}
                className={onRowClick ? "cursor-pointer" : ""}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-2">
        <div className="text-sm text-muted-foreground">
          {selectable && (
            <span>
              {table.getFilteredSelectedRowModel().rows.length} of {total} row(s) selected
            </span>
          )}
        </div>
        <div className="flex items-center space-x-6 lg:space-x-8">
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium">
              Page {page} of {totalPages}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(1)}
              disabled={!canPreviousPage}
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page - 1)}
              disabled={!canPreviousPage}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page + 1)}
              disabled={!canNextPage}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(totalPages)}
              disabled={!canNextPage}
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
