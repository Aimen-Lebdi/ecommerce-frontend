/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from "react";
import { useTranslation } from 'react-i18next';
import {
  IconChevronDown,
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
import { Badge } from "../../ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../../ui/collapsible";
import { Separator } from "../../ui/separator";
import type { User } from "../../../types";

type Errors = {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  role?: string;
  image?: string;
};

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
    image?: File | null;
  }) => Promise<void>;
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
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [role, setRole] = React.useState<"admin" | "user">("user");
  const [originalRole, setOriginalRole] = React.useState<"admin" | "user">(
    "user"
  );
  // active/ban status removed (no longer in edit dialog)

  // Image
  const [image, setImage] = React.useState<File | null>(null);
  const [preview, setPreview] = React.useState<string | null>(null);
  const [imageRemoved, setImageRemoved] = React.useState(false);
  const [dragActive, setDragActive] = React.useState(false);

  const [errors, setErrors] = React.useState<Errors>({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Read-only collapsibles (edit mode only)
  const [phonesOpen, setPhonesOpen] = React.useState(false);
  const [addressesOpen, setAddressesOpen] = React.useState(false);

  // Default item first, then the rest in insertion order
  const phones = [...(existingData?.phones ?? [])].sort(
    (a, b) => Number(b.isDefault) - Number(a.isDefault)
  );
  const addresses = [...(existingData?.addresses ?? [])].sort(
    (a, b) => Number(b.isDefault) - Number(a.isDefault)
  );

  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = onOpenChange || setInternalOpen;

  React.useEffect(() => {
    if (mode === "edit" && existingData && open) {
      setName(existingData.name || "");
      setOriginalName(existingData.name || "");
      setEmail(existingData.email || "");
      setRole(existingData.role || "user");
      setOriginalRole(existingData.role || "user");
      if (existingData.image) {
        setPreview(existingData.image);
      }
      setPassword("");
      setConfirmPassword("");
      setImageRemoved(false);
      // Reset read-only collapsibles so a stale open state doesn't carry over
      setPhonesOpen(false);
      setAddressesOpen(false);
    } else if (mode === "add" && open) {
      resetForm();
    }
  }, [mode, existingData, open]);

  const validate = () => {
    const e: Errors = {};
    if (!name.trim()) e.name = t('userDialog.errors.nameRequired');
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
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
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setRole("user");
    setOriginalRole("user");
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
      image?: File | null;
    } = {};

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
      // if (email.trim() !== originalEmail.trim()) {
      //   payload.email = email;
      // }
      if (password.trim()) {
        payload.password = password;
      }
      if (role !== originalRole) {
        payload.role = role;
      }
      if (image instanceof File) {
        payload.image = image;
      } else if (imageRemoved && existingData?.image) {
        payload.image = null;
      }
    }

    return payload;
  };

  const handleSave = async () => {
    if (!validate()) return;

    const userData = prepareUpdatePayload();

    if (mode === "edit" && Object.keys(userData).length === 0) {
      setOpen(false);
      return;
    }

    setIsSubmitting(true);

    try {
      await onSave?.(userData);

      if (mode === "add") {
        resetForm();
        // Close the dialog after a successful create
        setOpen(false);
      } else {
        // For edit mode: close dialog only after successful update
        setOpen(false);
      }
    } catch (error) {
      console.error("Save failed:", error);
      // Dialog stays open on error so user can retry
    } finally {
      setIsSubmitting(false);
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

  // Combined loading state: external isLoading OR internal isSubmitting
  const isDisabled = isLoading || isSubmitting;

  const saveButtonContent = isDisabled
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
            readOnly={mode === "edit"}
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

        {/* Password (add mode only) */}
        {mode === "add" && (
          <>
            <div className="grid gap-2">
              <Label htmlFor="password">{t('userDialog.labels.password')}</Label>
              <Input
                id="password"
                type="password"
                placeholder={t('userDialog.placeholders.password')}
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

            <div className="grid gap-2">
              <Label htmlFor="confirm-password">
                {t('userDialog.labels.confirmPassword')}
              </Label>
              <Input
                id="confirm-password"
                type="password"
                placeholder={t('userDialog.placeholders.confirmPassword')}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (e.target.value === password) {
                    setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
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
          </>
        )}

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

      {mode === "edit" && (
        <div className="grid gap-4">
          {/* Phones (read-only) */}
          <Collapsible open={phonesOpen} onOpenChange={setPhonesOpen}>
            <CollapsibleTrigger asChild>
              <button
                type="button"
                className="flex w-full items-center justify-between rounded-md border px-4 py-2 text-sm font-medium hover:bg-accent"
              >
                {t('userDialog.phones.title')}
                <IconChevronDown
                  className={`h-4 w-4 transition-transform ${
                    phonesOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent className="py-2">
              {phones.length === 0 ? (
                <p className="px-1 text-sm text-muted-foreground">
                  {t('userDialog.phones.empty')}
                </p>
              ) : (
                <ul className="space-y-2">
                  {phones.map((p) => (
                    <li
                      key={p._id}
                      className="flex items-center justify-between rounded-md bg-muted px-3 py-2"
                    >
                      <span className="text-sm">
                        {p.label}: {p.phone}
                      </span>
                      {p.isDefault && (
                        <Badge variant="secondary">
                          {t('userDialog.default')}
                        </Badge>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </CollapsibleContent>
          </Collapsible>

          <Separator />

          {/* Addresses (read-only) */}
          <Collapsible open={addressesOpen} onOpenChange={setAddressesOpen}>
            <CollapsibleTrigger asChild>
              <button
                type="button"
                className="flex w-full items-center justify-between rounded-md border px-4 py-2 text-sm font-medium hover:bg-accent"
              >
                {t('userDialog.addresses.title')}
                <IconChevronDown
                  className={`h-4 w-4 transition-transform ${
                    addressesOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent className="py-2">
              {addresses.length === 0 ? (
                <p className="px-1 text-sm text-muted-foreground">
                  {t('userDialog.addresses.empty')}
                </p>
              ) : (
                <ul className="space-y-2">
                  {addresses.map((a) => (
                    <li
                      key={a._id}
                      className="flex items-center justify-between rounded-md bg-muted px-3 py-2"
                    >
                      <span className="text-sm">
                        {a.label}: {a.wilaya}
                        {a.dayra ? ` / ${a.dayra}` : ""}
                        {a.baladiya ? ` / ${a.baladiya}` : ""}
                      </span>
                      {a.isDefault && (
                        <Badge variant="secondary">
                          {t('userDialog.default')}
                        </Badge>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </CollapsibleContent>
          </Collapsible>
        </div>
      )}

      <DialogFooter>
        <Button onClick={handleSave} disabled={isDisabled}>
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
  onSave: (updatedData: {
    name?: string;
    email?: string;
    password?: string;
    role?: "admin" | "user";
    image?: File | null;
  }) => Promise<void>,
  isLoading: boolean = false
) {
  return (
    <UserDialog
      mode="edit"
      existingData={rowData}
      onSave={onSave}
      isLoading={isLoading}
      onOpenChange={() => {}}
    />
  );
}