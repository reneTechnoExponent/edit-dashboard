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
  planTier?: 'trial' | 'basic' | 'pro' | 'free';
  isSubscribed: boolean;
  connectGmail: boolean;
  connectGoogleCalendar: boolean;
  isFaceIdEnable: boolean;
  customerId: string | null;
  isDeleted: boolean;
  emailSyncStatus?: string;
  calendarSyncStatus?: string;
  lastActiveAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ClothingItem {
  _id: string;
  user: string | User;
  clothingMenu: Array<string | { _id: string; title: string }>;
  title: string;
  image: string | null;
  size: string | null;
  color: string | null;
  purchasedon: string | null;
  isParsedByAi: boolean;
  isBackgroundRemovedByAi: boolean;
  brand: string | null;
  price: number | null;
  subcategory: string | { _id: string; title: string } | null;
  attributes: Array<{ 
    attribute: string | { _id: string; name: string }; 
    value: string | { _id: string; value: string };
  }>;
  sourceDocId?: string | null;
  itemLink?: string | null;
  lastAiParsedAttemptedOn?: string | null;
  lastBackgroundRemovalAttemptedOn?: string | null;
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

// Event tracking analytics (from analytics-tracking spec)
export type AnalyticsEventType =
  | 'outfit_generated'
  | 'outfit_saved'
  | 'item_swapped'
  | 'regenerate_triggered'
  | 'manual_outfit_created';

export type EventsByType = Record<AnalyticsEventType, number>;

export interface AnalyticsEventSummary {
  total_events: number;
  events_by_type: EventsByType;
  unique_users: number;
  save_rate: number;
}

export interface ItemFrequencyEntry {
  item_id: string;
  count: number;
  uniqueUserCount: number;
  fromClosetCount: number;
  lastSavedAt: string;
  firstSavedAt: string;
  title: string | null;
  image: string | null;
  brand: string | null;
  color: string | null;
  size: string | null;
  category: string | null;
}

export interface ItemFrequency {
  items: ItemFrequencyEntry[];
  window_days: number;
  total_saves: number;
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

// Per-user analytics drill-down (manager request: per-user event history,
// item_ids consistency, server timestamps, calendar/event/outfit associations)
export interface AnalyticsUserStatsRow {
  _id: string;
  email: string;
  status: 'active' | 'inactive';
  isSubscribed: boolean;
  createdAt: string;
  lastActiveAt: string | null;
  totalEvents: number;
  firstEventAt: string | null;
  lastEventAt: string | null;
  eventsByType: EventsByType;
}

export interface AnalyticsUserTopItem {
  item_id: string;
  count: number;
  fromCloset: number;
  title: string | null;
  image: string | null;
}

export interface AnalyticsUserSummary {
  userId: string;
  totalEvents: number;
  firstEventAt: string | null;
  lastEventAt: string | null;
  eventsByType: EventsByType;
  saveRate: number;
  topItems: AnalyticsUserTopItem[];
  linkedOutfitCount: number;
  linkedSavedOutfitCount: number;
}

export interface AnalyticsItemRef {
  _id: string;
  title: string | null;
  image: string | null;
}

export interface AnalyticsEventItemEntry {
  item_id: string | null;
  is_from_closet: boolean;
  item: AnalyticsItemRef | null;
}

export interface AnalyticsEventLinkedOutfit {
  kind: 'recommendation' | 'savedOutfit';
  recommendationId: string | null;
  savedOutfitId: string | null;
  status?: string;
  title?: string | null;
  source?: string | null;
  createdAt: string;
  event: {
    _id?: string;
    title: string;
    startTime: string;
    endTime: string;
    source: 'calendar' | 'manual';
  } | null;
}

export interface AnalyticsEventEntry {
  _id: string;
  event_type: AnalyticsEventType;
  user_id: string;
  outfit_id: string | null;
  outfit: AnalyticsEventLinkedOutfit | null;
  timestamp: string;
  createdAt: string;
  updatedAt: string;
  data: {
    item_ids: AnalyticsEventItemEntry[];
    original_item_id: string | null;
    original_item: AnalyticsItemRef | null;
    new_item_id: string | null;
    new_item: AnalyticsItemRef | null;
    category: string | null;
    type: 'full' | 'item' | null;
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
