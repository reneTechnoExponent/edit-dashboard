"use client";

import React, { useState } from "react";
import { DataTable, DataTableColumn } from "@/components/data-table";
import { DetailPanel } from "@/components/detail-panel";
import { Input } from "@/components/ui/input";
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
import { useGetAuditLogsQuery } from "@/features/audit/auditApi";
import type { AuditLogEntry, AdminUser } from "@/types";

export default function AuditLogsPage() {
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [sortBy, setSortBy] = useState("timestamp");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [adminUserFilter, setAdminUserFilter] = useState<string>("");
  const [actionFilter, setActionFilter] = useState<string>("");
  const [resourceTypeFilter, setResourceTypeFilter] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [selectedLogId, setSelectedLogId] = useState<string | null>(null);

  // Fetch audit logs with filters
  const { data, isLoading, isFetching } = useGetAuditLogsQuery({
    page,
    limit: pageSize,
    sortBy,
    sortOrder,
    ...(adminUserFilter && { adminUserId: adminUserFilter }),
    ...(actionFilter && { action: actionFilter }),
    ...(resourceTypeFilter && { resourceType: resourceTypeFilter }),
    ...(startDate && { startDate }),
    ...(endDate && { endDate }),
  });

  // Column definitions
  const columns: DataTableColumn<AuditLogEntry>[] = [
    {
      id: "adminUserId",
      header: "Admin User",
      cell: (row) => {
        const admin = row.adminUserId as AdminUser;
        return (
          <div className="max-w-[150px] truncate" title={admin?.email}>
            {admin?.email || "Unknown"}
          </div>
        );
      },
    },
    {
      id: "action",
      header: "Action",
      accessorKey: "action",
      sortable: true,
      cell: (row) => (
        <Badge variant="outline">
          {row.action}
        </Badge>
      ),
    },
    {
      id: "resourceType",
      header: "Resource Type",
      accessorKey: "resourceType",
      sortable: true,
      cell: (row) => row.resourceType,
    },
    {
      id: "resourceId",
      header: "Resource ID",
      cell: (row) => (
        <div className="max-w-[120px] truncate font-mono text-xs" title={row.resourceId}>
          {row.resourceId}
        </div>
      ),
    },
    {
      id: "timestamp",
      header: "Timestamp",
      accessorKey: "timestamp",
      sortable: true,
      cell: (row) => new Date(row.timestamp).toLocaleString(),
    },
  ];

  const handleSortChange = (newSortBy: string, newSortOrder: "asc" | "desc") => {
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
    setPage(1);
  };

  const handleRowClick = (row: AuditLogEntry) => {
    setSelectedLogId(row._id);
  };

  const handleActionFilterChange = (value: string) => {
    setActionFilter(value === "all" ? "" : value);
    setPage(1);
  };

  const handleResourceTypeFilterChange = (value: string) => {
    setResourceTypeFilter(value === "all" ? "" : value);
    setPage(1);
  };

  const selectedLog: AuditLogEntry | undefined = data?.data?.items.find((log) => log._id === selectedLogId);
  const logAdmin = selectedLog?.adminUserId as AdminUser | undefined;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Audit Logs</h1>
        <p className="text-muted-foreground">
          Track administrative actions and changes
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Filter audit logs by various criteria</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {/* Admin User Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Admin User</label>
              <Input
                placeholder="Enter admin ID or email..."
                value={adminUserFilter}
                onChange={(e) => setAdminUserFilter(e.target.value)}
              />
            </div>

            {/* Action Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Action</label>
              <Select value={actionFilter || "all"} onValueChange={handleActionFilterChange}>
                <SelectTrigger>
                  <SelectValue placeholder="All actions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All actions</SelectItem>
                  <SelectItem value="create">Create</SelectItem>
                  <SelectItem value="update">Update</SelectItem>
                  <SelectItem value="delete">Delete</SelectItem>
                  <SelectItem value="login">Login</SelectItem>
                  <SelectItem value="logout">Logout</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Resource Type Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Resource Type</label>
              <Select
                value={resourceTypeFilter || "all"}
                onValueChange={handleResourceTypeFilterChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All resources" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All resources</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="clothing_item">Clothing Item</SelectItem>
                  <SelectItem value="collection">Collection</SelectItem>
                  <SelectItem value="subscription">Subscription</SelectItem>
                  <SelectItem value="cron_job">Cron Job</SelectItem>
                </SelectContent>
              </Select>
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
        emptyMessage="No audit logs found"
      />

      {/* Detail Panel */}
      <DetailPanel
        open={!!selectedLogId}
        onOpenChange={(open) => !open && setSelectedLogId(null)}
        title="Audit Log Details"
        description={selectedLog?.action}
      >
        {selectedLog ? (
          <div className="space-y-6">
            {/* Action Information */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Action Information</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Action</p>
                  <Badge variant="outline">{selectedLog.action}</Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Resource Type</p>
                  <p className="font-medium">{selectedLog.resourceType}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Resource ID</p>
                  <p className="font-mono text-sm">{selectedLog.resourceId}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Timestamp</p>
                  <p className="font-medium">
                    {new Date(selectedLog.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Admin User Information */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Admin User</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{logAdmin?.email || "Unknown"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Role</p>
                  <Badge variant={logAdmin?.role === 'super_admin' ? 'default' : 'secondary'}>
                    {logAdmin?.role || "Unknown"}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Admin ID</p>
                  <p className="font-mono text-sm">
                    {typeof selectedLog.adminUserId === 'string' 
                      ? selectedLog.adminUserId 
                      : logAdmin?._id}
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            {/* IP Address */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Network Information</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">IP Address</p>
                  <p className="font-mono text-sm">{selectedLog.ipAddress}</p>
                </div>
              </div>
            </div>

            {/* Previous Value */}
            {selectedLog.previousValue ? (
              <React.Fragment>
                <Separator />
                <div>
                  <h3 className="text-lg font-semibold mb-3">Previous Value</h3>
                  <pre className="bg-muted p-3 rounded-lg text-xs overflow-auto max-h-48">
                    {JSON.stringify(selectedLog.previousValue, null, 2)}
                  </pre>
                </div>
              </React.Fragment>
            ) : null}

            {/* New Value */}
            {selectedLog.newValue ? (
              <React.Fragment>
                <Separator />
                <div>
                  <h3 className="text-lg font-semibold mb-3">New Value</h3>
                  <pre className="bg-muted p-3 rounded-lg text-xs overflow-auto max-h-48">
                    {JSON.stringify(selectedLog.newValue, null, 2)}
                  </pre>
                </div>
              </React.Fragment>
            ) : null}
          </div>
        ) : null}
      </DetailPanel>
    </div>
  );
}
