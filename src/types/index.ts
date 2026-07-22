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

// ─────────────────────────────────────────────────────────────
// Ingestion & Email monitoring
// Backend controllers:
//   EDIT/controllers/admin.ingestion.analytics.controller.js
//   EDIT/controllers/admin.email.analytics.controller.js
// All of these endpoints use the { status, message, data } envelope,
// so ApiResponse<T> / PaginatedResponse<T> apply directly.
// ─────────────────────────────────────────────────────────────

/** Populated user reference on a log document (or the raw ObjectId string). */
export interface LogUserRef {
  _id: string;
  email: string;
  name?: string;
}

// ── Ingestion overview (GET /analytics/ingestion/overview) ──
export interface IngestionOverview {
  totals: {
    gmailApiReturned: number;
    totalEmails: number;
    processed: number;
    skipped: number;
    errored: number;
  };
  funnel: {
    sentToAirParser: number;
    webhookProcessed: number;
    airParserRawItems: number;
    filteredItems: number;
    itemsCreated: number;
    itemsSkipped: number;
  };
  quality: {
    usedClassifyFallback: number;
    usedAiItemsFallback: number;
    avgProcessingMs: number | null;
  };
  sync: {
    totalSyncRuns: number;
    avgSyncDurationMs: number | null;
  };
}

// ── Retailer breakdown (GET /analytics/ingestion/retailers) ──
export interface IngestionRetailer {
  retailer: string | null;
  emails: number;
  processed: number;
  skipped: number;
  itemsCreated: number;
  categories: Array<string | null>;
}

// ── Skip & failure reasons (GET /analytics/ingestion/skip-failure-reasons) ──
export interface IngestionSkipReason {
  reason: string | null;
  count: number;
}

export interface IngestionFailureReason {
  classifyMailError: string | null;
  extractClothingError: string | null;
  count: number;
}

export interface IngestionBlockedCounters {
  blockedByKeywords: number;
  blockedByOrderPreFilter: number;
  blockedByNonPurchaseFilter: number;
  blockedByClassifyMail: number;
  alreadyProcessed: number;
  classifyMailFailed: number;
}

export interface IngestionSkipFailure {
  skipReasons: IngestionSkipReason[];
  failureReasons: IngestionFailureReason[];
  blockedCounters: IngestionBlockedCounters;
}

// ── Ingestion trends (GET /analytics/ingestion/trends) ──
export interface IngestionDailyTrend {
  date: string;
  emails: number;
  processed: number;
  skipped: number;
  itemsCreated: number;
}

export interface IngestionSyncHealth {
  status: string | null;
  runs: number;
  avgDurationMs: number | null;
  gmailApiEmails: number;
}

export interface IngestionTrends {
  daily: IngestionDailyTrend[];
  syncHealth: IngestionSyncHealth[];
}

// ── Parser mismatches (GET /analytics/ingestion/parser-mismatches) ──
export interface ParserMismatchSummary {
  totalSentToAirParser: number;
  notWebhookProcessed: number;
  countMismatch: number;
  itemsDroppedAtCreate: number;
}

export interface ParserMismatchItem {
  _id: string;
  gmailMessageId: string;
  user: string | null;
  from: string | null;
  subject: string | null;
  classifyMailCategory: string | null;
  extractedItemCount: number;
  airParserRawItemCount: number;
  airParserFilteredItemCount: number;
  itemsCreatedCount: number;
  itemsSkippedCount: number;
  webhookProcessed: boolean;
  aiVsParserMismatch: boolean;
  parserVsCreatedDrop: number;
  createdAt: string;
}

