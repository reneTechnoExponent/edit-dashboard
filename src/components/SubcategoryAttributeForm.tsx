"use client";

import { useState, useEffect, useImperativeHandle, forwardRef } from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  getSubcategories,
  getAttributes,
  getAttributeValues,
  Subcategory,
  Attribute,
  AttributeValue,
} from "@/lib/api/taxonomy";

interface SubcategoryAttributeFormProps {
  initialData?: {
    _id?: string;
    subcategory: string;
    attribute: string;
    allowedValues: string[];
  };
  onValidationChange?: (isValid: boolean) => void;
}

export interface SubcategoryAttributeFormData {
  subcategory: string;
  attribute: string;
  allowedValues: string[];
}

export interface SubcategoryAttributeFormRef {
  getData: () => SubcategoryAttributeFormData;
  validate: () => boolean;
}

interface FormErrors {
  subcategory?: string;
  attribute?: string;
  allowedValues?: string;
}

export const SubcategoryAttributeForm = forwardRef<
  SubcategoryAttributeFormRef,
  SubcategoryAttributeFormProps
>(({ initialData, onValidationChange }, ref) => {
  const [formData, setFormData] = useState<SubcategoryAttributeFormData>({
    subcategory: initialData?.subcategory || "",
    attribute: initialData?.attribute || "",
    allowedValues: initialData?.allowedValues || [],
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [attributeValues, setAttributeValues] = useState<AttributeValue[]>([]);
  const [loadingSubcategories, setLoadingSubcategories] = useState(false);
  const [loadingAttributes, setLoadingAttributes] = useState(false);
  const [loadingAttributeValues, setLoadingAttributeValues] = useState(false);

  // Fetch subcategories for dropdown
  useEffect(() => {
    const fetchSubcategories = async () => {
      setLoadingSubcategories(true);
      try {
        const response = await getSubcategories({ limit: 1000 });
        setSubcategories(response.data.items);
      } catch (error) {
        console.error("Failed to fetch subcategories:", error);
      } finally {
        setLoadingSubcategories(false);
      }
    };

    fetchSubcategories();
  }, []);

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

  // Fetch attribute values when attribute changes (dependent dropdown)
  useEffect(() => {
    const fetchAttributeValues = async () => {
      if (!formData.attribute) {
        setAttributeValues([]);
        return;
      }

      setLoadingAttributeValues(true);
      try {
        const response = await getAttributeValues({
          attribute: formData.attribute,
          limit: 1000,
        });
        setAttributeValues(response.data.items);
        
        // Clear selected values if they don't belong to the new attribute
        const validValueIds = response.data.items.map((val) => val._id);
        const filteredAllowedValues = formData.allowedValues.filter((valId) =>
          validValueIds.includes(valId)
        );
        
        // Only update if values were filtered out
        if (filteredAllowedValues.length !== formData.allowedValues.length) {
          setFormData((prev) => ({
            ...prev,
            allowedValues: filteredAllowedValues,
          }));
        }
      } catch (error) {
        console.error("Failed to fetch attribute values:", error);
      } finally {
        setLoadingAttributeValues(false);
      }
    };

    fetchAttributeValues();
  }, [formData.attribute]);

  // Validate form
  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    // Subcategory is required
    if (!formData.subcategory || formData.subcategory.trim().length === 0) {
      newErrors.subcategory = "Subcategory is required";
    }

    // Attribute is required
    if (!formData.attribute || formData.attribute.trim().length === 0) {
      newErrors.attribute = "Attribute is required";
    }

    // Allowed values are optional but should be an array
    if (!Array.isArray(formData.allowedValues)) {
      newErrors.allowedValues = "Allowed values must be an array";
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

  const handleSubcategoryChange = (value: string) => {
    setFormData((prev) => ({ ...prev, subcategory: value }));
  };

  const handleAttributeChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      attribute: value,
      // Clear allowed values when attribute changes
      allowedValues: [],
    }));
  };

  const handleAllowedValueToggle = (valueId: string, checked: boolean) => {
    setFormData((prev) => {
      const newAllowedValues = checked
        ? [...prev.allowedValues, valueId]
        : prev.allowedValues.filter((id) => id !== valueId);
      return { ...prev, allowedValues: newAllowedValues };
    });
  };

  return (
    <div className="space-y-4">
      {/* Subcategory Dropdown */}
      <div className="space-y-2">
        <Label htmlFor="subcategory">
          Subcategory <span className="text-red-500">*</span>
        </Label>
        <Select
          value={formData.subcategory}
          onValueChange={handleSubcategoryChange}
          disabled={loadingSubcategories}
        >
          <SelectTrigger
            id="subcategory"
            className={errors.subcategory ? "border-red-500" : ""}
          >
            <SelectValue placeholder="Select a subcategory" />
          </SelectTrigger>
          <SelectContent>
            {subcategories.map((sub) => (
              <SelectItem key={sub._id} value={sub._id}>
                {sub.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.subcategory && (
          <p className="text-sm text-red-500">{errors.subcategory}</p>
        )}
        {loadingSubcategories && (
          <p className="text-sm text-muted-foreground">Loading subcategories...</p>
        )}
      </div>

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

      {/* Allowed Values Multi-Select (Dependent on Attribute) */}
      <div className="space-y-2">
        <Label>Allowed Values</Label>
        {!formData.attribute ? (
          <p className="text-sm text-muted-foreground">
            Select an attribute first to choose allowed values
          </p>
        ) : loadingAttributeValues ? (
          <p className="text-sm text-muted-foreground">Loading values...</p>
        ) : attributeValues.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No values available for this attribute
          </p>
        ) : (
          <div className="space-y-2 max-h-[200px] overflow-y-auto border rounded-md p-3">
            {attributeValues.map((value) => (
              <div key={value._id} className="flex items-center space-x-2">
                <Checkbox
                  id={`value-${value._id}`}
                  checked={formData.allowedValues.includes(value._id)}
                  onCheckedChange={(checked) =>
                    handleAllowedValueToggle(value._id, checked as boolean)
                  }
                />
                <Label
                  htmlFor={`value-${value._id}`}
                  className="text-sm font-normal cursor-pointer"
                >
                  {value.value}
                </Label>
              </div>
            ))}
          </div>
        )}
        {errors.allowedValues && (
          <p className="text-sm text-red-500">{errors.allowedValues}</p>
        )}
        {formData.allowedValues.length > 0 && (
          <p className="text-sm text-muted-foreground">
            {formData.allowedValues.length} value(s) selected
          </p>
        )}
      </div>
    </div>
  );
});

SubcategoryAttributeForm.displayName = "SubcategoryAttributeForm";
