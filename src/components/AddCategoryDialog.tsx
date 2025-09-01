import * as React from "react";
import {
  IconCloudUpload,
  IconPlus,
  IconX,
  IconPhoto,
} from "@tabler/icons-react";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

type Errors = {
  name?: string;
  image?: string;
};

export function AddCategoryDialog() {
  const [open, setOpen] = React.useState(false);
  const [categoryName, setCategoryName] = React.useState("");
  const [image, setImage] = React.useState<File | null>(null);
  const [preview, setPreview] = React.useState<string | null>(null);
  const [dragActive, setDragActive] = React.useState(false);
  const [errors, setErrors] = React.useState<Errors>({});

  const validate = () => {
    const e: Errors = {};
    if (!categoryName.trim()) e.name = "Category name is required";
    if (!image) e.image = "Image is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;

    console.log("Saving new category...");
    console.log("Category Name:", categoryName);
    console.log("Image File:", image ? image.name : "No image selected");

    // reset after save
    setCategoryName("");
    setImage(null);
    setPreview(null);
    setErrors({});
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <IconPlus />
          <span className="hidden lg:inline">Add Category</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Category</DialogTitle>
          <DialogDescription>
            Enter the category details below.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Category Name */}
          <div className="grid gap-2">
            <Label htmlFor="category-name">Category Name</Label>
            <Input
              id="category-name"
              placeholder="e.g., Electronics"
              value={categoryName}
              onChange={(e) => {
                setCategoryName(e.target.value);
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
                !preview && document.getElementById("cat-image")?.click()
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
                    onClick={handleRemoveImage}
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
              id="cat-image"
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
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