export interface ParserMismatches {
  summary: ParserMismatchSummary;
  items: ParserMismatchItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// ── Email sync log — one document per sync run (GET /analytics/email-sync) ──
export interface EmailSyncLog {
  _id: string;
  user: string | LogUserRef;
  userEmail: string | null;
  gmailQuery: string | null;
  gmailQueryIncludesTabs: string[];
  gmailQueryExcludesTabs: string[];
  emailFetchDurationInMonths: number | null;
  gmailApiTotalEmails: number;
  gmailApiPagesFetched: number;
  emailsProcessed: number;
  emailsSkipped: number;
  emailsFailed: number;
  emailsBlockedByKeywords: number;
  emailsBlockedByOrderPreFilter: number;
  emailsBlockedByNonPurchaseFilter: number;
  emailsBlockedByClassifyMail: number;
  emailsAlreadyProcessed: number;
  emailsClassifyMailFailed: number;
  emailLimit: number | null;
  syncStartedAt: string | null;
  syncCompletedAt: string | null;
  syncDurationMs: number | null;
  status: 'running' | 'completed' | 'failed';
  errorMessage: string | null;
  createdAt: string;
  updatedAt: string;
}

// ── Email processing log — one document per email (GET /analytics/email-processing) ──
export interface EmailProcessingLog {
  _id: string;
  user: string | LogUserRef;
  gmailMessageId: string;
  subject: string | null;
  from: string | null;
  /** Excluded from list responses; only present when includeHtmlBody=true or on the detail endpoint. */
  htmlBody?: string | null;
  classifyMailResponse: unknown;
  classifyMailCategory: string | null;
  extractClothingResponse: unknown;
  extractedItemCount: number;
  wasSkipped: boolean;
  skipReason: string | null;
  sentToAirParser: boolean;
  airParserDocId: string | null;
  classifyMailError: string | null;
  extractClothingError: string | null;
  usedClassifyFallback: boolean;
  usedAiItemsFallback: boolean;
  processingDurationMs: number | null;
  aiExtractedItems: unknown[];
  airParserRawItems: unknown[];
  airParserFilteredItems: unknown[];
  itemsCreated: unknown[];
  itemsSkipped: unknown[];
  airParserRawItemCount: number;
  airParserFilteredItemCount: number;
  itemsCreatedCount: number;
  itemsSkippedCount: number;
  webhookProcessed: boolean;
  webhookProcessedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

// ── Raw email store — retained ~30 days for debugging ──
export interface RawEmailStore {
  _id: string;
  gmailMessageId: string;
  user: string | LogUserRef;
  htmlBody: string;
  subject: string | null;
  sender: string | null;
  processedByAi: boolean;
  aiPreFilterResponse: unknown;
  createdAt: string;
  updatedAt: string;
}

// ── Email sync summary (GET /analytics/email-sync/summary) ──
export interface EmailSyncSummaryUser {
  _id: string | null;
  userEmail: string | null;
  totalSyncRuns: number;
  totalGmailApiEmails: number;
  totalProcessed: number;
  totalSkipped: number;
  totalFailed: number;
  totalBlockedByKeywords: number;
  totalBlockedByClassifyMail: number;
  totalAlreadyProcessed: number;
  totalClassifyMailFailed: number;
  lastSyncAt: string | null;
  lastGmailQuery: string | null;
  lastExcludedTabs: string[] | null;
  lastIncludedTabs: string[] | null;
}

export interface EmailCategoryCount {
  _id: string | null;
  count: number;
}

export interface EmailSyncSummary {
  perUser: EmailSyncSummaryUser[];
  categoryDistribution: EmailCategoryCount[];
  skipReasonDistribution: EmailCategoryCount[];
  tabAnalysis: {
    note: string;
    excludedCategories: string[];
    includedCategories: string[];
  };
}

// ── Email processing detail (GET /analytics/email-processing/:gmailMessageId) ──
export interface EmailProcessingDetail {
  processingLog: EmailProcessingLog | null;
  rawEmailStore: RawEmailStore | null;
}

// ─────────────────────────────────────────────────────────────
// Push notifications (FCM)
// Backend controller: EDIT/controllers/admin.notification.controller.js
// These endpoints use the { success, message, data } envelope.
// ─────────────────────────────────────────────────────────────

export type DevicePlatform = 'ios' | 'android' | 'web';

/** A user who currently has an active FCM token registered (login-time capture). */
export interface UserWithToken {
  userId: string;
  email: string;
  name: string | null;
  platform: DevicePlatform;
  deviceId: string | null;
  tokenUpdatedAt: string;
}

export interface UsersWithTokensResponse {
  success: boolean;
  message: string;
  data: {
    count: number;
    users: UserWithToken[];
  };
}

export interface SendPushRequest {
  userId: string;
  title: string;
  body: string;
}

/** Per-device delivery outcome returned by the send endpoints. */
export interface PushDiagnostic {
  token: string;
  platform?: DevicePlatform;
  deviceId?: string | null;
  success: boolean;
  messageId?: string;
  error?: { code: string; message: string };
  hint?: string;
}

export interface SendPushResponse {
  success: boolean;
  message: string;
  data: {
    firebaseConfigured: boolean;
    tokenCount?: number;
    delivered?: boolean;
    successCount?: number;
    failureCount?: number;
    diagnostics?: PushDiagnostic[];
  };
}
