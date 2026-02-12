"use client";

import { useState } from "react";
import { DataTable, DataTableColumn } from "@/components/data-table";
import { DetailPanel } from "@/components/detail-panel";
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
import { Search, X } from "lucide-react";
import {
  useGetUsersQuery,
  useGetUserDetailsQuery,
  useUpdateUserStatusMutation,
} from "@/features/users/usersApi";
import type { User } from "@/types";

export default function UsersPage() {
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [subscriptionFilter, setSubscriptionFilter] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  // Fetch users with filters
  const { data, isLoading, isFetching } = useGetUsersQuery({
    page,
    limit: pageSize,
    sortBy,
    sortOrder,
    ...(statusFilter && { status: statusFilter }),
    ...(subscriptionFilter && { isSubscribed: subscriptionFilter }),
    ...(searchQuery && { search: searchQuery }),
  });

  // Fetch selected user details
  const { data: userDetails, isLoading: isLoadingDetails } = useGetUserDetailsQuery(
    selectedUserId!,
    { skip: !selectedUserId }
  );

  const [updateUserStatus] = useUpdateUserStatusMutation();

  // Column definitions
  const columns: DataTableColumn<User>[] = [
    {
      id: "email",
      header: "Email",
      accessorKey: "email",
      sortable: true,
    },
    {
      id: "status",
      header: "Status",
      accessorKey: "status",
      sortable: true,
      cell: (row) => (
        <Badge variant={row.status === "active" ? "default" : "secondary"}>
          {row.status}
        </Badge>
      ),
    },
    {
      id: "isSubscribed",
      header: "Subscription",
      accessorKey: "isSubscribed",
      sortable: true,
      cell: (row) => (
        <Badge variant={row.isSubscribed ? "default" : "outline"}>
          {row.isSubscribed ? "Subscribed" : "Free"}
        </Badge>
      ),
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

  const handleRowClick = (row: User) => {
    setSelectedUserId(row._id);
  };

  const handleSearch = () => {
    setSearchQuery(searchInput);
    setPage(1);
  };

  const handleClearSearch = () => {
    setSearchInput("");
    setSearchQuery("");
    setPage(1);
  };

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value === "all" ? "" : value);
    setPage(1);
  };

  const handleSubscriptionFilterChange = (value: string) => {
    setSubscriptionFilter(value === "all" ? "" : value);
    setPage(1);
  };

  const handleUpdateStatus = async (newStatus: string) => {
    if (!selectedUserId) return;

    try {
      await updateUserStatus({ id: selectedUserId, status: newStatus }).unwrap();
      toast.success("User status updated successfully");
    } catch (error: any) {
      const errorMessage =
        error?.data?.message || error?.message || "Failed to update user status";
      toast.error(errorMessage);
    }
  };

  const user = userDetails?.data?.user;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Users</h1>
        <p className="text-muted-foreground">
          Manage user accounts and view user information
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Filter and search users</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {/* Search */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Search by Email</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Enter email..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    className="pl-8"
                  />
                  {searchInput && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleClearSearch}
                      className="absolute right-0 top-0 h-full px-3"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <Button onClick={handleSearch}>Search</Button>
              </div>
            </div>

            {/* Status Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={statusFilter || "all"} onValueChange={handleStatusFilterChange}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Subscription Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Subscription Status</label>
              <Select
                value={subscriptionFilter || "all"}
                onValueChange={handleSubscriptionFilterChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All subscriptions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All subscriptions</SelectItem>
                  <SelectItem value="true">Subscribed</SelectItem>
                  <SelectItem value="false">Free</SelectItem>
                </SelectContent>
              </Select>
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
        emptyMessage="No users found"
      />

      {/* Detail Panel */}
      <DetailPanel
        open={!!selectedUserId}
        onOpenChange={(open) => !open && setSelectedUserId(null)}
        title="User Details"
        description={user?.email}
      >
        {isLoadingDetails ? (
          <div className="space-y-4">
            <div className="h-4 bg-muted animate-pulse rounded" />
            <div className="h-4 bg-muted animate-pulse rounded" />
            <div className="h-4 bg-muted animate-pulse rounded" />
          </div>
        ) : user ? (
          <div className="space-y-6">
            {/* Profile Information */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Profile Information</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{user.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">User ID</p>
                  <p className="font-mono text-sm">{user._id}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Account Status</p>
                  <Badge variant={user.status === "active" ? "default" : "secondary"}>
                    {user.status}
                  </Badge>
                </div>
              </div>
            </div>

            <Separator />

            {/* Subscription Status */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Subscription Status</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Subscription</p>
                  <Badge variant={user.isSubscribed ? "default" : "outline"}>
                    {user.isSubscribed ? "Subscribed" : "Free"}
                  </Badge>
                </div>
                {user.customerId && (
                  <div>
                    <p className="text-sm text-muted-foreground">Customer ID</p>
                    <p className="font-mono text-sm">{user.customerId}</p>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Authentication Methods */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Authentication Methods</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Gmail Connected</span>
                  <Badge variant={user.connectGmail ? "default" : "outline"}>
                    {user.connectGmail ? "Yes" : "No"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Google Calendar Connected</span>
                  <Badge variant={user.connectGoogleCalendar ? "default" : "outline"}>
                    {user.connectGoogleCalendar ? "Yes" : "No"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Face ID Enabled</span>
                  <Badge variant={user.isFaceIdEnable ? "default" : "outline"}>
                    {user.isFaceIdEnable ? "Yes" : "No"}
                  </Badge>
                </div>
              </div>
            </div>

            <Separator />

            {/* Account Dates */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Account Information</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Created At</p>
                  <p className="font-medium">
                    {new Date(user.createdAt).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Last Updated</p>
                  <p className="font-medium">
                    {new Date(user.updatedAt).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Actions */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Actions</h3>
              <div className="space-y-2">
                {user.status === "active" ? (
                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={() => handleUpdateStatus("inactive")}
                  >
                    Deactivate User
                  </Button>
                ) : (
                  <Button
                    variant="default"
                    className="w-full"
                    onClick={() => handleUpdateStatus("active")}
                  >
                    Activate User
                  </Button>
                )}
              </div>
            </div>
          </div>
        ) : null}
      </DetailPanel>
    </div>
  );
}
