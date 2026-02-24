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
import { getClothingMenus, ClothingMenu } from "@/lib/api/taxonomy";

interface SubcategoryFormProps {
  initialData?: {
    _id?: string;
    title: string;
    category: string;
    isPhase2: boolean;
  };
  onValidationChange?: (isValid: boolean) => void;
}

export interface SubcategoryFormData {
  title: string;
  category: string;
  isPhase2: boolean;
}

export interface SubcategoryFormRef {
  getData: () => SubcategoryFormData;
  validate: () => boolean;
}

interface FormErrors {
  title?: string;
  category?: string;
}

export const SubcategoryForm = forwardRef<
  SubcategoryFormRef,
  SubcategoryFormProps
>(({ initialData, onValidationChange }, ref) => {
  const [formData, setFormData] = useState<SubcategoryFormData>({
    title: initialData?.title || "",
    category: initialData?.category || "",
    isPhase2: initialData?.isPhase2 || false,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [clothingMenus, setClothingMenus] = useState<ClothingMenu[]>([]);
  const [loadingMenus, setLoadingMenus] = useState(false);

  // Fetch clothing menus for dropdown
  useEffect(() => {
    const fetchClothingMenus = async () => {
      setLoadingMenus(true);
      try {
        const response = await getClothingMenus({ limit: 1000 });
        setClothingMenus(response.data.items);
      } catch (error) {
        console.error("Failed to fetch clothing menus:", error);
      } finally {
        setLoadingMenus(false);
      }
    };

    fetchClothingMenus();
  }, []);

  // Validate form
  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    // Title is required and must not be empty
    if (!formData.title || formData.title.trim().length === 0) {
      newErrors.title = "Title is required";
    }

    // Category is required
    if (!formData.category || formData.category.trim().length === 0) {
      newErrors.category = "Parent menu is required";
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

  const handleCategoryChange = (value: string) => {
    setFormData((prev) => ({ ...prev, category: value }));
  };

  const handleIsPhase2Change = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, isPhase2: checked }));
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
          placeholder="Enter subcategory title"
          className={errors.title ? "border-red-500" : ""}
        />
        {errors.title && (
          <p className="text-sm text-red-500">{errors.title}</p>
        )}
      </div>

      {/* Category Dropdown */}
      <div className="space-y-2">
        <Label htmlFor="category">
          Parent Menu <span className="text-red-500">*</span>
        </Label>
        <Select
          value={formData.category}
          onValueChange={handleCategoryChange}
          disabled={loadingMenus}
        >
          <SelectTrigger
            id="category"
            className={errors.category ? "border-red-500" : ""}
          >
            <SelectValue placeholder="Select a parent menu" />
          </SelectTrigger>
          <SelectContent>
            {clothingMenus.map((menu) => (
              <SelectItem key={menu._id} value={menu._id}>
                {menu.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.category && (
          <p className="text-sm text-red-500">{errors.category}</p>
        )}
        {loadingMenus && (
          <p className="text-sm text-muted-foreground">Loading menus...</p>
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

SubcategoryForm.displayName = "SubcategoryForm";
