import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Phone, Plus, Edit, Trash2, Star, Loader2, X, AlertTriangle } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import {
  fetchPhones,
  createPhone,
  updatePhone,
  removePhone,
  setDefaultPhone,
} from "../../features/phones/phonesSlice";
import type { Phone as SavedPhone } from "../../features/phones/phonesAPI";
import {
  formatPhoneForDisplay,
  isCompleteLocalPhone,
  maskPhoneChange,
  phoneToLocalDigits,
} from "../../utils/phoneFormat";
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
  const [newPhoneLabel, setNewPhoneLabel] = useState("");

  // Edit-in-place state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPhone, setEditPhone] = useState("");
  const [editPhoneLabel, setEditPhoneLabel] = useState("");

  // Validation errors
  const [errors, setErrors] = useState<{
    phone?: boolean;
    label?: boolean;
    labelTooLong?: boolean;
  }>({});

  useEffect(() => {
    dispatch(fetchPhones());
  }, [dispatch]);

  const validate = (phone: string, label: string) => {
    const nextErrors = {
      phone: !isCompleteLocalPhone(phone),
      label: label.trim().length === 0,
      labelTooLong: label.trim().length > 30,
    };
    setErrors(nextErrors);
    return !nextErrors.phone && !nextErrors.label && !nextErrors.labelTooLong;
  };

  const resetAddForm = () => {
    setNewPhone("");
    setNewPhoneLabel("");
    setIsAddingNew(false);
    setErrors({});
  };

  const handleAdd = async () => {
    if (!validate(newPhone, newPhoneLabel)) {
      toast.error(t("myAccount.phones.required"));
      return;
    }
    // Case-insensitive label uniqueness (backend stays authoritative).
    const label = newPhoneLabel.trim();
    if (
      phones.some(
        (p) => p.label && p.label.toLowerCase() === label.toLowerCase()
      )
    ) {
      toast.error(t("myAccount.phones.labelDuplicate"));
      return;
    }
    try {
      await dispatch(
        createPhone({ phone: phoneToLocalDigits(newPhone), label })
      ).unwrap();
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
    setEditPhoneLabel(phone.label || "");
    setErrors({});
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditPhone("");
    setEditPhoneLabel("");
    setErrors({});
  };

  const handleUpdate = async () => {
    if (!editingId || !validate(editPhone, editPhoneLabel)) {
      toast.error(t("myAccount.phones.required"));
      return;
    }
    // Case-insensitive uniqueness excluding the entry being edited.
    const label = editPhoneLabel.trim();
    if (
      phones.some(
        (p) =>
          p._id !== editingId &&
          p.label &&
          p.label.toLowerCase() === label.toLowerCase()
      )
    ) {
      toast.error(t("myAccount.phones.labelDuplicate"));
      return;
    }
    try {
      await dispatch(
        updatePhone({
          phoneId: editingId,
          phone: phoneToLocalDigits(editPhone),
          label,
        })
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

  // Hard gate: block adding new entries while any entry lacks a label.
  // Editing stays allowed (the fix path) and deleting stays allowed (escape hatch).
  const entriesNeedingLabels = phones.filter(
    (p) => !p.label || !p.label.trim()
  ).length;
  const canAddNew = entriesNeedingLabels === 0;

  const renderPhoneFields = (
    phone: string,
    label: string,
    onPhoneChange: (value: string) => void,
    onLabelChange: (value: string) => void,
    idPrefix: string,
    disabled: boolean
  ) => (
    <div className="space-y-4 max-w-sm">
      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-label`}>
          {t("myAccount.phones.label")} *
        </Label>
        <Input
          id={`${idPrefix}-label`}
          value={label}
          onChange={(e) => onLabelChange(e.target.value)}
          placeholder={t("myAccount.phones.labelPlaceholder")}
          maxLength={30}
          disabled={disabled}
          className={
            errors.label || errors.labelTooLong ? "border-destructive" : ""
          }
        />
        {errors.label && (
          <p className="text-xs text-destructive">
            {t("myAccount.phones.labelRequired")}
          </p>
        )}
        {errors.labelTooLong && (
          <p className="text-xs text-destructive">
            {t("myAccount.phones.labelMaxLength")}
          </p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-phone`}>
          {t("myAccount.phones.phone")} *
        </Label>
        <Input
          id={`${idPrefix}-phone`}
          type="tel"
          value={phone}
          onChange={(e) => onPhoneChange(maskPhoneChange(e.target.value))}
          placeholder={t("myAccount.phones.phonePlaceholder")}
          disabled={disabled}
          className={errors.phone ? "border-destructive" : ""}
        />
        {errors.phone && (
          <p className="text-xs text-destructive">
            {t("myAccount.phones.phoneInvalid")}
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
            <Phone className="h-4 w-4 sm:h-5 sm:w-5" />
            {t("myAccount.phones.title")}
          </CardTitle>
          {!isAddingNew && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAddingNew(true)}
              disabled={!canAddNew}
              title={
                canAddNew ? undefined : t("myAccount.phones.labelsNeededHint")
              }
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
            {/* Hard-gate banner: some entries are missing labels */}
            {entriesNeedingLabels > 0 && (
              <div className="flex items-start gap-2 rounded-lg border border-amber-300/70 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
                <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                <div className="space-y-1">
                  <p className="font-medium">
                    {t("myAccount.phones.labelsNeeded", {
                      count: entriesNeedingLabels,
                    })}
                  </p>
                  <p className="text-xs text-amber-700 dark:text-amber-300">
                    {t("myAccount.phones.labelsNeededHint")}
                  </p>
                </div>
              </div>
            )}

            {/* Add-new form */}
            {isAddingNew && (
              <div className="border rounded-lg p-4 space-y-4 bg-muted/30">
                {renderPhoneFields(
                  newPhone,
                  newPhoneLabel,
                  setNewPhone,
                  setNewPhoneLabel,
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
                      {renderPhoneFields(
                        editPhone,
                        editPhoneLabel,
                        setEditPhone,
                        setEditPhoneLabel,
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
                          {phone.label && phone.label.trim() ? (
                            <>
                              <p className="font-medium text-sm sm:text-base">
                                {phone.label}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {formatPhoneForDisplay(phone.phone)}
                              </p>
                            </>
                          ) : (
                            <>
                              <p className="font-medium text-sm sm:text-base">
                                {formatPhoneForDisplay(phone.phone)}
                              </p>
                              <Badge variant="secondary" className="mt-1">
                                <AlertTriangle className="h-3 w-3" />
                                {t("myAccount.phones.labelMissing")}
                              </Badge>
                            </>
                          )}
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
