/**
 * Example usage of ClothingMenuForm with EntityDialog
 * 
 * This file demonstrates how to integrate the ClothingMenuForm component
 * with the EntityDialog for create and edit operations.
 */

import { useRef, useState } from "react";
import { EntityDialog } from "@/components/EntityDialog";
import { ClothingMenuForm, ClothingMenuFormRef, ClothingMenuFormData } from "@/components/ClothingMenuForm";
import { createClothingMenu, updateClothingMenu } from "@/lib/api/taxonomy";

export function ClothingMenuDialogExample() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [editData, setEditData] = useState<any>(null);
  
  const formRef = useRef<ClothingMenuFormRef>(null);

  const handleSubmit = async () => {
    if (!formRef.current) return;
    
    // Validate form
    if (!formRef.current.validate()) {
      return;
    }

    // Get form data
    const data = formRef.current.getData();
    
    // Convert null to undefined for API compatibility
    const apiData = {
      ...data,
      user: data.user ?? undefined,
    };
    
    setLoading(true);
    try {
      if (mode === "create") {
        await createClothingMenu(apiData);
      } else {
        await updateClothingMenu(editData._id, apiData);
      }
      
      setOpen(false);
      // Refresh data table here
    } catch (error: any) {
      console.error("Error saving clothing menu:", error);
      alert(error.response?.data?.message || "Failed to save clothing menu");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setMode("create");
    setEditData(null);
    setOpen(true);
  };

  const handleEdit = (menu: any) => {
    setMode("edit");
    setEditData(menu);
    setOpen(true);
  };

  return (
    <>
      <button onClick={handleCreate}>Create New</button>
      
      <EntityDialog
        open={open}
        onOpenChange={setOpen}
        title={mode === "create" ? "Create Clothing Menu" : "Edit Clothing Menu"}
        description={mode === "create" 
          ? "Add a new clothing menu to the taxonomy" 
          : "Update the clothing menu details"}
        onSubmit={handleSubmit}
        loading={loading}
        mode={mode}
      >
        <ClothingMenuForm
          ref={formRef}
          initialData={editData}
          onValidationChange={setIsValid}
        />
      </EntityDialog>
    </>
  );
}
