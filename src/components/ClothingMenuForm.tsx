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
import axios from "axios";
import type { User } from "@/types";

interface ClothingMenuFormProps {
  initialData?: {
    _id?: string;
    title: string;
    isUserCreated: boolean;
    user: string | null;
  };
  onValidationChange?: (isValid: boolean) => void;
}

export interface ClothingMenuFormData {
  title: string;
  isUserCreated: boolean;
  user: string | null;
}

export interface ClothingMenuFormRef {
  getData: () => ClothingMenuFormData;
  validate: () => boolean;
}

interface FormErrors {
  title?: string;
  user?: string;
}

export const ClothingMenuForm = forwardRef<
  ClothingMenuFormRef,
  ClothingMenuFormProps
>(({ initialData, onValidationChange }, ref) => {
  const [formData, setFormData] = useState<ClothingMenuFormData>({
    title: initialData?.title || "",
    isUserCreated: initialData?.isUserCreated || false,
    user: initialData?.user || null,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Fetch users for dropdown
  useEffect(() => {
    const fetchUsers = async () => {
      setLoadingUsers(true);
      try {
        const token = localStorage.getItem("adminToken");
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/users`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            params: {
              limit: 100, // Get enough users for dropdown
            },
          }
        );

        if (response.data?.data?.items) {
          setUsers(response.data.data.items);
        }
      } catch (error) {
        console.error("Failed to fetch users:", error);
      } finally {
        setLoadingUsers(false);
      }
    };

    fetchUsers();
  }, []);

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

  const handleIsUserCreatedChange = (checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      isUserCreated: checked,
      // Clear user selection if unchecking isUserCreated
      user: checked ? prev.user : null,
    }));
  };

  const handleUserChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      user: value === "none" ? null : value,
    }));
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
          placeholder="Enter clothing menu title"
          className={errors.title ? "border-red-500" : ""}
        />
        {errors.title && (
          <p className="text-sm text-red-500">{errors.title}</p>
        )}
      </div>

      {/* Is User Created Checkbox */}
      <div className="flex items-center space-x-2">
        <Checkbox
          id="isUserCreated"
          checked={formData.isUserCreated}
          onCheckedChange={handleIsUserCreatedChange}
        />
        <Label
          htmlFor="isUserCreated"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          User Created
        </Label>
      </div>

      {/* User Selection Dropdown (conditional) */}
      {formData.isUserCreated && (
        <div className="space-y-2">
          <Label htmlFor="user">User (Optional)</Label>
          <Select
            value={formData.user || "none"}
            onValueChange={handleUserChange}
            disabled={loadingUsers}
          >
            <SelectTrigger id="user">
              <SelectValue placeholder="Select a user" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              {users.map((user) => (
                <SelectItem key={user._id} value={user._id}>
                  {user.email}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {loadingUsers && (
            <p className="text-sm text-muted-foreground">Loading users...</p>
          )}
        </div>
      )}
    </div>
  );
});

ClothingMenuForm.displayName = "ClothingMenuForm";
