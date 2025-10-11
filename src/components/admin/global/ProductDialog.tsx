/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from "react";
import {
  IconCloudUpload,
  IconPlus,
  IconX,
  IconPhoto,
} from "@tabler/icons-react";
import { Button } from "../../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../ui/dialog";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Textarea } from "../../ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../../ui/select";
import axiosInstance from "../../../utils/axiosInstance";
// import { set } from "date-fns";

type Errors = {
  category?: string;
  subcategory?: string;
  brand?: string;
  name?: string;
  description?: string;
  price?: string;
  quantity?: string;
  colors?: string;
  mainImage?: string;
  images?: string;
};

// Backend Product interface matching your API
interface Product {
  _id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  priceAfterDiscount?: number;
  mainImage: string;
  images?: string[];
  colors?: string[];
  quantity: number;
  sold: number;
  category: {
    _id: string;
    name: string;
  };
  subCategory?: {
    _id: string;
    name: string;
  };
  brand?: {
    _id: string;
    name: string;
  };
  rating?: number;
  ratingsQuantity: number;
  createdAt: string;
  updatedAt?: string;
}

interface ProductDialogProps {
  mode?: "add" | "edit";
  existingData?: Product;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSubmit?: (data: {
    name?: string;
    description?: string;
    price?: number;
    priceAfterDiscount?: number;
    mainImage?: File;
    images?: File[];
    colors?: string[];
    quantity?: number;
    category?: string;
    subCategory?: string;
    brand?: string;
  }) => void;
  isSubmitting?: boolean;
}

// API interfaces for dropdown data
interface Category {
  _id: string;
  name: string;
}

interface SubCategory {
  _id: string;
  name: string;
  category: { _id: string };
}

interface Brand {
  _id: string;
  name: string;
}

