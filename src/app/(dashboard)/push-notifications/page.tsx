'use client';

import { useMemo, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  useGetUsersWithTokensQuery,
  useSendPushToUserMutation,
} from '@/features/notifications/notificationsApi';
import type { PushDiagnostic, SendPushResponse } from '@/types';
import {
  Info,
  Send,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  XCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const TITLE_MAX = 100;
const BODY_MAX = 500;

const TOKEN_NOTE =
  'Only users with an available device token appear here. A token is captured when the user logs in to the app, so users who never logged in (or denied notification permission) will not be listed.';

type ResultKind = 'success' | 'warning' | 'error';

function classifyResult(res: SendPushResponse): {
  kind: ResultKind;
  heading: string;
} {
  if (!res.data.firebaseConfigured) {
    return { kind: 'error', heading: res.message };
  }
  if (res.data.tokenCount === 0) {
    return { kind: 'warning', heading: res.message };
  }
  if (res.data.delivered) {
    return { kind: 'success', heading: res.message };
  }
  return { kind: 'error', heading: res.message };
}

const RESULT_STYLES: Record<ResultKind, string> = {
  success: 'border-green-200 bg-green-50 text-green-800',
  warning: 'border-amber-200 bg-amber-50 text-amber-800',
  error: 'border-red-200 bg-red-50 text-red-800',
};

function ResultIcon({ kind }: { kind: ResultKind }) {
  if (kind === 'success') return <CheckCircle2 className="h-5 w-5 shrink-0" />;
  if (kind === 'warning') return <AlertTriangle className="h-5 w-5 shrink-0" />;
  return <XCircle className="h-5 w-5 shrink-0" />;
}

function DiagnosticRow({ d }: { d: PushDiagnostic }) {
  return (
    <div className="rounded-md border bg-white/60 px-3 py-2 text-sm">
      <div className="flex items-center gap-2">
        {d.success ? (
          <CheckCircle2 className="h-4 w-4 text-green-600" />
        ) : (
          <XCircle className="h-4 w-4 text-red-600" />
        )}
        <span className="font-medium">
          {d.success ? 'Delivered' : 'Failed'}
        </span>
        {d.platform && (
          <Badge variant="secondary" className="uppercase">
            {d.platform}
          </Badge>
        )}
        <span className="text-muted-foreground font-mono text-xs">
          {d.token}
        </span>
      </div>
      {d.error && (
        <p className="text-muted-foreground mt-1 text-xs">
          <span className="font-mono">{d.error.code}</span>
          {d.hint ? ` — ${d.hint}` : ''}
        </p>
      )}
    </div>
  );
}

export default function PushNotificationsPage() {
  const {
    data: usersResponse,
    isLoading: isLoadingUsers,
    isError: isUsersError,
  } = useGetUsersWithTokensQuery();
  const [sendPush, { isLoading: isSending }] = useSendPushToUserMutation();

  const [userId, setUserId] = useState('');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [result, setResult] = useState<SendPushResponse | null>(null);
  const [transportError, setTransportError] = useState<string | null>(null);

  const users = useMemo(() => usersResponse?.data.users ?? [], [usersResponse]);

  const canSend =
    userId !== '' && title.trim() !== '' && body.trim() !== '' && !isSending;

  const handleSend = async () => {
    setResult(null);
    setTransportError(null);
    try {
      const res = await sendPush({
        userId,
        title: title.trim(),
        body: body.trim(),
      }).unwrap();
      setResult(res);
    } catch {
      setTransportError(
        'Could not reach the server. Check your connection and try again.'
      );
    }
  };

  const classified = result ? classifyResult(result) : null;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Send Push Notification
        </h1>
        <p className="text-muted-foreground">
          Send a test or manual push to a single user&apos;s device to verify
          delivery to their notification center.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Compose</CardTitle>
          <CardDescription>
            Pick a recipient, then enter a subject and message.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5">
          {/* Recipient */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5">
              <Label htmlFor="recipient">Recipient</Label>
              <span
                className="text-muted-foreground inline-flex cursor-help"
                title={TOKEN_NOTE}
                aria-label={TOKEN_NOTE}
              >
                <Info className="h-4 w-4" />
              </span>
            </div>

            <Select value={userId} onValueChange={setUserId}>
              <SelectTrigger id="recipient" className="w-full">
                <SelectValue
                  placeholder={
                    isLoadingUsers ? 'Loading users…' : 'Select a user'
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {users.map((u) => (
                  <SelectItem key={u.userId} value={u.userId}>
                    {(u.name ? `${u.name} — ${u.email}` : u.email) +
                      ` · ${u.platform.toUpperCase()}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <p className="text-muted-foreground text-xs">{TOKEN_NOTE}</p>

            {isUsersError && (
              <p className="text-xs text-red-600">
                Failed to load users. Please refresh and try again.
              </p>
            )}
            {!isLoadingUsers && !isUsersError && users.length === 0 && (
              <p className="text-xs text-amber-600">
                No users have an active device token yet.
              </p>
            )}
          </div>

          {/* Subject */}
          <div className="space-y-2">
            <Label htmlFor="title">Subject</Label>
            <Input
              id="title"
              value={title}
              maxLength={TITLE_MAX}
              placeholder="e.g. Your closet is ready"
              onChange={(e) => setTitle(e.target.value)}
            />
            <p className="text-muted-foreground text-right text-xs">
              {title.length}/{TITLE_MAX}
            </p>
          </div>

          {/* Body */}
          <div className="space-y-2">
            <Label htmlFor="body">Message</Label>
            <Textarea
              id="body"
              value={body}
              maxLength={BODY_MAX}
              placeholder="Write the notification message shown on the device…"
              className="min-h-[120px]"
              onChange={(e) => setBody(e.target.value)}
            />
            <p className="text-muted-foreground text-right text-xs">
              {body.length}/{BODY_MAX}
            </p>
          </div>

          {/* Result */}
          {transportError && (
            <div className={cn('rounded-lg border p-4', RESULT_STYLES.error)}>
              <div className="flex items-center gap-2 font-medium">
                <XCircle className="h-5 w-5 shrink-0" />
                {transportError}
              </div>
            </div>
          )}

          {classified && result && (
            <div
              className={cn('rounded-lg border p-4', RESULT_STYLES[classified.kind])}
            >
              <div className="flex items-center gap-2 font-medium">
                <ResultIcon kind={classified.kind} />
                {classified.heading}
              </div>

              {(result.data.successCount !== undefined ||
                result.data.tokenCount !== undefined) && (
                <p className="mt-1 text-sm opacity-90">
                  {result.data.tokenCount ?? 0} device(s) targeted ·{' '}
                  {result.data.successCount ?? 0} delivered ·{' '}
                  {result.data.failureCount ?? 0} failed
                </p>
              )}

              {result.data.diagnostics && result.data.diagnostics.length > 0 && (
                <div className="mt-3 space-y-2">
                  {result.data.diagnostics.map((d, i) => (
                    <DiagnosticRow key={`${d.token}-${i}`} d={d} />
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>

        <CardFooter className="justify-end">
          <Button onClick={handleSend} disabled={!canSend}>
            {isSending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Sending…
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Send Notification
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
