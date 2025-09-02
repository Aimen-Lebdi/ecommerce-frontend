import * as React from "react";
import { Button } from "../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  IconPlus,
  IconPhoto,
  IconCloudUpload,
  IconX,
} from "@tabler/icons-react";

// Dummy data for categories - in a real app, this would come from your API
const dummyCategories = [
  { id: 1, name: "Electronics" },
  { id: 2, name: "Clothing" },
  { id: 3, name: "Home & Garden" },
  { id: 4, name: "Books" },
  { id: 5, name: "Sports & Outdoors" },
];

type Errors = {
  category?: string;
  name?: string;
  description?: string;
  image?: string;
};

interface Subcategory {
  id: number;
  name: string;
  description: string;
  categoryName: string;
  categoryId: number;
  status: "active" | "inactive";
  productCount: number;
  image?: string;
  createdAt: string;
}

interface SubCategoryDialogProps {
  mode?: "add" | "edit";
  existingData?: Subcategory;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSave?: (data: Subcategory) => void;
}

export function SubCategoryDialog({ 
  mode = "add", 
  existingData, 
  open: controlledOpen, 
  onOpenChange, 
  onSave 
}: SubCategoryDialogProps) {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const [selectedCategory, setSelectedCategory] = React.useState<number | "">(""); 
  const [subCategoryName, setSubCategoryName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [status, setStatus] = React.useState<"active" | "inactive">("active");
  const [image, setImage] = React.useState<File | null>(null);
  const [preview, setPreview] = React.useState<string | null>(null);
  const [dragActive, setDragActive] = React.useState(false);
  const [errors, setErrors] = React.useState<Errors>({});

  // Use controlled or internal open state
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = onOpenChange || setInternalOpen;

  // Initialize form with existing data in edit mode
  React.useEffect(() => {
    if (mode === "edit" && existingData && open) {
      setSelectedCategory(existingData.categoryId || "");
      setSubCategoryName(existingData.name || "");
      setDescription(existingData.description || "");
      setStatus(existingData.status || "active");
      if (existingData.image) {
        setPreview(existingData.image);
      }
    } else if (mode === "add" && open) {
      // Reset form for add mode
      setSelectedCategory("");
      setSubCategoryName("");
      setDescription("");
      setStatus("active");
      setImage(null);
      setPreview(null);
    }
  }, [mode, existingData, open]);

  const validate = () => {
    const e: Errors = {};
    if (!selectedCategory) e.category = "Category is required";
    if (!subCategoryName.trim()) e.name = "Subcategory name is required";
    if (!description.trim()) e.description = "Description is required";
    if (mode === "add" && !image) e.image = "Image is required";
    if (mode === "edit" && !image && !preview) e.image = "Image is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const resetForm = () => {
    setSelectedCategory("");
    setSubCategoryName("");
    setDescription("");
    setStatus("active");
    setImage(null);
    setPreview(null);
    setErrors({});
  };

  const handleSave = () => {
    if (!validate()) return;

    // Find the selected category name
    const selectedCategoryData = dummyCategories.find(cat => cat.id === selectedCategory);
    const categoryName = selectedCategoryData?.name || "";

    const subCategoryData: Subcategory = {
      id: existingData?.id || Date.now(),
      name: subCategoryName,
      description: description,
      categoryName: categoryName,
      categoryId: selectedCategory as number,
      status: status,
      productCount: existingData?.productCount || 0, // Default to 0 for new subcategories
      image: preview || existingData?.image || "",
      createdAt: existingData?.createdAt || new Date().toISOString().split('T')[0],
    };

    console.log(`${mode === "edit" ? "Updating" : "Saving new"} subcategory:`, subCategoryData);

    onSave?.(subCategoryData);

    if (mode === "add") {
      // For add mode: reset form but keep dialog open
      resetForm();
    } else {
      // For edit mode: close dialog
      setOpen(false);
    }
  };

  const handleFile = (file: File) => {
    setImage(file);
    setPreview(URL.createObjectURL(file));
    setErrors((prev) => ({ ...prev, image: undefined }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleRemoveImage = () => {
    setImage(null);
    setPreview(null);
    setErrors((prev) => ({ ...prev, image: "Image is required" }));
  };

  const handleDialogClose = (newOpen: boolean) => {
    if (!newOpen) {
      // Reset form when closing
      resetForm();
    }
    setOpen(newOpen);
  };

  const dialogContent = (
    <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>
          {mode === "edit" ? "Edit Subcategory" : "Add New Subcategory"}
        </DialogTitle>
        <DialogDescription>
          {mode === "edit" 
            ? "Update the subcategory details here." 
            : "Choose a parent category and enter the subcategory details here."
          }
        </DialogDescription>
      </DialogHeader>

      <div className="grid gap-4 py-4">
        {/* Category Selector */}
        <div className="grid gap-2">
          <Label htmlFor="category">Category</Label>
          <Select
            value={selectedCategory.toString()}
            onValueChange={(value) => {
              setSelectedCategory(Number(value));
              setErrors((prev) => ({ ...prev, category: undefined }));
            }}
          >
            <SelectTrigger
              id="category"
              aria-invalid={!!errors.category}
              className={errors.category ? "border-red-500" : ""}
            >
              <SelectValue placeholder="Select a parent category" />
            </SelectTrigger>
            <SelectContent>
              {dummyCategories.map((category) => (
                <SelectItem key={category.id} value={category.id.toString()}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.category && (
            <p className="text-sm text-red-600 mt-1">{errors.category}</p>
          )}
        </div>

        {/* Subcategory Name */}
        <div className="grid gap-2">
          <Label htmlFor="sub-category-name">Subcategory Name</Label>
          <Input
            id="sub-category-name"
            placeholder="e.g., Laptops"
            value={subCategoryName}
            onChange={(e) => {
              setSubCategoryName(e.target.value);
              if (e.target.value.trim()) {
                setErrors((prev) => ({ ...prev, name: undefined }));
              }
            }}
            className={errors.name ? "border-red-500" : ""}
          />
          {errors.name && (
            <p className="text-sm text-red-600 mt-1">{errors.name}</p>
          )}
        </div>

        {/* Description */}
        <div className="grid gap-2">
          <Label htmlFor="subcategory-description">Description</Label>
          <Textarea
            id="subcategory-description"
            placeholder="e.g., Portable computers and laptops"
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
              if (e.target.value.trim()) {
                setErrors((prev) => ({ ...prev, description: undefined }));
              }
            }}
            className={errors.description ? "border-red-500" : ""}
          />
          {errors.description && (
            <p className="text-sm text-red-600 mt-1">{errors.description}</p>
          )}
        </div>

        {/* Status */}
        <div className="grid gap-2">
          <Label htmlFor="subcategory-status">Status</Label>
          <Select value={status} onValueChange={(value: "active" | "inactive") => setStatus(value)}>
            <SelectTrigger id="subcategory-status">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Image Upload */}
        <div className="grid gap-2">
          <Label htmlFor="upload-images">Upload image</Label>
          <div
            className={`relative flex min-h-[16rem] w-full flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 text-center cursor-pointer transition-colors
              ${
                dragActive
                  ? "border-blue-500 bg-blue-50 text-blue-500"
                  : errors.image
                  ? "border-red-500 text-red-500"
                  : "border-gray-300 bg-gray-50 text-gray-500 hover:border-blue-500 hover:text-blue-500"
              }`}
            onClick={() =>
              !preview && document.getElementById("subcat-image")?.click()
            }
            onDragOver={(e) => {
              e.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              setDragActive(false);
            }}
            onDrop={(e) => {
              e.preventDefault();
              setDragActive(false);
              if (e.dataTransfer.files?.[0]) {
                handleFile(e.dataTransfer.files[0]);
              }
            }}
          >
            {preview ? (
              <>
                <img
                  src={preview}
                  alt="Preview"
                  className="h-40 w-auto rounded-md object-cover"
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveImage();
                  }}
                  className="absolute top-2 right-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
                >
                  <IconX size={16} />
                </button>
              </>
            ) : (
              <>
                <IconCloudUpload className="h-10 w-10" />
                <p className="mt-2 text-sm">
                  Drag & drop your image here or{" "}
                  <span className="text-blue-600 hover:underline">
                    click to browse
                  </span>
                </p>
              </>
            )}
          </div>
          <input
            id="subcat-image"
            type="file"
            className="hidden"
            accept="image/*"
            onChange={handleFileChange}
          />
          {errors.image && (
            <p className="text-sm text-red-600 mt-1">{errors.image}</p>
          )}
          {image && !errors.image && (
            <p className="mt-2 text-xs text-green-600">
              Selected: {image.name}
            </p>
          )}
        </div>
      </div>

      <DialogFooter>
        <Button onClick={handleSave}>
          <IconPhoto className="mr-2 h-4 w-4" />
          {mode === "edit" ? "Update" : "Save"}
        </Button>
      </DialogFooter>
    </DialogContent>
  );

  if (mode === "edit") {
    // For edit mode, return dialog with proper close handling
    return (
      <Dialog open={open} onOpenChange={handleDialogClose}>
        {dialogContent}
      </Dialog>
    );
  }

  // For add mode, return the trigger button with dialog
  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <IconPlus className="mr-2 h-4 w-4" />
          <span className="hidden lg:inline">Add Subcategory</span>
        </Button>
      </DialogTrigger>
      {dialogContent}
    </Dialog>
  );
}

// Export the Add version for backward compatibility
export function AddSubCategoryDialog() {
  return <SubCategoryDialog mode="add" />;
}

// Export a function to create edit dialogs for the data table
// eslint-disable-next-line react-refresh/only-export-components
export function createEditSubCategoryDialog(rowData: Subcategory, onSave: (updatedData: Subcategory) => void) {
  return (
    <SubCategoryDialog 
      mode="edit" 
      existingData={rowData} 
      onSave={onSave}
      // Don't set open=true here, let the component manage its own state
    />
  );
}