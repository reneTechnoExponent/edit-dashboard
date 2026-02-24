"use client";

import { useState, useEffect, useImperativeHandle, forwardRef } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface BrandFormProps {
  initialData?: {
    _id?: string;
    brandName: string;
  };
  onValidationChange?: (isValid: boolean) => void;
}

export interface BrandFormData {
  brandName: string;
}

export interface BrandFormRef {
  getData: () => BrandFormData;
  validate: () => boolean;
}

interface FormErrors {
  brandName?: string;
}

export const BrandForm = forwardRef<BrandFormRef, BrandFormProps>(
  ({ initialData, onValidationChange }, ref) => {
    const [formData, setFormData] = useState<BrandFormData>({
      brandName: initialData?.brandName || "",
    });

    const [errors, setErrors] = useState<FormErrors>({});

    // Validate form
    const validate = (): boolean => {
      const newErrors: FormErrors = {};

      // Brand name is required and must not be empty
      if (!formData.brandName || formData.brandName.trim().length === 0) {
        newErrors.brandName = "Brand name is required";
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

    const handleBrandNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({ ...prev, brandName: e.target.value }));
    };

    return (
      <div className="space-y-4">
        {/* Brand Name Field */}
        <div className="space-y-2">
          <Label htmlFor="brandName">
            Brand Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="brandName"
            type="text"
            value={formData.brandName}
            onChange={handleBrandNameChange}
            placeholder="Enter brand name"
            className={errors.brandName ? "border-red-500" : ""}
          />
          {errors.brandName && (
            <p className="text-sm text-red-500">{errors.brandName}</p>
          )}
        </div>
      </div>
    );
  }
);

BrandForm.displayName = "BrandForm";
