"use client";

import { useState } from "react";
import { useAppSelector } from "@/lib/hooks";
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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Gift, Ban } from "lucide-react";
import {
  useGetSubscriptionsQuery,
  useGetSubscriptionDetailsQuery,
  useUpdateSubscriptionStatusMutation,
  useGrantComplimentaryMutation,
  useCancelSubscriptionMutation,
} from "@/features/subscriptions/subscriptionsApi";
import type { Subscription, User } from "@/types";

export default function SubscriptionsPage() {
  const admin = useAppSelector((state) => state.auth.admin);
  const isSuperAdmin = admin?.role === 'super_admin';

  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [planTypeFilter, setPlanTypeFilter] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [selectedSubscriptionId, setSelectedSubscriptionId] = useState<string | null>(null);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelImmediate, setCancelImmediate] = useState(false);
  const [grantDialogOpen, setGrantDialogOpen] = useState(false);
  const [grantUserId, setGrantUserId] = useState("");
  const [grantDuration, setGrantDuration] = useState("30");
  const [grantPlanType, setGrantPlanType] = useState("premium");

  // Fetch subscriptions with filters
  const { data, isLoading, isFetching } = useGetSubscriptionsQuery({
    page,
    limit: pageSize,
    sortBy,
    sortOrder,
    ...(statusFilter && { status: statusFilter }),
    ...(planTypeFilter && { planType: planTypeFilter }),
    ...(startDate && { startDate }),
    ...(endDate && { endDate }),
  });

  // Fetch selected subscription details
  const { data: subscriptionDetails, isLoading: isLoadingDetails } = useGetSubscriptionDetailsQuery(
    selectedSubscriptionId!,
    { skip: !selectedSubscriptionId }
  );

  const [updateSubscriptionStatus] = useUpdateSubscriptionStatusMutation();
  const [grantComplimentary, { isLoading: isGranting }] = useGrantComplimentaryMutation();
  const [cancelSubscription, { isLoading: isCancelling }] = useCancelSubscriptionMutation();

  // Column definitions
  const columns: DataTableColumn<Subscription>[] = [
    {
      id: "user",
      header: "User Email",
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
      id: "planType",
      header: "Plan",
      accessorKey: "planType",
      sortable: true,
      cell: (row) => (
        <Badge variant="outline">
          {row.planType || "—"}
        </Badge>
      ),
    },
    {
      id: "status",
      header: "Status",
      accessorKey: "status",
      sortable: true,
      cell: (row) => {
        const variant = row.status === "active" ? "default" : 
                       row.status === "cancelled" ? "destructive" : "secondary";
        return (
          <Badge variant={variant}>
            {row.status}
          </Badge>
        );
      },
    },
    {
      id: "startDate",
      header: "Start Date",
      accessorKey: "startDate",
      sortable: true,
      cell: (row) => new Date(row.startDate).toLocaleDateString(),
    },
    {
      id: "endDate",
      header: "End Date",
      accessorKey: "endDate",
      sortable: true,
      cell: (row) => row.endDate ? new Date(row.endDate).toLocaleDateString() : "—",
    },
  ];

  const handleSortChange = (newSortBy: string, newSortOrder: "asc" | "desc") => {
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
    setPage(1);
  };

  const handleRowClick = (row: Subscription) => {
    setSelectedSubscriptionId(row._id);
  };

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value === "all" ? "" : value);
    setPage(1);
  };

  const handlePlanTypeFilterChange = (value: string) => {
    setPlanTypeFilter(value === "all" ? "" : value);
    setPage(1);
  };

  const handleUpdateStatus = async (newStatus: string) => {
    if (!selectedSubscriptionId) return;

    try {
      await updateSubscriptionStatus({ id: selectedSubscriptionId, status: newStatus }).unwrap();
      toast.success("Subscription status updated successfully");
    } catch (error: any) {
      const errorMessage =
        error?.data?.message || error?.message || "Failed to update subscription status";
      toast.error(errorMessage);
    }
  };

  const handleCancelClick = () => {
    setCancelDialogOpen(true);
  };

  const confirmCancel = async () => {
    if (!selectedSubscriptionId) return;

    try {
      await cancelSubscription({ id: selectedSubscriptionId, immediate: cancelImmediate }).unwrap();
      toast.success(`Subscription ${cancelImmediate ? 'cancelled immediately' : 'scheduled for cancellation'}`);
      setSelectedSubscriptionId(null);
    } catch (error: any) {
      const errorMessage =
        error?.data?.message || error?.message || "Failed to cancel subscription";
      toast.error(errorMessage);
    }
  };

  const handleGrantComplimentary = async () => {
    if (!grantUserId || !grantDuration) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      await grantComplimentary({
        userId: grantUserId,
        duration: parseInt(grantDuration),
        planType: grantPlanType,
      }).unwrap();
      toast.success("Complimentary subscription granted successfully");
      setGrantDialogOpen(false);
      setGrantUserId("");
      setGrantDuration("30");
      setGrantPlanType("premium");
    } catch (error: any) {
      const errorMessage =
        error?.data?.message || error?.message || "Failed to grant complimentary subscription";
      toast.error(errorMessage);
    }
  };

  const subscription = subscriptionDetails?.data?.subscription;
  const subscriptionUser = subscription?.user as User | undefined;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Subscriptions</h1>
          <p className="text-muted-foreground">
            Manage user subscriptions and billing
          </p>
        </div>
        {isSuperAdmin && (
          <Button onClick={() => setGrantDialogOpen(true)}>
            <Gift className="mr-2 h-4 w-4" />
            Grant Complimentary
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Filter subscriptions by status, plan, and date range</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
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
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Plan Type Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Plan Type</label>
              <Select value={planTypeFilter || "all"} onValueChange={handlePlanTypeFilterChange}>
                <SelectTrigger>
                  <SelectValue placeholder="All plans" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All plans</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                  <SelectItem value="basic">Basic</SelectItem>
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
        emptyMessage="No subscriptions found"
      />

      {/* Detail Panel */}
      <DetailPanel
        open={!!selectedSubscriptionId}
        onOpenChange={(open) => !open && setSelectedSubscriptionId(null)}
        title="Subscription Details"
        description={subscriptionUser?.email}
      >
        {isLoadingDetails ? (
          <div className="space-y-4">
            <div className="h-4 bg-muted animate-pulse rounded" />
            <div className="h-4 bg-muted animate-pulse rounded" />
            <div className="h-4 bg-muted animate-pulse rounded" />
          </div>
        ) : subscription ? (
          <div className="space-y-6">
            {/* Subscription Information */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Subscription Information</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Plan Type</p>
                  <p className="font-medium">{subscription.planType || "—"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge variant={subscription.status === "active" ? "default" : "secondary"}>
                    {subscription.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Start Date</p>
                  <p className="font-medium">
                    {new Date(subscription.startDate).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">End Date</p>
                  <p className="font-medium">
                    {subscription.endDate ? new Date(subscription.endDate).toLocaleDateString() : "—"}
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Payment Information */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Payment Information</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Customer ID</p>
                  <p className="font-mono text-sm">{subscription.paymentInfo.customerId || "—"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Subscription ID</p>
                  <p className="font-mono text-sm">{subscription.paymentInfo.subscriptionId || "—"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Last Payment Date</p>
                  <p className="font-medium">
                    {subscription.paymentInfo.lastPaymentDate 
                      ? new Date(subscription.paymentInfo.lastPaymentDate).toLocaleDateString()
                      : "—"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Next Payment Date</p>
                  <p className="font-medium">
                    {subscription.paymentInfo.nextPaymentDate 
                      ? new Date(subscription.paymentInfo.nextPaymentDate).toLocaleDateString()
                      : "—"}
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            {/* User Information */}
            <div>
              <h3 className="text-lg font-semibold mb-3">User Information</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">User Email</p>
                  <p className="font-medium">{subscriptionUser?.email || "Unknown"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">User ID</p>
                  <p className="font-mono text-sm">
                    {typeof subscription.user === 'string' ? subscription.user : subscriptionUser?._id}
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Dates */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Record Dates</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Created At</p>
                  <p className="font-medium">
                    {new Date(subscription.createdAt).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Last Updated</p>
                  <p className="font-medium">
                    {new Date(subscription.updatedAt).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Actions */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Actions</h3>
              <div className="space-y-2">
                {subscription.status === "active" ? (
                  <>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => handleUpdateStatus("inactive")}
                    >
                      Deactivate Subscription
                    </Button>
                    <Button
                      variant="destructive"
                      className="w-full"
                      onClick={handleCancelClick}
                      disabled={isCancelling}
                    >
                      {isCancelling ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Cancelling...
                        </>
                      ) : (
                        <>
                          <Ban className="mr-2 h-4 w-4" />
                          Cancel Subscription
                        </>
                      )}
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="default"
                    className="w-full"
                    onClick={() => handleUpdateStatus("active")}
                  >
                    Activate Subscription
                  </Button>
                )}
              </div>
            </div>
          </div>
        ) : null}
      </DetailPanel>

      {/* Cancel Confirmation Dialog */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Subscription</DialogTitle>
            <DialogDescription>
              Choose how to cancel this subscription
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Cancellation Type</Label>
              <Select
                value={cancelImmediate ? "immediate" : "end-of-period"}
                onValueChange={(value) => setCancelImmediate(value === "immediate")}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="end-of-period">End of Period</SelectItem>
                  <SelectItem value="immediate">Immediate</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                {cancelImmediate
                  ? "Subscription will be cancelled immediately"
                  : "Subscription will remain active until the end of the current billing period"}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmCancel} disabled={isCancelling}>
              {isCancelling ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Cancelling...
                </>
              ) : (
                "Confirm Cancellation"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Grant Complimentary Dialog */}
      <Dialog open={grantDialogOpen} onOpenChange={setGrantDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Grant Complimentary Subscription</DialogTitle>
            <DialogDescription>
              Provide a free subscription to a user
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="userId">User ID or Email</Label>
              <Input
                id="userId"
                placeholder="Enter user ID or email..."
                value={grantUserId}
                onChange={(e) => setGrantUserId(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="planType">Plan Type</Label>
              <Select value={grantPlanType} onValueChange={setGrantPlanType}>
                <SelectTrigger id="planType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="premium">Premium</SelectItem>
                  <SelectItem value="basic">Basic</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (days)</Label>
              <Input
                id="duration"
                type="number"
                placeholder="30"
                value={grantDuration}
                onChange={(e) => setGrantDuration(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setGrantDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleGrantComplimentary} disabled={isGranting}>
              {isGranting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Granting...
                </>
              ) : (
                "Grant Subscription"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
