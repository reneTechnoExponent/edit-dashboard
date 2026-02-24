"use client";

import { useState, useEffect, useImperativeHandle, forwardRef } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface AttributeFormProps {
  initialData?: {
    _id?: string;
    name: string;
    slug: string;
  };
  onValidationChange?: (isValid: boolean) => void;
}

export interface AttributeFormData {
  name: string;
  slug: string;
}

export interface AttributeFormRef {
  getData: () => AttributeFormData;
  validate: () => boolean;
}

interface FormErrors {
  name?: string;
  slug?: string;
}

export const AttributeForm = forwardRef<
  AttributeFormRef,
  AttributeFormProps
>(({ initialData, onValidationChange }, ref) => {
  const [formData, setFormData] = useState<AttributeFormData>({
    name: initialData?.name || "",
    slug: initialData?.slug || "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

  // Helper function to generate slug from name
  const generateSlug = (name: string): string => {
    return name
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-") // Replace spaces with hyphens
      .replace(/[^a-z0-9-]/g, "") // Remove non-alphanumeric characters except hyphens
      .replace(/-+/g, "-") // Replace multiple hyphens with single hyphen
      .replace(/^-|-$/g, ""); // Remove leading/trailing hyphens
  };

  // Validate form
  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    // Name is required and must not be empty
    if (!formData.name || formData.name.trim().length === 0) {
      newErrors.name = "Name is required";
    }

    // Slug is required and must not be empty
    if (!formData.slug || formData.slug.trim().length === 0) {
      newErrors.slug = "Slug is required";
    } else if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      newErrors.slug = "Slug must contain only lowercase letters, numbers, and hyphens";
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

  // Auto-generate slug from name when name changes (only if slug hasn't been manually edited)
  useEffect(() => {
    if (!slugManuallyEdited && formData.name) {
      const generatedSlug = generateSlug(formData.name);
      setFormData((prev) => ({ ...prev, slug: generatedSlug }));
    }
  }, [formData.name, slugManuallyEdited]);

  // When editing an existing attribute, mark slug as manually edited
  useEffect(() => {
    if (initialData?.slug) {
      setSlugManuallyEdited(true);
    }
  }, [initialData?.slug]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, name: e.target.value }));
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSlugManuallyEdited(true);
    setFormData((prev) => ({ ...prev, slug: e.target.value }));
  };

  return (
    <div className="space-y-4">
      {/* Name Field */}
      <div className="space-y-2">
        <Label htmlFor="name">
          Name <span className="text-red-500">*</span>
        </Label>
        <Input
          id="name"
          type="text"
          value={formData.name}
          onChange={handleNameChange}
          placeholder="Enter attribute name (e.g., Size, Color)"
          className={errors.name ? "border-red-500" : ""}
        />
        {errors.name && (
          <p className="text-sm text-red-500">{errors.name}</p>
        )}
      </div>

      {/* Slug Field */}
      <div className="space-y-2">
        <Label htmlFor="slug">
          Slug <span className="text-red-500">*</span>
        </Label>
        <Input
          id="slug"
          type="text"
          value={formData.slug}
          onChange={handleSlugChange}
          placeholder="Auto-generated from name"
          className={errors.slug ? "border-red-500" : ""}
        />
        {errors.slug && (
          <p className="text-sm text-red-500">{errors.slug}</p>
        )}
        <p className="text-xs text-muted-foreground">
          Auto-generated from name. You can edit it manually if needed.
        </p>
      </div>
    </div>
  );
});

AttributeForm.displayName = "AttributeForm";
