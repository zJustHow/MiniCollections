import { useEffect } from "react";
import { NeuSelect } from "./NeuFormControl";
import useRemoteBrandSelect from "../hooks/useRemoteBrandSelect";
import { useLocale } from "../LocaleContext";

export const OTHER_BRAND = "__OTHER__";

export default function BrandSelectField({
  value,
  onChange,
  includeOther = false,
  enabled = true,
  seedBrand = null,
  placeholder,
  ...selectProps
}) {
  const { t } = useLocale();
  const { options, loading, onSearch, ensureBrand, seedBrand: seedOption } =
    useRemoteBrandSelect({ enabled });

  useEffect(() => {
    if (seedBrand?.id) seedOption(seedBrand);
  }, [seedBrand, seedOption]);

  useEffect(() => {
    if (value != null && value !== OTHER_BRAND) ensureBrand(value);
  }, [value, ensureBrand]);

  return (
    <NeuSelect
      showSearch
      filterOption={false}
      onSearch={onSearch}
      loading={loading}
      value={value}
      onChange={onChange}
      placeholder={placeholder ?? t("brand")}
      {...selectProps}
    >
      {options.map((b) => (
        <NeuSelect.Option key={b.id} value={b.id}>
          {b.name}
        </NeuSelect.Option>
      ))}
      {includeOther && (
        <NeuSelect.Option key={OTHER_BRAND} value={OTHER_BRAND}>
          {t("brandOther")}
        </NeuSelect.Option>
      )}
    </NeuSelect>
  );
}
