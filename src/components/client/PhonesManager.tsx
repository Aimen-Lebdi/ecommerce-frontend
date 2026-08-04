import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Phone, Plus, Edit, Trash2, Star, Loader2, X } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import {
  fetchPhones,
  createPhone,
  updatePhone,
  removePhone,
  setDefaultPhone,
} from "../../features/phones/phonesSlice";
import type { Phone as SavedPhone } from "../../features/phones/phonesAPI";
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

const PhonesManager = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const {
    phones,
    loading,
    isAdding,
    isUpdating,
    isRemoving,
    isSettingDefault,
  } = useAppSelector((state) => state.phones);

  // Add-new form state
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newPhone, setNewPhone] = useState("");

  // Edit-in-place state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPhone, setEditPhone] = useState("");

  // Validation errors
  const [error, setError] = useState(false);

  useEffect(() => {
    dispatch(fetchPhones());
  }, [dispatch]);

  const validate = (phone: string) => {
    const valid = phone.trim().length > 0;
    setError(!valid);
    return valid;
  };

  const resetAddForm = () => {
    setNewPhone("");
    setIsAddingNew(false);
    setError(false);
  };

  const handleAdd = async () => {
    if (!validate(newPhone)) {
      toast.error(t("myAccount.phones.required"));
      return;
    }
    try {
      await dispatch(createPhone({ phone: newPhone.trim() })).unwrap();
      toast.success(t("myAccount.phones.added"));
      resetAddForm();
    } catch (err) {
      toast.error(
        typeof err === "string" ? err : t("myAccount.phones.addFailed")
      );
    }
  };

  const startEdit = (phone: SavedPhone) => {
    setEditingId(phone._id);
    setEditPhone(phone.phone);
    setError(false);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditPhone("");
    setError(false);
  };

  const handleUpdate = async () => {
    if (!editingId || !validate(editPhone)) {
      toast.error(t("myAccount.phones.required"));
      return;
    }
    try {
      await dispatch(
        updatePhone({ phoneId: editingId, phone: editPhone.trim() })
      ).unwrap();
      toast.success(t("myAccount.phones.updated"));
      cancelEdit();
    } catch (err) {
      toast.error(
        typeof err === "string" ? err : t("myAccount.phones.updateFailed")
      );
    }
  };

  const handleDelete = async (phone: SavedPhone) => {
    if (!window.confirm(t("myAccount.phones.deleteConfirm"))) return;
    try {
      await dispatch(removePhone(phone._id)).unwrap();
      toast.success(t("myAccount.phones.deleted"));
    } catch (err) {
      toast.error(
        typeof err === "string" ? err : t("myAccount.phones.deleteFailed")
      );
    }
  };

  const handleSetDefault = async (phoneId: string) => {
    try {
      await dispatch(setDefaultPhone(phoneId)).unwrap();
      toast.success(t("myAccount.phones.defaultSet"));
    } catch (err) {
      toast.error(
        typeof err === "string" ? err : t("myAccount.phones.defaultFailed")
      );
    }
  };

  const renderPhoneInput = (
    value: string,
    onChange: (value: string) => void,
    id: string,
    disabled: boolean
  ) => (
    <div className="space-y-2 max-w-sm">
      <Label htmlFor={id}>{t("myAccount.phones.phone")} *</Label>
      <Input
        id={id}
        type="tel"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="+213 5 55 12 34 56"
        disabled={disabled}
        className={error ? "border-destructive" : ""}
      />
      {error && (
        <p className="text-xs text-destructive">
          {t("myAccount.phones.required")}
        </p>
      )}
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Phone className="h-4 w-4 sm:h-5 sm:w-5" />
            {t("myAccount.phones.title")}
          </CardTitle>
          {!isAddingNew && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAddingNew(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              {t("myAccount.phones.addNew")}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading && phones.length === 0 ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {/* Add-new form */}
            {isAddingNew && (
              <div className="border rounded-lg p-4 space-y-4 bg-muted/30">
                {renderPhoneInput(
                  newPhone,
                  setNewPhone,
                  "phone-new",
                  isAdding
                )}
                <div className="flex gap-2">
                  <Button onClick={handleAdd} disabled={isAdding}>
                    {isAdding ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : null}
                    {t("myAccount.phones.save")}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={resetAddForm}
                    disabled={isAdding}
                  >
                    <X className="h-4 w-4 mr-2" />
                    {t("myAccount.phones.cancel")}
                  </Button>
                </div>
              </div>
            )}

            {/* Phone list */}
            {phones.length === 0 && !isAddingNew ? (
              <p className="text-center text-muted-foreground py-8">
                {t("myAccount.phones.empty")}
              </p>
            ) : (
              <div className="space-y-3">
                {phones.map((phone) =>
                  editingId === phone._id ? (
                    <div
                      key={phone._id}
                      className="border rounded-lg p-4 space-y-4 bg-muted/30"
                    >
                      {renderPhoneInput(
                        editPhone,
                        setEditPhone,
                        "phone-edit",
                        isUpdating
                      )}
                      <div className="flex gap-2">
                        <Button onClick={handleUpdate} disabled={isUpdating}>
                          {isUpdating ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : null}
                          {t("myAccount.phones.save")}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={cancelEdit}
                          disabled={isUpdating}
                        >
                          <X className="h-4 w-4 mr-2" />
                          {t("myAccount.phones.cancel")}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div
                      key={phone._id}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 border rounded-lg gap-3"
                    >
                      <div className="flex items-start space-x-3">
                        <Phone className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                        <div>
                          <p className="font-medium text-sm sm:text-base">
                            {phone.phone}
                          </p>
                          {phone.isDefault && (
                            <Badge variant="secondary" className="mt-1">
                              <Star className="h-3 w-3 mr-1" />
                              {t("myAccount.phones.default")}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 sm:shrink-0">
                        {!phone.isDefault && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSetDefault(phone._id)}
                            disabled={isSettingDefault}
                            title={t("myAccount.phones.setDefault")}
                          >
                            {isSettingDefault ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Star className="h-4 w-4" />
                            )}
                            <span className="sr-only">
                              {t("myAccount.phones.setDefault")}
                            </span>
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => startEdit(phone)}
                          disabled={isUpdating}
                        >
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">
                            {t("myAccount.phones.edit")}
                          </span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(phone)}
                          disabled={isRemoving}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">
                            {t("myAccount.phones.delete")}
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

export default PhonesManager;
