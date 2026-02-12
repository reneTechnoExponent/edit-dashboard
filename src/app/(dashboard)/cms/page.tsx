"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Save, Loader2 } from "lucide-react";
import {
  useGetTermsAndConditionsQuery,
  useGetPrivacyPolicyQuery,
  useUpdateCMSContentMutation,
} from "@/features/cms/cmsApi";

export default function CMSPage() {
  const [termsContent, setTermsContent] = useState("");
  const [privacyContent, setPrivacyContent] = useState("");

  const { data: termsData, isLoading: isLoadingTerms } = useGetTermsAndConditionsQuery();
  const { data: privacyData, isLoading: isLoadingPrivacy } = useGetPrivacyPolicyQuery();
  const [updateCMSContent, { isLoading: isUpdating }] = useUpdateCMSContentMutation();

  // Initialize content when data is loaded
  useEffect(() => {
    if (termsData?.data?.content) {
      setTermsContent(termsData.data.content);
    }
  }, [termsData]);

  useEffect(() => {
    if (privacyData?.data?.content) {
      setPrivacyContent(privacyData.data.content);
    }
  }, [privacyData]);

  const handleSaveTerms = async () => {
    try {
      await updateCMSContent({ type: 'terms', content: termsContent }).unwrap();
      toast.success("Terms & Conditions updated successfully");
    } catch (error: any) {
      const errorMessage =
        error?.data?.message || error?.message || "Failed to update Terms & Conditions";
      toast.error(errorMessage);
    }
  };

  const handleSavePrivacy = async () => {
    try {
      await updateCMSContent({ type: 'privacy', content: privacyContent }).unwrap();
      toast.success("Privacy Policy updated successfully");
    } catch (error: any) {
      const errorMessage =
        error?.data?.message || error?.message || "Failed to update Privacy Policy";
      toast.error(errorMessage);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Content Management</h1>
        <p className="text-muted-foreground">
          Manage Terms & Conditions and Privacy Policy content
        </p>
      </div>

      {/* Terms & Conditions */}
      <Card>
        <CardHeader>
          <CardTitle>Terms & Conditions</CardTitle>
          <CardDescription>
            Edit the Terms & Conditions content displayed to users
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoadingTerms ? (
            <div className="space-y-2">
              <div className="h-4 bg-muted animate-pulse rounded" />
              <div className="h-4 bg-muted animate-pulse rounded" />
              <div className="h-4 bg-muted animate-pulse rounded" />
            </div>
          ) : (
            <>
              <textarea
                className="w-full min-h-[300px] p-4 border rounded-lg font-mono text-sm resize-y focus:outline-none focus:ring-2 focus:ring-ring"
                value={termsContent}
                onChange={(e) => setTermsContent(e.target.value)}
                placeholder="Enter Terms & Conditions content..."
              />
              <div className="flex justify-end">
                <Button onClick={handleSaveTerms} disabled={isUpdating}>
                  {isUpdating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Terms & Conditions
                    </>
                  )}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Separator />

      {/* Privacy Policy */}
      <Card>
        <CardHeader>
          <CardTitle>Privacy Policy</CardTitle>
          <CardDescription>
            Edit the Privacy Policy content displayed to users
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoadingPrivacy ? (
            <div className="space-y-2">
              <div className="h-4 bg-muted animate-pulse rounded" />
              <div className="h-4 bg-muted animate-pulse rounded" />
              <div className="h-4 bg-muted animate-pulse rounded" />
            </div>
          ) : (
            <>
              <textarea
                className="w-full min-h-[300px] p-4 border rounded-lg font-mono text-sm resize-y focus:outline-none focus:ring-2 focus:ring-ring"
                value={privacyContent}
                onChange={(e) => setPrivacyContent(e.target.value)}
                placeholder="Enter Privacy Policy content..."
              />
              <div className="flex justify-end">
                <Button onClick={handleSavePrivacy} disabled={isUpdating}>
                  {isUpdating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Privacy Policy
                    </>
                  )}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
