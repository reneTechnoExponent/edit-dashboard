// API response wrapper
export interface ApiResponse<T> {
  status: boolean;
  message: string;
  data: T;
}

export interface PaginatedResponse<T> {
  status: boolean;
  message: string;
  data: {
    items: T[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

// Domain models
export interface AdminUser {
  _id: string;
  email: string;
  role: 'admin' | 'super_admin';
  isActive: boolean;
  lastLogin: string | null;
}

export interface User {
  _id: string;
  email: string;
  status: 'active' | 'inactive';
  isSubscribed: boolean;
  connectGmail: boolean;
  connectGoogleCalendar: boolean;
  isFaceIdEnable: boolean;
  customerId: string | null;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ClothingItem {
  _id: string;
  user: string | User;
  clothingMenu: string[];
  title: string;
  image: string | null;
  size: string | null;
  color: string | null;
  purchasedon: string | null;
  isParsedByAi: boolean;
  isBackgroundRemovedByAi: boolean;
  brand: string | null;
  price: number | null;
  subcategory: string | null;
  attributes: Array<{ attribute: string; value: string }>;
  createdAt: string;
  updatedAt: string;
}

export interface UserCollection {
  _id: string;
  user: string | User;
  title: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Subscription {
  _id: string;
  user: string | User;
  planType: string;
  status: 'active' | 'inactive' | 'cancelled' | 'expired';
  startDate: string;
  endDate: string | null;
  paymentInfo: {
    customerId: string | null;
    subscriptionId: string | null;
    lastPaymentDate: string | null;
    nextPaymentDate: string | null;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CronJobStatus {
  jobName: string;
  lastExecution: string | null;
  lastStatus: 'success' | 'failure' | null;
  last24Hours: { successCount: number; failureCount: number };
}

export interface AuditLogEntry {
  _id: string;
  adminUserId: string | AdminUser;
  action: string;
  resourceType: string;
  resourceId: string;
  previousValue: unknown;
  newValue: unknown;
  ipAddress: string;
  timestamp: string;
}

export interface AnalyticsMetrics {
  users: {
    newUsers: number;
    activeUsers: number;
    totalUsers: number;
    growthRate: number;
  };
  clothingItems: {
    totalItems: number;
    averageItemsPerUser: number;
    categoryDistribution: Array<{ _id: string; count: number }>;
  };
  subscriptions: {
    activeSubscriptions: number;
    newSubscriptions: number;
    conversionRate: number;
  };
}

// Table configuration
export interface TableColumn<T> {
  id: string;
  header: string;
  accessorKey?: keyof T;
  cell?: (row: T) => React.ReactNode;
  sortable?: boolean;
}

// Filter state
export interface TableFilters {
  page: number;
  limit: number;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  [key: string]: string | number;
}
