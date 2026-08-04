import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { MapPin, Plus, Edit, Trash2, Star, Loader2, X } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import {
  fetchAddresses,
  createAddress,
  updateAddress,
  removeAddress,
  setDefaultAddress,
} from "../../features/addresses/addressesSlice";
import type { Address } from "../../features/addresses/addressesAPI";
import { toast } from "sonner";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Badge } from "../ui/badge";

// Local form shape (no _id / isDefault)
interface AddressForm {
  wilaya: string;
  dayra: string;
  baladiya: string;
}

const emptyForm: AddressForm = { wilaya: "", dayra: "", baladiya: "" };

const AddressBook = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const {
    addresses,
    loading,
    isAdding,
    isUpdating,
    isRemoving,
    isSettingDefault,
  } = useAppSelector((state) => state.addresses);

  // Add-new form state
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newAddress, setNewAddress] = useState<AddressForm>(emptyForm);

  // Edit-in-place state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<AddressForm>(emptyForm);

  // Field-level validation (empty = error)
  const [errors, setErrors] = useState<{
    wilaya?: boolean;
    dayra?: boolean;
    baladiya?: boolean;
  }>({});

  useEffect(() => {
    dispatch(fetchAddresses());
  }, [dispatch]);

  const validate = (form: AddressForm) => {
    const nextErrors = {
      wilaya: !form.wilaya.trim(),
      dayra: !form.dayra.trim(),
      baladiya: !form.baladiya.trim(),
    };
    setErrors(nextErrors);
    return !nextErrors.wilaya && !nextErrors.dayra && !nextErrors.baladiya;
  };

  const resetAddForm = () => {
    setNewAddress(emptyForm);
    setIsAddingNew(false);
    setErrors({});
  };

  const handleAdd = async () => {
    if (!validate(newAddress)) {
      toast.error(t("myAccount.addresses.required"));
      return;
    }
    try {
      await dispatch(
        createAddress({
          wilaya: newAddress.wilaya.trim(),
          dayra: newAddress.dayra.trim(),
          baladiya: newAddress.baladiya.trim(),
        })
      ).unwrap();
      toast.success(t("myAccount.addresses.added"));
      resetAddForm();
    } catch (err) {
      toast.error(
        typeof err === "string" ? err : t("myAccount.addresses.addFailed")
      );
    }
  };

  const startEdit = (address: Address) => {
    setEditingId(address._id);
    setEditForm({
      wilaya: address.wilaya,
      dayra: address.dayra,
      baladiya: address.baladiya,
    });
    setErrors({});
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm(emptyForm);
    setErrors({});
  };

  const handleUpdate = async () => {
    if (!editingId || !validate(editForm)) {
      toast.error(t("myAccount.addresses.required"));
      return;
    }
    try {
      await dispatch(
        updateAddress({
          addressId: editingId,
          wilaya: editForm.wilaya.trim(),
          dayra: editForm.dayra.trim(),
          baladiya: editForm.baladiya.trim(),
        })
      ).unwrap();
      toast.success(t("myAccount.addresses.updated"));
      cancelEdit();
    } catch (err) {
      toast.error(
        typeof err === "string" ? err : t("myAccount.addresses.updateFailed")
      );
    }
  };

  const handleDelete = async (address: Address) => {
    if (!window.confirm(t("myAccount.addresses.deleteConfirm"))) return;
    try {
      await dispatch(removeAddress(address._id)).unwrap();
      toast.success(t("myAccount.addresses.deleted"));
    } catch (err) {
      toast.error(
        typeof err === "string" ? err : t("myAccount.addresses.deleteFailed")
      );
    }
  };

  const handleSetDefault = async (addressId: string) => {
    try {
      await dispatch(setDefaultAddress(addressId)).unwrap();
      toast.success(t("myAccount.addresses.defaultSet"));
    } catch (err) {
      toast.error(
        typeof err === "string" ? err : t("myAccount.addresses.defaultFailed")
      );
    }
  };

  const renderAddressFields = (
    form: AddressForm,
    onChange: (field: keyof AddressForm, value: string) => void,
    disabled: boolean
  ) => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="space-y-2">
        <Label htmlFor="addr-wilaya">{t("checkout.wilaya")} *</Label>
        <Input
          id="addr-wilaya"
          value={form.wilaya}
          onChange={(e) => onChange("wilaya", e.target.value)}
          placeholder={t("checkout.wilayaPlaceholder")}
          disabled={disabled}
          className={errors.wilaya ? "border-destructive" : ""}
        />
        {errors.wilaya && (
          <p className="text-xs text-destructive">
            {t("myAccount.addresses.required")}
          </p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="addr-dayra">{t("checkout.dayra")} *</Label>
        <Input
          id="addr-dayra"
          value={form.dayra}
          onChange={(e) => onChange("dayra", e.target.value)}
          placeholder={t("checkout.dayraPlaceholder")}
          disabled={disabled}
          className={errors.dayra ? "border-destructive" : ""}
        />
        {errors.dayra && (
          <p className="text-xs text-destructive">
            {t("myAccount.addresses.required")}
          </p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="addr-baladiya">{t("checkout.baladiya")} *</Label>
        <Input
          id="addr-baladiya"
          value={form.baladiya}
          onChange={(e) => onChange("baladiya", e.target.value)}
          placeholder={t("checkout.baladiyaPlaceholder")}
          disabled={disabled}
          className={errors.baladiya ? "border-destructive" : ""}
        />
        {errors.baladiya && (
          <p className="text-xs text-destructive">
            {t("myAccount.addresses.required")}
          </p>
        )}
      </div>
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <MapPin className="h-4 w-4 sm:h-5 sm:w-5" />
            {t("myAccount.addresses.title")}
          </CardTitle>
          {!isAddingNew && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAddingNew(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              {t("myAccount.addresses.addNew")}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading && addresses.length === 0 ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {/* Add-new form */}
            {isAddingNew && (
              <div className="border rounded-lg p-4 space-y-4 bg-muted/30">
                {renderAddressFields(
                  newAddress,
                  (field, value) =>
                    setNewAddress((prev) => ({ ...prev, [field]: value })),
                  isAdding
                )}
                <div className="flex gap-2">
                  <Button onClick={handleAdd} disabled={isAdding}>
                    {isAdding ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : null}
                    {t("myAccount.addresses.save")}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={resetAddForm}
                    disabled={isAdding}
                  >
                    <X className="h-4 w-4 mr-2" />
                    {t("myAccount.addresses.cancel")}
                  </Button>
                </div>
              </div>
            )}

            {/* Address list */}
            {addresses.length === 0 && !isAddingNew ? (
              <p className="text-center text-muted-foreground py-8">
                {t("myAccount.addresses.empty")}
              </p>
            ) : (
              <div className="space-y-3">
                {addresses.map((address) =>
                  editingId === address._id ? (
                    <div
                      key={address._id}
                      className="border rounded-lg p-4 space-y-4 bg-muted/30"
                    >
                      {renderAddressFields(
                        editForm,
                        (field, value) =>
                          setEditForm((prev) => ({ ...prev, [field]: value })),
                        isUpdating
                      )}
                      <div className="flex gap-2">
                        <Button onClick={handleUpdate} disabled={isUpdating}>
                          {isUpdating ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : null}
                          {t("myAccount.addresses.save")}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={cancelEdit}
                          disabled={isUpdating}
                        >
                          <X className="h-4 w-4 mr-2" />
                          {t("myAccount.addresses.cancel")}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div
                      key={address._id}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 border rounded-lg gap-3"
                    >
                      <div className="flex items-start space-x-3">
                        <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                        <div>
                          <p className="font-medium text-sm sm:text-base">
                            {address.wilaya} - {address.dayra} -{" "}
                            {address.baladiya}
                          </p>
                          {address.isDefault && (
                            <Badge variant="secondary" className="mt-1">
                              <Star className="h-3 w-3 mr-1" />
                              {t("myAccount.addresses.default")}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 sm:shrink-0">
                        {!address.isDefault && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSetDefault(address._id)}
                            disabled={isSettingDefault}
                            title={t("myAccount.addresses.setDefault")}
                          >
                            {isSettingDefault ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Star className="h-4 w-4" />
                            )}
                            <span className="sr-only">
                              {t("myAccount.addresses.setDefault")}
                            </span>
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => startEdit(address)}
                          disabled={isUpdating}
                        >
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">
                            {t("myAccount.addresses.edit")}
                          </span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(address)}
                          disabled={isRemoving}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">
                            {t("myAccount.addresses.delete")}
                          </span>
                        </Button>
                      </div>
                    </div>
                  )
                )}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default AddressBook;
