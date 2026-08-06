import { useTranslation } from "react-i18next";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { getWilayaNames, getDayras, getBaladiyas } from "../../data/algeria";

export interface AddressLocation {
  wilaya: string;
  dayra: string;
  baladiya: string;
}

export type AddressLocationField = keyof AddressLocation;

interface AddressCascadeFieldsProps {
  value: AddressLocation;
  onChange: (field: AddressLocationField, value: string) => void;
  disabled?: boolean;
  errors?: Partial<Record<AddressLocationField, boolean>>;
  idPrefix?: string;
}

const sameText = (a: string, b: string) =>
  a.trim().toLowerCase() === b.trim().toLowerCase();

const AddressCascadeFields = ({
  value,
  onChange,
  disabled = false,
  errors = {},
  idPrefix = "addr",
}: AddressCascadeFieldsProps) => {
  const { t } = useTranslation();

  const wilayaNames = getWilayaNames();
  const dayras = getDayras(value.wilaya);
  const baladiyas = getBaladiyas(value.wilaya, value.dayra);

  // Fallback rule: a non-empty value that is NOT in the available option set
  // renders as a free-text Input instead of a Select, so saved legacy values
  // are preserved and still editable.
  const wilayaFallback =
    !!value.wilaya && !wilayaNames.some((n) => sameText(n, value.wilaya));
  const dayraFallback =
    !!value.dayra && !dayras.some((d) => sameText(d, value.dayra));
  const baladiyaFallback =
    !!value.baladiya && !baladiyas.some((b) => sameText(b, value.baladiya));

  const errorClass = (field: AddressLocationField) =>
    errors[field] ? "border-destructive" : "";

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Wilaya */}
      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-wilaya`}>{t("checkout.wilaya")} *</Label>
        {wilayaFallback ? (
          <Input
            id={`${idPrefix}-wilaya`}
            value={value.wilaya}
            onChange={(e) => onChange("wilaya", e.target.value)}
            placeholder={t("checkout.selectWilaya")}
            disabled={disabled}
            className={errorClass("wilaya")}
          />
        ) : (
          <Select
            value={value.wilaya}
            onValueChange={(v) => {
              onChange("wilaya", v);
              onChange("dayra", "");
              onChange("baladiya", "");
            }}
            disabled={disabled}
          >
            <SelectTrigger
              id={`${idPrefix}-wilaya`}
              className={`w-full ${errorClass("wilaya")}`}
            >
              <SelectValue placeholder={t("checkout.selectWilaya")} />
            </SelectTrigger>
            <SelectContent className="max-h-72">
              {wilayaNames.map((name) => (
                <SelectItem key={name} value={name}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        {errors.wilaya && (
          <p className="text-xs text-destructive">
            {t("myAccount.addresses.required")}
          </p>
        )}
      </div>

      {/* Dayra */}
      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-dayra`}>{t("checkout.dayra")} *</Label>
        {dayraFallback ? (
          <Input
            id={`${idPrefix}-dayra`}
            value={value.dayra}
            onChange={(e) => onChange("dayra", e.target.value)}
            placeholder={t("checkout.selectDayra")}
            disabled={disabled}
            className={errorClass("dayra")}
          />
        ) : (
          <Select
            value={value.dayra}
            onValueChange={(v) => {
              onChange("dayra", v);
              onChange("baladiya", "");
            }}
            disabled={disabled || dayras.length === 0}
          >
            <SelectTrigger
              id={`${idPrefix}-dayra`}
              className={`w-full ${errorClass("dayra")}`}
            >
              <SelectValue placeholder={t("checkout.selectDayra")} />
            </SelectTrigger>
            <SelectContent className="max-h-72">
              {dayras.map((name) => (
                <SelectItem key={name} value={name}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        {errors.dayra && (
          <p className="text-xs text-destructive">
            {t("myAccount.addresses.required")}
          </p>
        )}
      </div>

      {/* Baladiya */}
      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-baladiya`}>{t("checkout.baladiya")} *</Label>
        {baladiyaFallback ? (
          <Input
            id={`${idPrefix}-baladiya`}
            value={value.baladiya}
            onChange={(e) => onChange("baladiya", e.target.value)}
            placeholder={t("checkout.selectBaladiya")}
            disabled={disabled}
            className={errorClass("baladiya")}
          />
        ) : (
          <Select
            value={value.baladiya}
            onValueChange={(v) => onChange("baladiya", v)}
            disabled={disabled || baladiyas.length === 0}
          >
            <SelectTrigger
              id={`${idPrefix}-baladiya`}
              className={`w-full ${errorClass("baladiya")}`}
            >
              <SelectValue placeholder={t("checkout.selectBaladiya")} />
            </SelectTrigger>
            <SelectContent className="max-h-72">
              {baladiyas.map((name) => (
                <SelectItem key={name} value={name}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        {errors.baladiya && (
          <p className="text-xs text-destructive">
            {t("myAccount.addresses.required")}
          </p>
        )}
      </div>
    </div>
  );
};

export default AddressCascadeFields;