export function ProductDialog({
  mode = "add",
  existingData,
  open: controlledOpen,
  onOpenChange,
  onSubmit,
  isSubmitting = false,
}: ProductDialogProps) {
  const [internalOpen, setInternalOpen] = React.useState(false);

  // Form state
  const [category, setCategory] = React.useState("");
  const [subcategory, setSubcategory] = React.useState("");
  const [brand, setBrand] = React.useState("");
  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [price, setPrice] = React.useState("");
  const [priceAfterDiscount, setPriceAfterDiscount] = React.useState("");
  const [quantity, setQuantity] = React.useState("");
  const [colors, setColors] = React.useState("");

  // Images
  const [mainImage, setMainImage] = React.useState<File | null>(null);
  const [previewMain, setPreviewMain] = React.useState<string | null>(null);
  const [dragActiveMain, setDragActiveMain] = React.useState(false);

  const [otherImages, setOtherImages] = React.useState<File[]>([]);
  const [previewOthers, setPreviewOthers] = React.useState<string[]>([]);
  const [imagesRemoved, setImagesRemoved] = React.useState(false);
  const [dragActiveOthers, setDragActiveOthers] = React.useState(false);

  const [errors, setErrors] = React.useState<Errors>({});

  // Dropdown data state
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [subcategories, setSubcategories] = React.useState<SubCategory[]>([]);
  const [brands, setBrands] = React.useState<Brand[]>([]);
  const [loading, setLoading] = React.useState(false);

  // Store original values for change detection in edit mode
  const [originalValues, setOriginalValues] = React.useState<{
    name: string;
    description: string;
    price: string;
    priceAfterDiscount: string;
    quantity: string;
    colors: string;
    category: string;
    subcategory: string;
    brand: string;
  } | null>(null);

  // NEW: Track if category has changed to force subcategory update
  const [categoryChanged, setCategoryChanged] = React.useState(false);

  // Use controlled or internal open state
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = onOpenChange || setInternalOpen;

  // Load dropdown data when dialog opens
  React.useEffect(() => {
    if (open) {
      loadDropdownData();
    }
  }, [open]);

  // Load categories, subcategories, and brands from API
  const loadDropdownData = async () => {
    setLoading(true);
    try {
      // Load categories
      const categoriesResponse = await axiosInstance.get("/api/categories");
      setCategories(categoriesResponse.data.documents || []);

      // Load subcategories
      const subcategoriesResponse = await axiosInstance.get(
        "/api/subcategories"
      );
      setSubcategories(subcategoriesResponse.data.documents || []);

      // Load brands
      const brandsResponse = await axiosInstance.get("/api/brands");
      setBrands(brandsResponse.data.documents || []);
    } catch (error) {
      console.error("Failed to load dropdown data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Initialize form with existing data in edit mode
  React.useEffect(() => {
    if (mode === "edit" && existingData && open) {
      const initialName = existingData.name || "";
      const initialDescription = existingData.description || "";
      const initialPrice = existingData.price?.toString() || "";
      const initialPriceAfterDiscount =
        existingData.priceAfterDiscount?.toString() || "";
      const initialQuantity = existingData.quantity?.toString() || "";
      const initialColors = existingData.colors?.join(", ") || "";
      const initialCategory = existingData.category?._id || "";
      const initialSubcategory = existingData.subCategory?._id || "";
      const initialBrand = existingData.brand?._id || "";

      // Set form values
      setName(initialName);
      setDescription(initialDescription);
      setPrice(initialPrice);
      setPriceAfterDiscount(initialPriceAfterDiscount);
      setQuantity(initialQuantity);
      setColors(initialColors);
      setCategory(initialCategory);
      setSubcategory(initialSubcategory);
      setBrand(initialBrand);

      // Store original values for change detection
      setOriginalValues({
        name: initialName,
        description: initialDescription,
        price: initialPrice,
        priceAfterDiscount: initialPriceAfterDiscount,
        quantity: initialQuantity,
        colors: initialColors,
        category: initialCategory,
        subcategory: initialSubcategory,
        brand: initialBrand,
      });

      // Reset category changed flag
      setCategoryChanged(false);

      if (existingData.mainImage) {
        setPreviewMain(existingData.mainImage);
      }
      if (existingData.images && existingData.images.length > 0) {
        setPreviewOthers(existingData.images);
      }
      setImagesRemoved(false)
    } else if (mode === "add" && open) {
      // Reset form for add mode
      resetForm();
    }
  }, [mode, existingData, open]);

  // Reset form function
  const resetForm = () => {
    setCategory("");
    setSubcategory("");
    setBrand("");
    setName("");
    setDescription("");
    setPrice("");
    setPriceAfterDiscount("");
    setQuantity("");
    setColors("");
    setMainImage(null);
    setPreviewMain(null);
    setOtherImages([]);
    setPreviewOthers([]);
    setImagesRemoved(false)
    setErrors({});
    setOriginalValues(null);
    setCategoryChanged(false);
  };

  // Validation
  const validate = () => {
    const e: Errors = {};
    if (!category) e.category = "Category is required";
    if (!name.trim()) e.name = "Product name is required";
    if (!description.trim()) e.description = "Description is required";
    if (!price || isNaN(Number(price)) || Number(price) <= 0)
      e.price = "Valid price is required";
    if (!quantity || isNaN(Number(quantity)) || Number(quantity) < 0)
      e.quantity = "Valid quantity is required";
    if (!colors.trim()) e.colors = "At least one color is required";
    if (mode === "add" && !mainImage) e.mainImage = "Main image is required";
    if (mode === "edit" && !mainImage && !previewMain)
      e.mainImage = "Main image is required";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // Check if a field has changed (for edit mode)
  const hasFieldChanged = (
    fieldName: keyof typeof originalValues,
    currentValue: string
  ) => {
    if (mode === "add" || !originalValues) return true;
    return originalValues[fieldName] !== currentValue;
  };

  // Save Handler
  const handleSave = () => {
    if (!validate()) return;

    const productData: any = {};

    if (mode === "add") {
      // For add mode, include all required fields
      productData.name = name;
      productData.description = description;
      productData.price = Number(price);
      if (priceAfterDiscount)
        productData.priceAfterDiscount = Number(priceAfterDiscount);
      productData.quantity = Number(quantity);
      productData.colors = colors
        .split(",")
        .map((c) => c.trim())
        .filter((c) => c.length > 0);
      productData.category = category;
      if (subcategory) productData.subCategory = subcategory;
      if (brand) productData.brand = brand;
      if (mainImage) productData.mainImage = mainImage;
      if (otherImages.length > 0) productData.images = otherImages;
    } else {
      // For edit mode, only include changed fields
      if (hasFieldChanged("name", name)) {
        productData.name = name;
      }
      if (hasFieldChanged("description", description)) {
        productData.description = description;
      }
      if (hasFieldChanged("price", price)) {
        productData.price = Number(price);
      }
      if (hasFieldChanged("priceAfterDiscount", priceAfterDiscount)) {
        if (priceAfterDiscount) {
          productData.priceAfterDiscount = Number(priceAfterDiscount);
        } else {
          // Handle case where discount price is being removed
          productData.priceAfterDiscount = undefined;
        }
      }
      if (hasFieldChanged("quantity", quantity)) {
        productData.quantity = Number(quantity);
      }
      if (hasFieldChanged("colors", colors)) {
        productData.colors = colors
          .split(",")
          .map((c) => c.trim())
          .filter((c) => c.length > 0);
      }
      if (hasFieldChanged("category", category)) {
        productData.category = category;
      }

      if (categoryChanged || hasFieldChanged("subcategory", subcategory)) {
        if (subcategory && subcategory.trim() !== "") {
          productData.subCategory = subcategory;
        } else {
          // Send empty string which will be converted to null by the API

          productData.subCategory = null;
        }
      }

      if (hasFieldChanged("brand", brand)) {
        if (brand && brand.trim() !== "") {
          productData.brand = brand;
        } else {
          // Send empty string which will be converted to null by the API
          productData.brand = null;
        }
      }

      // Always include new images if they were selected
      if (mainImage) {
        productData.mainImage = mainImage;
      }
      // Always include new images if they were selected OR if images were removed
if (otherImages.length > 0) {
  productData.images = otherImages;
} else if (imagesRemoved && existingData?.images && existingData.images.length > 0) {
  productData.images = null;
}
    }

    console.log(
      `${mode === "edit" ? "Updating" : "Saving new"} product:`,
      productData
    );
    console.log("Changed fields only:", Object.keys(productData));

    onSubmit?.(productData);

    if (mode === "add") {
      // For add mode: reset form but keep dialog open
      resetForm();
    } else {
      // For edit mode: close dialog
      setOpen(false);
    }
  };

  // Dialog close handler
  const handleDialogClose = (newOpen: boolean) => {
    if (!newOpen) {
      resetForm();
    }
    setOpen(newOpen);
  };

  // ENHANCED: Category change handler
  const handleCategoryChange = (value: string) => {
    setCategory(value);

    // Always reset subcategory when category changes
    setSubcategory("");

    if (
      mode === "edit" &&
      originalValues &&
      value !== originalValues.category
    ) {
      setCategoryChanged(true);
    }

    setErrors((prev) => ({ ...prev, category: undefined }));
  };

  // Image Handlers
  const handleMainFile = (file: File) => {
    setMainImage(file);
    setPreviewMain(URL.createObjectURL(file));
    setErrors((prev) => ({ ...prev, mainImage: undefined }));
  };

  const handleMainFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      handleMainFile(e.target.files[0]);
    }
  };

  const handleRemoveMain = () => {
    setMainImage(null);
    setPreviewMain(null);
    setErrors((prev) => ({ ...prev, mainImage: "Main image is required" }));
  };

  const handleOtherFiles = (files: FileList) => {
    const arr = Array.from(files);
    setOtherImages((prev) => [...prev, ...arr]);
    setPreviewOthers((prev) => [
      ...prev,
      ...arr.map((f) => URL.createObjectURL(f)),
    ]);
    setErrors((prev) => ({ ...prev, images: undefined }));
  };

  const handleRemoveOther = (idx: number) => {
  const newOtherImages = otherImages.filter((_, i) => i !== idx);
  const newPreviewOthers = previewOthers.filter((_, i) => i !== idx);
  
  setOtherImages(newOtherImages);
  setPreviewOthers(newPreviewOthers);
  
  // If all images are removed in edit mode and there were existing images
  if (mode === "edit" && newOtherImages.length === 0 && existingData?.images && existingData.images.length > 0) {
    setImagesRemoved(true);
  }
};

  // Filter subcategories based on selected category
  const filteredSubcategories = subcategories.filter(
    (sub) => sub.category._id === category
  );

  const dialogContent = (
    <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto custom-scroll">
      <DialogHeader>
        <DialogTitle>
          {mode === "edit" ? "Edit Product" : "Add New Product"}
        </DialogTitle>
        <DialogDescription>
          {mode === "edit"
            ? "Update the product details below."
            : "Enter the product details below."}
        </DialogDescription>
      </DialogHeader>

      <div className="grid gap-4 py-4">
        {/* Category */}
        <div className="grid gap-2">
          <Label>Category</Label>
          <Select
            value={category}
            onValueChange={handleCategoryChange}
            disabled={loading}
          >
            <SelectTrigger className={errors.category ? "border-red-500" : ""}>
              <SelectValue
                placeholder={
                  loading ? "Loading categories..." : "Choose category"
                }
              />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat._id} value={cat._id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.category && (
            <p className="text-sm text-red-600">{errors.category}</p>
          )}
        </div>

        {/* Subcategory */}
        <div className="grid gap-2">
          <Label>
            Subcategory{" "}
            <span className="text-muted-foreground text-sm">(Optional)</span>
          </Label>
          <Select
            value={subcategory}
            onValueChange={(value) => {
              // Handle the "none" option
              if (value === "none") {
                setSubcategory("");
              } else {
                setSubcategory(value);
              }
              setErrors((prev) => ({ ...prev, subcategory: undefined }));
            }}
            disabled={!category || loading}
          >
            <SelectTrigger
              className={errors.subcategory ? "border-red-500" : ""}
            >
              <SelectValue
                placeholder={
                  !category
                    ? "Select category first"
                    : "Choose subcategory (optional)"
                }
              />
            </SelectTrigger>
            <SelectContent>
              {/* Add "None" option */}
              <SelectItem value="none">
                <span className="text-muted-foreground italic">None</span>
              </SelectItem>

              {filteredSubcategories.length > 0
                ? filteredSubcategories.map((sub) => (
                    <SelectItem key={sub._id} value={sub._id}>
                      {sub.name}
                    </SelectItem>
                  ))
                : category && (
                    <SelectItem value="no-subcategories" disabled>
                      <span className="text-muted-foreground italic">
                        No subcategories available
                      </span>
                    </SelectItem>
                  )}
            </SelectContent>
          </Select>
          {errors.subcategory && (
            <p className="text-sm text-red-600">{errors.subcategory}</p>
          )}

          {/* Show helper text based on category selection */}
          {category && filteredSubcategories.length === 0 && (
            <p className="text-xs text-muted-foreground">
              This category has no subcategories available.
            </p>
          )}
        </div>

        {/* Brand */}
        <div className="grid gap-2">
          <Label>
            Brand{" "}
            <span className="text-muted-foreground text-sm">(Optional)</span>
          </Label>
          <Select
            value={brand}
            onValueChange={(value) => {
              // Handle the "none" option
              if (value === "none") {
                setBrand("");
              } else {
                setBrand(value);
              }
              setErrors((prev) => ({ ...prev, brand: undefined }));
            }}
            disabled={loading}
          >
            <SelectTrigger className={errors.brand ? "border-red-500" : ""}>
              <SelectValue
                placeholder={
                  loading ? "Loading brands..." : "Choose brand (optional)"
                }
              />
            </SelectTrigger>
            <SelectContent>
              {/* Add "None" option */}
              <SelectItem value="none">
                <span className="text-muted-foreground italic">None</span>
              </SelectItem>

              {brands.map((br) => (
                <SelectItem key={br._id} value={br._id}>
                  {br.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.brand && (
            <p className="text-sm text-red-600">{errors.brand}</p>
          )}
        </div>

        {/* Product Name */}
        <div className="grid gap-2">
          <Label>Product Name</Label>
          <Input
            placeholder="e.g., iPhone 15 Pro Max"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (e.target.value.trim()) {
                setErrors((prev) => ({ ...prev, name: undefined }));
              }
            }}
            className={errors.name ? "border-red-500" : ""}
          />
          {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
        </div>

        {/* Description */}
        <div className="grid gap-2">
          <Label>Description</Label>
          <Textarea
            placeholder="Enter detailed product description..."
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
              if (e.target.value.trim()) {
                setErrors((prev) => ({ ...prev, description: undefined }));
              }
            }}
            className={errors.description ? "border-red-500" : ""}
            rows={3}
          />
          {errors.description && (
            <p className="text-sm text-red-600">{errors.description}</p>
          )}
        </div>

        {/* Price, Discount Price & Quantity */}
        <div className="grid grid-cols-3 gap-4">
          <div className="grid gap-2">
            <Label>Price ($)</Label>
            <Input
              type="number"
              placeholder="99.99"
              value={price}
              onChange={(e) => {
                setPrice(e.target.value);
                if (
                  e.target.value &&
                  !isNaN(Number(e.target.value)) &&
                  Number(e.target.value) > 0
                ) {
                  setErrors((prev) => ({ ...prev, price: undefined }));
                }
              }}
              className={errors.price ? "border-red-500" : ""}
              step="0.01"
              min="0"
            />
            {errors.price && (
              <p className="text-sm text-red-600">{errors.price}</p>
            )}
          </div>
          <div className="grid gap-2">
            <Label>
              Discount Price ($){" "}
              <span className="text-muted-foreground text-sm">(Optional)</span>
            </Label>
            <Input
              type="number"
              placeholder="79.99"
              value={priceAfterDiscount}
              onChange={(e) => setPriceAfterDiscount(e.target.value)}
              step="0.01"
              min="0"
            />
          </div>
          <div className="grid gap-2">
            <Label>Quantity</Label>
            <Input
              type="number"
              placeholder="100"
              value={quantity}
              onChange={(e) => {
                setQuantity(e.target.value);
                if (
                  e.target.value &&
                  !isNaN(Number(e.target.value)) &&
                  Number(e.target.value) >= 0
                ) {
                  setErrors((prev) => ({ ...prev, quantity: undefined }));
                }
              }}
              className={errors.quantity ? "border-red-500" : ""}
              min="0"
            />
            {errors.quantity && (
              <p className="text-sm text-red-600">{errors.quantity}</p>
            )}
          </div>
        </div>

        {/* Colors */}
        <div className="grid gap-2">
          <Label>Colors (comma separated)</Label>
          <Input
            placeholder="e.g., Black, Silver, Gold, Space Gray"
            value={colors}
            onChange={(e) => {
              setColors(e.target.value);
              if (e.target.value.trim()) {
                setErrors((prev) => ({ ...prev, colors: undefined }));
              }
            }}
            className={errors.colors ? "border-red-500" : ""}
          />
          {errors.colors && (
            <p className="text-sm text-red-600">{errors.colors}</p>
          )}
        </div>

        {/* Main Image Upload */}
        <div className="grid gap-2">
          <Label>Main Product Image</Label>
          <div
            className={`relative flex min-h-[16rem] w-full flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 text-center cursor-pointer transition-colors
              ${
                dragActiveMain
                  ? "border-blue-500 bg-blue-50 text-blue-500"
                  : errors.mainImage
                  ? "border-red-500 text-red-500"
                  : "border-gray-300 bg-gray-50 text-gray-500 hover:border-blue-500 hover:text-blue-500"
              }`}
            onClick={() =>
              !previewMain && document.getElementById("main-image")?.click()
            }
            onDragOver={(e) => {
              e.preventDefault();
              setDragActiveMain(true);
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              setDragActiveMain(false);
            }}
            onDrop={(e) => {
              e.preventDefault();
              setDragActiveMain(false);
              if (e.dataTransfer.files?.[0]) {
                handleMainFile(e.dataTransfer.files[0]);
              }
            }}
          >
            {previewMain ? (
              <>
                <img
                  src={previewMain}
                  alt="Main Preview"
                  className="h-40 w-auto rounded-md object-cover"
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveMain();
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
                  Drag & drop main product image here or{" "}
                  <span className="text-blue-600 hover:underline">
                    click to browse
                  </span>
                </p>
              </>
            )}
          </div>
          <input
            id="main-image"
            type="file"
            className="hidden"
            accept="image/*"
            onChange={handleMainFileChange}
          />
          {errors.mainImage && (
            <p className="text-sm text-red-600 mt-1">{errors.mainImage}</p>
          )}
          {mainImage && !errors.mainImage && (
            <p className="mt-2 text-xs text-green-600">
              Selected: {mainImage.name}
            </p>
          )}
        </div>

        {/* Other Images Upload */}
        <div className="grid gap-2">
          <Label>
            Additional Images{" "}
            <span className="text-muted-foreground text-sm">(Optional)</span>
          </Label>
          <div
            className={`relative flex min-h-[16rem] w-full flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 text-center cursor-pointer transition-colors
              ${
                dragActiveOthers
                  ? "border-blue-500 bg-blue-50 text-blue-500"
                  : errors.images
                  ? "border-red-500 text-red-500"
                  : "border-gray-300 bg-gray-50 text-gray-500 hover:border-blue-500 hover:text-blue-500"
              }`}
            onClick={() => document.getElementById("other-images")?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setDragActiveOthers(true);
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              setDragActiveOthers(false);
            }}
            onDrop={(e) => {
              e.preventDefault();
              setDragActiveOthers(false);
              if (e.dataTransfer.files) {
                handleOtherFiles(e.dataTransfer.files);
              }
            }}
          >
            {previewOthers.length > 0 ? (
              <div className="flex flex-wrap gap-2 justify-center">
                {previewOthers.map((src, idx) => (
                  <div key={idx} className="relative">
                    <img
                      src={src}
                      alt={`Preview ${idx + 1}`}
                      className="h-24 w-24 object-cover rounded-md"
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveOther(idx);
                      }}
                      className="absolute top-1 right-1 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
                    >
                      <IconX size={14} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <>
                <IconCloudUpload className="h-10 w-10" />
                <p className="mt-2 text-sm">
                  Drag & drop multiple images here or{" "}
                  <span className="text-blue-600 hover:underline">
                    click to browse
                  </span>
                </p>
              </>
            )}
          </div>
          <input
            id="other-images"
            type="file"
            className="hidden"
            accept="image/*"
            multiple
            onChange={(e) => {
              if (e.target.files) handleOtherFiles(e.target.files);
            }}
          />
          {errors.images && (
            <p className="text-sm text-red-600 mt-1">{errors.images}</p>
          )}
          {otherImages.length > 0 && !errors.images && (
            <p className="mt-2 text-xs text-green-600">
              Selected: {otherImages.length} additional image(s)
            </p>
          )}
        </div>
      </div>

      <DialogFooter>
        <Button onClick={handleSave} disabled={isSubmitting}>
          <IconPhoto className="mr-2 h-4 w-4" />
          {isSubmitting
            ? mode === "edit"
              ? "Updating..."
              : "Saving..."
            : mode === "edit"
            ? "Update Product"
            : "Save Product"}
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
          <IconPlus />
          <span className="hidden lg:inline">Add Product</span>
        </Button>
      </DialogTrigger>
      {dialogContent}
    </Dialog>
  );
}

// Export the Add version for backward compatibility
export function AddProductDialog() {
  return <ProductDialog mode="add" />;
}

// Export a function to create edit dialogs for the data table
// eslint-disable-next-line react-refresh/only-export-components
export function createEditProductDialog(
  rowData: Product,
  onSave: (updatedData: {
    name?: string;
    description?: string;
    price?: number;
    priceAfterDiscount?: number;
    mainImage?: File;
    images?: File[];
    colors?: string[];
    quantity?: number;
    category?: string;
    subCategory?: string;
    brand?: string;
  }) => void,
  isSubmitting: boolean = false
) {
  return (
    <ProductDialog
      mode="edit"
      existingData={rowData}
      onSubmit={onSave}
      isSubmitting={isSubmitting}
      onOpenChange={() => {}}
    />
  );
}
