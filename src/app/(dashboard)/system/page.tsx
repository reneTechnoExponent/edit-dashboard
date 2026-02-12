"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Play, Loader2, CheckCircle2, XCircle, Clock, Activity, Mail, Brain } from "lucide-react";
import {
  useGetCronJobStatusQuery,
  useTriggerCronJobMutation,
  useGetEmailQueueStatusQuery,
  useGetAIServiceHealthQuery,
} from "@/features/system/systemApi";

export default function SystemPage() {
  const { data: cronJobsData, isLoading: isLoadingCronJobs, refetch: refetchCronJobs } = useGetCronJobStatusQuery();
  const { data: emailQueueData, isLoading: isLoadingEmailQueue, refetch: refetchEmailQueue } = useGetEmailQueueStatusQuery();
  const { data: aiServiceData, isLoading: isLoadingAIService, refetch: refetchAIService } = useGetAIServiceHealthQuery();
  
  const [triggerCronJob, { isLoading: isTriggering }] = useTriggerCronJobMutation();

  const handleTriggerCronJob = async (jobName: string) => {
    try {
      await triggerCronJob({ jobName }).unwrap();
      toast.success(`Cron job "${jobName}" triggered successfully`);
      refetchCronJobs();
    } catch (error: any) {
      const errorMessage =
        error?.data?.message || error?.message || "Failed to trigger cron job";
      toast.error(errorMessage);
    }
  };

  const handleRefresh = () => {
    refetchCronJobs();
    refetchEmailQueue();
    refetchAIService();
    toast.success("System status refreshed");
  };

  const cronJobs = cronJobsData?.data?.cronJobs || [];
  const emailQueue = emailQueueData?.data;
  const aiService = aiServiceData?.data;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">System Monitor</h1>
          <p className="text-muted-foreground">
            Monitor cron jobs, email queue, and AI service health
          </p>
        </div>
        <Button onClick={handleRefresh}>
          <Activity className="mr-2 h-4 w-4" />
          Refresh Status
        </Button>
      </div>

      {/* Cron Jobs Status */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Cron Jobs</h2>
        {isLoadingCronJobs ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <div className="h-5 bg-muted animate-pulse rounded" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-4 bg-muted animate-pulse rounded" />
                    <div className="h-4 bg-muted animate-pulse rounded" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : cronJobs.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">No cron jobs configured</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {cronJobs.map((job) => (
              <Card key={job.jobName}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="text-lg">{job.jobName}</span>
                    {job.lastStatus === 'success' ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    ) : job.lastStatus === 'failure' ? (
                      <XCircle className="h-5 w-5 text-red-500" />
                    ) : (
                      <Clock className="h-5 w-5 text-gray-400" />
                    )}
                  </CardTitle>
                  <CardDescription>
                    {job.lastStatus ? (
                      <Badge variant={job.lastStatus === 'success' ? 'default' : 'destructive'}>
                        {job.lastStatus}
                      </Badge>
                    ) : (
                      <Badge variant="outline">Never Run</Badge>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Last Execution</p>
                    <p className="font-medium">
                      {job.lastExecution
                        ? new Date(job.lastExecution).toLocaleString()
                        : "Never"}
                    </p>
                  </div>

                  <Separator />

                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Last 24 Hours</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        <span className="text-sm font-medium">
                          {job.last24Hours.successCount}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <XCircle className="h-4 w-4 text-red-500" />
                        <span className="text-sm font-medium">
                          {job.last24Hours.failureCount}
                        </span>
                      </div>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => handleTriggerCronJob(job.jobName)}
                    disabled={isTriggering}
                  >
                    {isTriggering ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Triggering...
                      </>
                    ) : (
                      <>
                        <Play className="mr-2 h-4 w-4" />
                        Trigger Manually
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Email Queue Status */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Email Queue</h2>
        {isLoadingEmailQueue ? (
          <Card>
            <CardHeader>
              <div className="h-5 bg-muted animate-pulse rounded" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-4 bg-muted animate-pulse rounded" />
                <div className="h-4 bg-muted animate-pulse rounded" />
              </div>
            </CardContent>
          </Card>
        ) : emailQueue ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Email Processing Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <p className="text-sm text-muted-foreground">Queue Size</p>
                  <p className="text-2xl font-bold">{emailQueue.queueSize}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Processing</p>
                  <p className="text-2xl font-bold">{emailQueue.processing}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Failed</p>
                  <p className="text-2xl font-bold text-red-500">{emailQueue.failed}</p>
                </div>
              </div>

              {emailQueue.recentProcessed && emailQueue.recentProcessed.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm font-medium mb-3">Recent Processing</p>
                    <div className="space-y-2">
                      {emailQueue.recentProcessed.slice(0, 5).map((item, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 rounded-lg border"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{item.email}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(item.timestamp).toLocaleString()}
                            </p>
                            {item.error && (
                              <p className="text-xs text-red-500 mt-1">{item.error}</p>
                            )}
                          </div>
                          <Badge
                            variant={item.status === 'success' ? 'default' : 'destructive'}
                          >
                            {item.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">Email queue data unavailable</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* AI Service Health */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">AI Service</h2>
        {isLoadingAIService ? (
          <Card>
            <CardHeader>
              <div className="h-5 bg-muted animate-pulse rounded" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-4 bg-muted animate-pulse rounded" />
                <div className="h-4 bg-muted animate-pulse rounded" />
              </div>
            </CardContent>
          </Card>
        ) : aiService ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                AI Categorization Service
              </CardTitle>
              <CardDescription>
                <Badge
                  variant={
                    aiService.status === 'healthy'
                      ? 'default'
                      : aiService.status === 'degraded'
                      ? 'secondary'
                      : 'destructive'
                  }
                >
                  {aiService.status}
                </Badge>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">Last Sync</p>
                  <p className="font-medium">
                    {aiService.lastSync
                      ? new Date(aiService.lastSync).toLocaleString()
                      : "Never"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Avg Response Time</p>
                  <p className="font-medium">{aiService.averageResponseTime}ms</p>
                </div>
              </div>

              <Separator />

              <div>
                <p className="text-sm font-medium mb-2">Last 24 Hours</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span className="text-sm">
                      Success: <span className="font-medium">{aiService.last24Hours.successCount}</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-red-500" />
                    <span className="text-sm">
                      Failure: <span className="font-medium">{aiService.last24Hours.failureCount}</span>
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">AI service data unavailable</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
