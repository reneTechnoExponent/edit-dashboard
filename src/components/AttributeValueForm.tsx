"use client";

import { useState, useEffect, useImperativeHandle, forwardRef } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getAttributes, Attribute } from "@/lib/api/taxonomy";

interface AttributeValueFormProps {
  initialData?: {
    _id?: string;
    attribute: string;
    value: string;
    isPhase2: boolean;
  };
  onValidationChange?: (isValid: boolean) => void;
}

export interface AttributeValueFormData {
  attribute: string;
  value: string;
  isPhase2: boolean;
}

export interface AttributeValueFormRef {
  getData: () => AttributeValueFormData;
  validate: () => boolean;
}

interface FormErrors {
  attribute?: string;
  value?: string;
}

export const AttributeValueForm = forwardRef<
  AttributeValueFormRef,
  AttributeValueFormProps
>(({ initialData, onValidationChange }, ref) => {
  const [formData, setFormData] = useState<AttributeValueFormData>({
    attribute: initialData?.attribute || "",
    value: initialData?.value || "",
    isPhase2: initialData?.isPhase2 || false,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [loadingAttributes, setLoadingAttributes] = useState(false);

  // Fetch attributes for dropdown
  useEffect(() => {
    const fetchAttributes = async () => {
      setLoadingAttributes(true);
      try {
        const response = await getAttributes({ limit: 1000 });
        setAttributes(response.data.items);
      } catch (error) {
        console.error("Failed to fetch attributes:", error);
      } finally {
        setLoadingAttributes(false);
      }
    };

    fetchAttributes();
  }, []);

  // Validate form
  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    // Attribute is required
    if (!formData.attribute || formData.attribute.trim().length === 0) {
      newErrors.attribute = "Attribute is required";
    }

    // Value is required and must not be empty
    if (!formData.value || formData.value.trim().length === 0) {
      newErrors.value = "Value is required";
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

  const handleAttributeChange = (value: string) => {
    setFormData((prev) => ({ ...prev, attribute: value }));
  };

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, value: e.target.value }));
  };

  const handleIsPhase2Change = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, isPhase2: checked }));
  };

  return (
    <div className="space-y-4">
      {/* Attribute Dropdown */}
      <div className="space-y-2">
        <Label htmlFor="attribute">
          Attribute <span className="text-red-500">*</span>
        </Label>
        <Select
          value={formData.attribute}
          onValueChange={handleAttributeChange}
          disabled={loadingAttributes}
        >
          <SelectTrigger
            id="attribute"
            className={errors.attribute ? "border-red-500" : ""}
          >
            <SelectValue placeholder="Select an attribute" />
          </SelectTrigger>
          <SelectContent>
            {attributes.map((attr) => (
              <SelectItem key={attr._id} value={attr._id}>
                {attr.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.attribute && (
          <p className="text-sm text-red-500">{errors.attribute}</p>
        )}
        {loadingAttributes && (
          <p className="text-sm text-muted-foreground">Loading attributes...</p>
        )}
      </div>

      {/* Value Field */}
      <div className="space-y-2">
        <Label htmlFor="value">
          Value <span className="text-red-500">*</span>
        </Label>
        <Input
          id="value"
          type="text"
          value={formData.value}
          onChange={handleValueChange}
          placeholder="Enter attribute value (e.g., Small, Red, Cotton)"
          className={errors.value ? "border-red-500" : ""}
        />
        {errors.value && (
          <p className="text-sm text-red-500">{errors.value}</p>
        )}
      </div>

      {/* Is Phase 2 Checkbox */}
      <div className="flex items-center space-x-2">
        <Checkbox
          id="isPhase2"
          checked={formData.isPhase2}
          onCheckedChange={handleIsPhase2Change}
        />
        <Label
          htmlFor="isPhase2"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Phase 2
        </Label>
      </div>
    </div>
  );
});

AttributeValueForm.displayName = "AttributeValueForm";
