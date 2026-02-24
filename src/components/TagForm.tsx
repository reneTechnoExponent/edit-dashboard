"use client";

import { useState, useEffect, useImperativeHandle, forwardRef } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface TagFormProps {
  initialData?: {
    _id?: string;
    title: string;
  };
  onValidationChange?: (isValid: boolean) => void;
}

export interface TagFormData {
  title: string;
}

export interface TagFormRef {
  getData: () => TagFormData;
  validate: () => boolean;
}

interface FormErrors {
  title?: string;
}

export const TagForm = forwardRef<TagFormRef, TagFormProps>(
  ({ initialData, onValidationChange }, ref) => {
    const [formData, setFormData] = useState<TagFormData>({
      title: initialData?.title || "",
    });

    const [errors, setErrors] = useState<FormErrors>({});

    // Validate form
    const validate = (): boolean => {
      const newErrors: FormErrors = {};

      // Title is required and must not be empty
      if (!formData.title || formData.title.trim().length === 0) {
        newErrors.title = "Title is required";
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

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({ ...prev, title: e.target.value }));
    };

    return (
      <div className="space-y-4">
        {/* Title Field */}
        <div className="space-y-2">
          <Label htmlFor="title">
            Title <span className="text-red-500">*</span>
          </Label>
          <Input
            id="title"
            type="text"
            value={formData.title}
            onChange={handleTitleChange}
            placeholder="Enter tag title"
            className={errors.title ? "border-red-500" : ""}
          />
          {errors.title && (
            <p className="text-sm text-red-500">{errors.title}</p>
          )}
        </div>
      </div>
    );
  }
);

TagForm.displayName = "TagForm";
