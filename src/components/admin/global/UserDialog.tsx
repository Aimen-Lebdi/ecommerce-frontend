import * as React from "react";
import {
  IconCloudUpload,
  IconPlus,
  IconX,
  IconUser,
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
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../../ui/select";

type Errors = {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  role?: string;
  image?: string;
};

interface User {
  _id: string;
  name: string;
  email: string;
  role: "admin" | "user";
  active: boolean;
  image?: string;
  createdAt: string;
  updatedAt?: string;
}

interface UserDialogProps {
  mode?: "add" | "edit";
  existingData?: User;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSave?: (data: {
    name?: string;
    email?: string;
    password?: string;
    role?: "admin" | "user";
    image?: File;
  }) => void;
  isLoading?: boolean;
}

export function UserDialog({
  mode = "add",
  existingData,
  open: controlledOpen,
  onOpenChange,
  onSave,
  isLoading = false,
}: UserDialogProps) {
  const [internalOpen, setInternalOpen] = React.useState(false);

  // Form state
  const [name, setName] = React.useState("");
  const [originalName, setOriginalName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [originalEmail, setOriginalEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [role, setRole] = React.useState<"admin" | "user">("user");
  const [originalRole, setOriginalRole] = React.useState<"admin" | "user">("user");

  // Image
  const [image, setImage] = React.useState<File | null>(null);
  const [preview, setPreview] = React.useState<string | null>(null);
  const [imageRemoved, setImageRemoved] = React.useState(false); // Track if existing image was removed
  const [dragActive, setDragActive] = React.useState(false);

  const [errors, setErrors] = React.useState<Errors>({});

  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = onOpenChange || setInternalOpen;

  React.useEffect(() => {
    if (mode === "edit" && existingData && open) {
      setName(existingData.name || "");
      setOriginalName(existingData.name || "");
      setEmail(existingData.email || "");
      setOriginalEmail(existingData.email || "");
      setRole(existingData.role || "user");
      setOriginalRole(existingData.role || "user");
      if (existingData.image) {
        setPreview(existingData.image);
      }
      setPassword("");
      setConfirmPassword("");
      setImageRemoved(false); // Reset image removed state
    } else if (mode === "add" && open) {
      resetForm();
    }
  }, [mode, existingData, open]);

  const validate = () => {
    const e: Errors = {};
    if (!name.trim()) e.name = "Name is required";
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      e.email = "Valid email is required";

    if (mode === "add") {
      if (!password) e.password = "Password is required";
      if (password.length < 6)
        e.password = "Password must be at least 6 characters";
      if (confirmPassword !== password)
        e.confirmPassword = "Passwords do not match";
    } else if (mode === "edit" && password) {
      if (password.length < 6)
        e.password = "Password must be at least 6 characters";
      if (confirmPassword !== password)
        e.confirmPassword = "Passwords do not match";
    }

    if (!role) e.role = "Role is required";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const resetForm = () => {
    setName("");
    setOriginalName("");
    setEmail("");
    setOriginalEmail("");
    setPassword("");
    setConfirmPassword("");
    setRole("user");
    setOriginalRole("user");
    setImage(null);
    setPreview(null);
    setImageRemoved(false); // Reset image removed state
    setErrors({});
  };

  // Function to detect changes and prepare payload
  const prepareUpdatePayload = () => {
    const payload: {
      name?: string;
      email?: string;
      password?: string;
      role?: "admin" | "user";
      image?: File | null;
    } = {};

    // Only include fields that changed or are required for add mode
    if (mode === "add") {
      payload.name = name;
      payload.email = email;
      payload.password = password;
      payload.role = role;
      if (image) payload.image = image;
    } else {
      // Edit mode - only include changed fields
      if (name.trim() !== originalName.trim()) {
        payload.name = name;
      }
      if (email.trim() !== originalEmail.trim()) {
        payload.email = email;
      }
      if (password.trim()) {
        payload.password = password;
      }
      if (role !== originalRole) {
        payload.role = role;
      }
      // Handle image changes: new file uploaded OR existing image removed
      if (image instanceof File) {
        payload.image = image;
      } else if (imageRemoved && existingData?.image) {
        // If user had an image and it was removed, send null to indicate removal
        payload.image = null;
      }
    }

    return payload;
  };

  const handleSave = () => {
    if (!validate()) return;

    // Get only changed fields
    const userData = prepareUpdatePayload();

    // Don't proceed if nothing changed in edit mode
    if (mode === "edit" && Object.keys(userData).length === 0) {
      console.log("No changes detected");
      setOpen(false);
      return;
    }

    console.log(
      `${mode === "edit" ? "Updating" : "Saving new"} user:`,
      userData
    );
    
    // Debug: Log what fields are being sent
    console.log("Fields being sent:", Object.keys(userData));
    if (userData.image) {
      console.log("Image file:", userData.image.name, userData.image.size);
    }

    onSave?.(userData);

    if (mode === "add") {
      resetForm();
    } else {
      setOpen(false);
    }
  };

  const handleFile = (file: File) => {
    setImage(file);
    setPreview(URL.createObjectURL(file));
    setImageRemoved(false); // Reset removed state when new file is selected
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
    
    if (mode === "add") {
      setErrors((prev) => ({ ...prev, image: "User image is required" }));
    } else {
      // In edit mode, mark that the existing image was removed
      setImageRemoved(true);
    }
  };

  const handleDialogClose = (newOpen: boolean) => {
    if (!newOpen) {
      resetForm();
    }
    setOpen(newOpen);
  };

  // Update the save button to show loading state
  const saveButtonContent = isLoading ? (
    mode === "edit" ? "Updating..." : "Saving..."
  ) : (
    mode === "edit" ? "Update" : "Save"
  );

  const dialogContent = (
    <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>
          {mode === "edit" ? "Edit User" : "Add New User"}
        </DialogTitle>
        <DialogDescription>
          {mode === "edit"
            ? "Update the user details below."
            : "Enter the user details below."}
        </DialogDescription>
      </DialogHeader>

      <div className="grid gap-4 py-4">
        {/* Name */}
        <div className="grid gap-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            placeholder="e.g., John Doe"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
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

        {/* Email */}
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="e.g., john@example.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (e.target.value.trim()) {
                setErrors((prev) => ({ ...prev, email: undefined }));
              }
            }}
            className={errors.email ? "border-red-500" : ""}
          />
          {errors.email && (
            <p className="text-sm text-red-600 mt-1">{errors.email}</p>
          )}
        </div>

        {/* Password */}
        <div className="grid gap-2">
          <Label htmlFor="password">
            Password
            {mode === "edit" && (
              <span className="text-sm text-muted-foreground ml-2">
                (Leave blank to keep current password)
              </span>
            )}
          </Label>
          <Input
            id="password"
            type="password"
            placeholder={
              mode === "edit"
                ? "Enter new password (optional)"
                : "Enter password"
            }
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (e.target.value) {
                setErrors((prev) => ({ ...prev, password: undefined }));
              }
            }}
            className={errors.password ? "border-red-500" : ""}
          />
          {errors.password && (
            <p className="text-sm text-red-600 mt-1">{errors.password}</p>
          )}
        </div>

        {/* Confirm Password */}
        {(mode === "add" || password) && (
          <div className="grid gap-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (e.target.value === password) {
                  setErrors((prev) => ({
                    ...prev,
                    confirmPassword: undefined,
                  }));
                }
              }}
              className={errors.confirmPassword ? "border-red-500" : ""}
            />
            {errors.confirmPassword && (
              <p className="text-sm text-red-600 mt-1">
                {errors.confirmPassword}
              </p>
            )}
          </div>
        )}

        {/* Role */}
        <div className="grid gap-2">
          <Label htmlFor="user-role">Role</Label>
          <Select
            value={role}
            onValueChange={(value: "admin" | "user") => {
              setRole(value);
              setErrors((prev) => ({ ...prev, role: undefined }));
            }}
          >
            <SelectTrigger id="user-role">
              <SelectValue placeholder="Choose role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="user">User</SelectItem>
            </SelectContent>
          </Select>
          {errors.role && (
            <p className="text-sm text-red-600 mt-1">{errors.role}</p>
          )}
        </div>

        {/* User Image Upload */}
        <div className="grid gap-2">
          <Label htmlFor="upload-user-image">Upload user image</Label>
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
              !preview && document.getElementById("user-image")?.click()
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
                  className="h-40 w-40 rounded-full object-cover"
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
                  Drag & drop your user image here or{" "}
                  <span className="text-blue-600 hover:underline">
                    click to browse
                  </span>
                </p>
              </>
            )}
          </div>
          <input
            id="user-image"
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
        <Button onClick={handleSave} disabled={isLoading}>
          <IconUser className="mr-2 h-4 w-4" />
          {saveButtonContent}
        </Button>
      </DialogFooter>
    </DialogContent>
  );

  if (mode === "edit") {
    return (
      <Dialog open={open} onOpenChange={handleDialogClose}>
        {dialogContent}
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <IconPlus />
          <span className="hidden lg:inline">Add User</span>
        </Button>
      </DialogTrigger>
      {dialogContent}
    </Dialog>
  );
}

// This factory function creates edit dialogs for the data table
// eslint-disable-next-line react-refresh/only-export-components
export function createEditUserDialog(
  rowData: User,
  onSave: (updatedData: { _id: string; [key: string]: any }) => void,
  isLoading: boolean = false
) {
  return (
    <UserDialog
      mode="edit"
      existingData={rowData}
      onSave={(userData) => {
        // Ensure we always include the user ID
        const updatePayload = {
          _id: rowData._id, // Always use the rowData._id to ensure we have the correct ID
          ...userData, // Only the changed fields from the dialog
        };
        console.log("Edit dialog sending payload:", updatePayload);
        console.log("Original rowData:", rowData);
        onSave(updatePayload);
      }}
      isLoading={isLoading}
      onOpenChange={() => {}} // Edit dialog closes when clicking outside or X
    />
  );
}