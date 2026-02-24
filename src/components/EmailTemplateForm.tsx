"use client";

import { useState, useEffect, useImperativeHandle, forwardRef } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface EmailTemplateFormProps {
  initialData?: {
    _id?: string;
    purpose: string;
    subject: string;
    content: string;
  };
  onValidationChange?: (isValid: boolean) => void;
}

export interface EmailTemplateFormData {
  purpose: string;
  subject: string;
  content: string;
}

export interface EmailTemplateFormRef {
  getData: () => EmailTemplateFormData;
  validate: () => boolean;
}

interface FormErrors {
  purpose?: string;
  subject?: string;
  content?: string;
}

// Template variables for different purposes
const TEMPLATE_VARIABLES: Record<string, string[]> = {
  welcome: ["{{userName}}", "{{email}}", "{{loginUrl}}"],
  "reset-password": ["{{userName}}", "{{resetLink}}", "{{expiryTime}}"],
  verification: ["{{userName}}", "{{verificationLink}}", "{{code}}"],
  notification: ["{{userName}}", "{{message}}", "{{actionUrl}}"],
};

export const EmailTemplateForm = forwardRef<EmailTemplateFormRef, EmailTemplateFormProps>(
  ({ initialData, onValidationChange }, ref) => {
    const [formData, setFormData] = useState<EmailTemplateFormData>({
      purpose: initialData?.purpose || "",
      subject: initialData?.subject || "",
      content: initialData?.content || "",
    });

    const [errors, setErrors] = useState<FormErrors>({});

    // Validate form
    const validate = (): boolean => {
      const newErrors: FormErrors = {};

      // Purpose is required
      if (!formData.purpose || formData.purpose.trim().length === 0) {
        newErrors.purpose = "Purpose is required";
      }

      // Subject is required
      if (!formData.subject || formData.subject.trim().length === 0) {
        newErrors.subject = "Subject is required";
      }

      // Content is required
      if (!formData.content || formData.content.trim().length === 0) {
        newErrors.content = "Content is required";
      }

      setErrors(newErrors);
      const isValid = Object.keys(newErrors).length === 0;

      // Notify parent of validation state
      if (onValidationChange) {
        onValidationChange(isValid);
      }

      return isValid;
    };

    // Expose methods to parent via ref
    useImperativeHandle(ref, () => ({
      getData: () => formData,
      validate,
    }));

    // Validate on form data change
    useEffect(() => {
      validate();
    }, [formData]);

    const handlePurposeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({ ...prev, purpose: e.target.value }));
    };

    const handleSubjectChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({ ...prev, subject: e.target.value }));
    };

    const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setFormData((prev) => ({ ...prev, content: e.target.value }));
    };

    // Get available variables for current purpose
    const availableVariables = TEMPLATE_VARIABLES[formData.purpose] || [];

    return (
      <div className="space-y-4">
        {/* Purpose Field */}
        <div className="space-y-2">
          <Label htmlFor="purpose">
            Purpose <span className="text-red-500">*</span>
          </Label>
          <Input
            id="purpose"
            type="text"
            value={formData.purpose}
            onChange={handlePurposeChange}
            placeholder="e.g., welcome, reset-password, verification"
            className={errors.purpose ? "border-red-500" : ""}
          />
          {errors.purpose && (
            <p className="text-sm text-red-500">{errors.purpose}</p>
          )}
        </div>

        {/* Subject Field */}
        <div className="space-y-2">
          <Label htmlFor="subject">
            Subject <span className="text-red-500">*</span>
          </Label>
          <Input
            id="subject"
            type="text"
            value={formData.subject}
            onChange={handleSubjectChange}
            placeholder="Enter email subject"
            className={errors.subject ? "border-red-500" : ""}
          />
          {errors.subject && (
            <p className="text-sm text-red-500">{errors.subject}</p>
          )}
        </div>

        {/* Content Field */}
        <div className="space-y-2">
          <Label htmlFor="content">
            HTML Content <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="content"
            value={formData.content}
            onChange={handleContentChange}
            placeholder="Enter HTML email content"
            className={errors.content ? "border-red-500" : ""}
            rows={10}
          />
          {errors.content && (
            <p className="text-sm text-red-500">{errors.content}</p>
          )}
        </div>

        {/* Available Variables */}
        {availableVariables.length > 0 && (
          <div className="rounded-md bg-muted p-3">
            <p className="text-sm font-medium mb-2">Available Variables:</p>
            <div className="flex flex-wrap gap-2">
              {availableVariables.map((variable) => (
                <code
                  key={variable}
                  className="text-xs bg-background px-2 py-1 rounded"
                >
                  {variable}
                </code>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }
);

EmailTemplateForm.displayName = "EmailTemplateForm";
