"use client";

import { useState } from "react";
import { DetailPanel } from "@/components/detail-panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetEmailProcessingDetailQuery } from "@/features/emailLogs/emailLogsApi";
import type { EmailProcessingLog, LogUserRef } from "@/types";
import { formatDateTime, formatDuration, formatNumber, toPrettyJson } from "@/lib/format";
import { AlertTriangle, Code2, FileWarning } from "lucide-react";

interface EmailDetailPanelProps {
  gmailMessageId: string | null;
  onClose: () => void;
}

function userEmailOf(user: string | LogUserRef | null | undefined): string {
  if (!user) return "—";
  if (typeof user === "string") return user;
  return user.email || user._id;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <p className="text-xs text-muted-foreground">{label}</p>
      <div className="text-sm font-medium break-words">{children}</div>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">{children}</h3>;
}

function BoolBadge({ value, trueLabel, falseLabel, invert = false }: {
  value: boolean;
  trueLabel: string;
  falseLabel: string;
  /** When true, a `true` value is the "bad" (destructive) state. */
  invert?: boolean;
}) {
  const good = invert ? !value : value;
  return (
    <Badge variant={good ? "default" : value ? "destructive" : "secondary"}>
      {value ? trueLabel : falseLabel}
    </Badge>
  );
}

function CountTile({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-lg font-bold">{formatNumber(value)}</p>
    </div>
  );
}

function JsonBlock({ title, value }: { title: string; value: unknown }) {
  const [open, setOpen] = useState(false);
  const json = toPrettyJson(value);
  const hasContent = json && json !== "null" && json !== "{}" && json !== "[]";

  return (
    <div className="rounded-lg border">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-3 py-2 text-sm font-medium hover:bg-muted/50"
      >
        <span className="flex items-center gap-2">
          <Code2 className="h-4 w-4 text-muted-foreground" />
          {title}
        </span>
        <span className="text-xs text-muted-foreground">
          {hasContent ? (open ? "Hide" : "Show") : "Empty"}
        </span>
      </button>
      {open && hasContent && (
        <pre className="max-h-80 overflow-auto border-t bg-muted/30 p-3 text-xs leading-relaxed">
          {json}
        </pre>
      )}
    </div>
  );
}

function EmailBodyPreview({ html }: { html: string }) {
  const [mode, setMode] = useState<"rendered" | "source">("rendered");

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <SectionTitle>Email Body</SectionTitle>
        <div className="flex gap-1">
          <Button
            variant={mode === "rendered" ? "default" : "outline"}
            size="sm"
            onClick={() => setMode("rendered")}
          >
            Rendered
          </Button>
          <Button
            variant={mode === "source" ? "default" : "outline"}
            size="sm"
            onClick={() => setMode("source")}
          >
            Source
          </Button>
        </div>
      </div>
      {mode === "rendered" ? (
        // Untrusted external HTML: render in a fully sandboxed iframe (scripts,
        // forms, popups and top-navigation all disabled) so nothing can execute.
        <iframe
          sandbox=""
          srcDoc={html}
          title="Email body preview"
          className="h-96 w-full rounded-lg border bg-white"
        />
      ) : (
        <pre className="max-h-96 overflow-auto rounded-lg border bg-muted/30 p-3 text-xs leading-relaxed">
          {html}
        </pre>
      )}
    </div>
  );
}

