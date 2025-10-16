/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from "react";
import { useTranslation } from 'react-i18next';
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
import { Switch } from "../../ui/switch";

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
    active?: boolean;
    image?: File | null;
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
  const { t } = useTranslation();
  const [internalOpen, setInternalOpen] = React.useState(false);

  // Form state
  const [name, setName] = React.useState("");
  const [originalName, setOriginalName] = React.useState("");
  const [email, setEmail] = React.useState("");
  // const [originalEmail, setOriginalEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [role, setRole] = React.useState<"admin" | "user">("user");
  const [originalRole, setOriginalRole] = React.useState<"admin" | "user">(
    "user"
  );
  const [active, setActive] = React.useState(true);
  const [originalActive, setOriginalActive] = React.useState(true);

  // Image
  const [image, setImage] = React.useState<File | null>(null);
  const [preview, setPreview] = React.useState<string | null>(null);
  const [imageRemoved, setImageRemoved] = React.useState(false);
  const [dragActive, setDragActive] = React.useState(false);

  const [errors, setErrors] = React.useState<Errors>({});

  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = onOpenChange || setInternalOpen;

  React.useEffect(() => {
    if (mode === "edit" && existingData && open) {
      setName(existingData.name || "");
      setOriginalName(existingData.name || "");
      setEmail(existingData.email || "");
      // setOriginalEmail(existingData.email || "");
      setRole(existingData.role || "user");
      setOriginalRole(existingData.role || "user");
      setActive(existingData.active ?? true);
      setOriginalActive(existingData.active ?? true);
      if (existingData.image) {
        setPreview(existingData.image);
      }
      setPassword("");
      setConfirmPassword("");
      setImageRemoved(false);
    } else if (mode === "add" && open) {
      resetForm();
    }
  }, [mode, existingData, open]);

  const validate = () => {
    const e: Errors = {};
    if (!name.trim()) e.name = t('userDialog.errors.nameRequired');
    // if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      e.email = t('userDialog.errors.emailRequired');

    if (mode === "add") {
      if (!password) e.password = t('userDialog.errors.passwordRequired');
      if (password.length < 6)
        e.password = t('userDialog.errors.passwordMinLength');
      if (confirmPassword !== password)
        e.confirmPassword = t('userDialog.errors.passwordsDontMatch');
    } else if (mode === "edit" && password) {
      if (password.length < 6)
        e.password = t('userDialog.errors.passwordMinLength');
      if (confirmPassword !== password)
        e.confirmPassword = t('userDialog.errors.passwordsDontMatch');
    }

    if (!role) e.role = t('userDialog.errors.roleRequired');

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const resetForm = () => {
    setName("");
    setOriginalName("");
    // setEmail("");
    // setOriginalEmail("");
    setPassword("");
    setConfirmPassword("");
    setRole("user");
    setOriginalRole("user");
    setActive(true);
    setOriginalActive(true);
    setImage(null);
    setPreview(null);
    setImageRemoved(false);
    setErrors({});
  };

  // Function to detect changes and prepare payload
  const prepareUpdatePayload = () => {
    const payload: {
      name?: string;
      email?: string;
      password?: string;
      role?: "admin" | "user";
      active?: boolean;
      image?: File | null;
    } = {};

    if (mode === "add") {
      payload.name = name;
      payload.email = email;
      payload.password = password;
      payload.role = role;
      payload.active = active;
      if (image) payload.image = image;
    } else {
      // Edit mode - only include changed fields
      if (name.trim() !== originalName.trim()) {
        payload.name = name;
      }
      // if (email.trim() !== originalEmail.trim()) {
      //   payload.email = email;
      // }
      if (password.trim()) {
        payload.password = password;
      }
      if (role !== originalRole) {
        payload.role = role;
      }
      if (active !== originalActive) {
        payload.active = active;
      }
      if (image instanceof File) {
        payload.image = image;
      } else if (imageRemoved && existingData?.image) {
        payload.image = null;
      }
    }

    return payload;
  };

  const handleSave = () => {
    if (!validate()) return;

    const userData = prepareUpdatePayload();

    if (mode === "edit" && Object.keys(userData).length === 0) {
      console.log("No changes detected");
      setOpen(false);
      return;
    }

    console.log(
      `${mode === "edit" ? "Updating" : "Saving new"} user:`,
      userData
    );

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
    setImageRemoved(false);
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
      setErrors((prev) => ({ ...prev, image: t('userDialog.errors.imageRequired') }));
    } else {
      setImageRemoved(true);
    }
  };

  const handleDialogClose = (newOpen: boolean) => {
    if (!newOpen) {
      resetForm();
    }
    setOpen(newOpen);
  };

  const saveButtonContent = isLoading
    ? mode === "edit"
      ? t('userDialog.buttons.updating')
      : t('userDialog.buttons.saving')
    : mode === "edit"
    ? t('userDialog.buttons.update')
    : t('userDialog.buttons.save');

  const dialogContent = (
    <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>
          {mode === "edit" ? t('userDialog.titles.edit') : t('userDialog.titles.add')}
        </DialogTitle>
        <DialogDescription>
          {mode === "edit"
            ? t('userDialog.descriptions.edit')
            : t('userDialog.descriptions.add')}
        </DialogDescription>
      </DialogHeader>

      <div className="grid gap-4 py-4">
        {/* Name */}
        <div className="grid gap-2">
          <Label htmlFor="name">{t('userDialog.labels.name')}</Label>
          <Input
            id="name"
            placeholder={t('userDialog.placeholders.name')}
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
          <Label htmlFor="email">{t('userDialog.labels.email')}</Label>
          <Input
            id="email"
            type="email"
            placeholder={t('userDialog.placeholders.email')}
            value={email}
            // onChange={(e) => {
            //   setEmail(e.target.value);
            //   if (e.target.value.trim()) {
            //     setErrors((prev) => ({ ...prev, email: undefined }));
            //   }
            // }}
            className={errors.email ? "border-red-500" : ""}
          />
          {errors.email && (
            <p className="text-sm text-red-600 mt-1">{errors.email}</p>
          )}
        </div>

        {/* Role */}
        <div className="grid gap-2">
          <Label htmlFor="user-role">{t('userDialog.labels.role')}</Label>
          <Select
            value={role}
            onValueChange={(value: "admin" | "user") => {
              setRole(value);
              setErrors((prev) => ({ ...prev, role: undefined }));
            }}
          >
            <SelectTrigger id="user-role">
              <SelectValue placeholder={t('userDialog.placeholders.role')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">{t('userDialog.roles.admin')}</SelectItem>
              <SelectItem value="user">{t('userDialog.roles.user')}</SelectItem>
            </SelectContent>
          </Select>
          {errors.role && (
            <p className="text-sm text-red-600 mt-1">{errors.role}</p>
          )}
        </div>

        {/* Active Status - Only show in edit mode */}
        {mode === "edit" && (
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label htmlFor="active-status">{t('userDialog.labels.accountStatus')}</Label>
              <p className="text-sm text-muted-foreground">
                {active
                  ? t('userDialog.status.active')
                  : t('userDialog.status.inactive')}
              </p>
            </div>
            <Switch
              id="active-status"
              checked={active}
              onCheckedChange={setActive}
            />
          </div>
        )}

        {/* User Image Upload */}
        <div className="grid gap-2">
          <Label htmlFor="upload-user-image">{t('userDialog.labels.uploadUserImage')}</Label>
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
                  alt={t('userDialog.uploadArea.altPreview')}
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
                  {t('userDialog.uploadArea.dragDrop')}{" "}
                  <span className="text-blue-600 hover:underline">
                    {t('userDialog.uploadArea.clickToBrowse')}
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
              {t('userDialog.uploadArea.selected')} {image.name}
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
          <span className="hidden lg:inline">{t('userDialog.buttons.addUser')}</span>
        </Button>
      </DialogTrigger>
      {dialogContent}
    </Dialog>
  );
}

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
        const updatePayload = {
          _id: rowData._id,
          ...userData,
        };
        console.log("Edit dialog sending payload:", updatePayload);
        onSave(updatePayload);
      }}
      isLoading={isLoading}
      onOpenChange={() => {}}
    />
  );
}