function DetailBody({ log, html }: { log: EmailProcessingLog; html: string | null }) {
  return (
    <div className="space-y-6">
      {/* Overview */}
      <section className="space-y-3">
        <SectionTitle>Overview</SectionTitle>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Subject">{log.subject || "—"}</Field>
          <Field label="From">{log.from || "—"}</Field>
          <Field label="User">{userEmailOf(log.user)}</Field>
          <Field label="Category">{log.classifyMailCategory || "—"}</Field>
          <Field label="Gmail Message ID">
            <span className="font-mono text-xs">{log.gmailMessageId}</span>
          </Field>
          <Field label="Processed At">{formatDateTime(log.createdAt)}</Field>
          <Field label="Processing Time">{formatDuration(log.processingDurationMs)}</Field>
          <Field label="Webhook Processed At">{formatDateTime(log.webhookProcessedAt)}</Field>
        </div>
      </section>

      <Separator />

      {/* Pipeline status */}
      <section className="space-y-3">
        <SectionTitle>Pipeline Status</SectionTitle>
        <div className="flex flex-wrap gap-2">
          <BoolBadge value={log.wasSkipped} trueLabel="Skipped" falseLabel="Not Skipped" invert />
          <BoolBadge value={log.sentToAirParser} trueLabel="Sent to AirParser" falseLabel="Not Sent" />
          <BoolBadge value={log.webhookProcessed} trueLabel="Webhook Processed" falseLabel="Webhook Pending" />
          {log.usedClassifyFallback && <Badge variant="outline">Classify Fallback</Badge>}
          {log.usedAiItemsFallback && <Badge variant="outline">AI Items Fallback</Badge>}
        </div>

        {log.wasSkipped && log.skipReason && (
          <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
            <FileWarning className="mt-0.5 h-4 w-4 shrink-0" />
            <div>
              <p className="font-medium">Skip reason</p>
              <p>{log.skipReason}</p>
            </div>
          </div>
        )}

        {(log.classifyMailError || log.extractClothingError) && (
          <div className="space-y-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm">
            <p className="flex items-center gap-2 font-medium text-destructive">
              <AlertTriangle className="h-4 w-4" /> Processing errors
            </p>
            {log.classifyMailError && (
              <p><span className="text-muted-foreground">classifyMail:</span> {log.classifyMailError}</p>
            )}
            {log.extractClothingError && (
              <p><span className="text-muted-foreground">extractClothing:</span> {log.extractClothingError}</p>
            )}
          </div>
        )}
      </section>

      <Separator />

      {/* Item funnel */}
      <section className="space-y-3">
        <SectionTitle>Item Funnel</SectionTitle>
        <div className="grid grid-cols-3 gap-3">
          <CountTile label="AI Extracted" value={log.extractedItemCount} />
          <CountTile label="Parser Raw" value={log.airParserRawItemCount} />
          <CountTile label="Parser Filtered" value={log.airParserFilteredItemCount} />
          <CountTile label="Items Created" value={log.itemsCreatedCount} />
          <CountTile label="Items Skipped" value={log.itemsSkippedCount} />
        </div>
      </section>

      <Separator />

      {/* Raw AI responses */}
      <section className="space-y-2">
        <SectionTitle>Raw AI Responses</SectionTitle>
        <JsonBlock title="classifyMail response" value={log.classifyMailResponse} />
        <JsonBlock title="extractClothing response" value={log.extractClothingResponse} />
        <JsonBlock title="AI extracted items" value={log.aiExtractedItems} />
        <JsonBlock title="AirParser raw items" value={log.airParserRawItems} />
        <JsonBlock title="AirParser filtered items" value={log.airParserFilteredItems} />
        <JsonBlock title="Items created" value={log.itemsCreated} />
        <JsonBlock title="Items skipped" value={log.itemsSkipped} />
      </section>

      {html && (
        <>
          <Separator />
          <EmailBodyPreview html={html} />
        </>
      )}
    </div>
  );
}

export function EmailDetailPanel({ gmailMessageId, onClose }: EmailDetailPanelProps) {
  const { data, isLoading, isFetching } = useGetEmailProcessingDetailQuery(gmailMessageId!, {
    skip: !gmailMessageId,
  });

  const log = data?.data?.processingLog ?? null;
  const rawStore = data?.data?.rawEmailStore ?? null;
  const html = log?.htmlBody ?? rawStore?.htmlBody ?? null;
  const loading = isLoading || isFetching;

  return (
    <DetailPanel
      open={!!gmailMessageId}
      onOpenChange={(open) => !open && onClose()}
      title="Email Processing Detail"
      description={log?.subject || gmailMessageId || undefined}
    >
      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-6 w-2/3" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      ) : log ? (
        <DetailBody log={log} html={html} />
      ) : (
        <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
          No processing log found for this email. The raw record may have expired
          (raw email bodies are retained for roughly 30 days).
        </div>
      )}
    </DetailPanel>
  );
}
