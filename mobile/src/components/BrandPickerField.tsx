import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { getBrandsPage, searchBrandsPage } from "@minicollections/api";
import SearchField from "./SearchField";
import NeuInput from "./neu/NeuInput";
import { useLocale } from "../providers/LocaleProvider";
import { colors, spacing } from "@minicollections/theme";

type BrandOption = {
  id: number | string;
  name?: string;
};

type BrandPickerFieldProps = {
  brandId: string | null;
  brandName: string | null;
  useOtherBrand: boolean;
  customBrandName: string;
  onSelectCatalogBrand: (id: string, name: string) => void;
  onSelectOtherBrand: () => void;
  onCustomBrandNameChange: (value: string) => void;
  onClearBrand: () => void;
};

export default function BrandPickerField({
  brandId,
  brandName,
  useOtherBrand,
  customBrandName,
  onSelectCatalogBrand,
  onSelectOtherBrand,
  onCustomBrandNameChange,
  onClearBrand,
}: BrandPickerFieldProps) {
  const { t } = useLocale();
  const [pickerVisible, setPickerVisible] = useState(false);
  const [draftQuery, setDraftQuery] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [brands, setBrands] = useState<BrandOption[]>([]);
  const [loading, setLoading] = useState(false);

  const loadBrands = useCallback(async (keyword: string) => {
    setLoading(true);
    try {
      const data = keyword.trim()
        ? await searchBrandsPage(keyword.trim(), { page: 0, size: 40 })
        : await getBrandsPage({ page: 0, size: 40 });
      setBrands(Array.isArray(data?.content) ? data.content : []);
    } catch {
      setBrands([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const openPicker = () => {
    setDraftQuery("");
    setSearchKeyword("");
    setPickerVisible(true);
    void loadBrands("");
  };

  const runSearch = () => {
    const keyword = draftQuery.trim();
    setSearchKeyword(keyword);
    void loadBrands(keyword);
  };

  const displayLabel = useOtherBrand
    ? customBrandName.trim() || t("brandOtherName")
    : brandName ?? t("brand");

  return (
    <View>
      <Text style={styles.label}>{t("brand")}</Text>
      <View style={styles.selectorRow}>
        <Pressable accessibilityRole="button" onPress={openPicker} style={styles.selector}>
          <Text style={styles.selectorText} numberOfLines={1}>
            {brandId || useOtherBrand ? displayLabel : t("brand")}
          </Text>
        </Pressable>
        {(brandId || useOtherBrand) && (
          <Pressable accessibilityRole="button" onPress={onClearBrand} style={styles.clearBtn}>
            <Text style={styles.clear}>×</Text>
          </Pressable>
        )}
      </View>

      {useOtherBrand ? (
        <NeuInput
          label={t("brandOtherName")}
          value={customBrandName}
          onChangeText={onCustomBrandNameChange}
        />
      ) : null}

      <Modal visible={pickerVisible} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <Pressable style={styles.dismiss} onPress={() => setPickerVisible(false)} />
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>{t("brand")}</Text>
            <SearchField
              value={draftQuery}
              onChangeText={setDraftQuery}
              onSubmit={runSearch}
              onClear={draftQuery || searchKeyword ? () => {
                setDraftQuery("");
                setSearchKeyword("");
                void loadBrands("");
              } : undefined}
              placeholder={t("searchGroups")}
            />
            {loading ? (
              <ActivityIndicator color={colors.accent} style={styles.loading} />
            ) : (
              <FlatList
                data={brands}
                keyExtractor={(item) => String(item.id)}
                ListHeaderComponent={
                  <Pressable
                    style={styles.otherRow}
                    onPress={() => {
                      onSelectOtherBrand();
                      setPickerVisible(false);
                    }}
                  >
                    <Text style={styles.otherLabel}>{t("brandOtherName")}</Text>
                  </Pressable>
                }
                renderItem={({ item }) => (
                  <Pressable
                    style={[
                      styles.brandRow,
                      brandId === String(item.id) && styles.brandRowActive,
                    ]}
                    onPress={() => {
                      onSelectCatalogBrand(String(item.id), item.name ?? String(item.id));
                      setPickerVisible(false);
                    }}
                  >
                    <Text style={styles.brandName}>{item.name ?? item.id}</Text>
                  </Pressable>
                )}
              />
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: "600",
    marginBottom: spacing.xs,
  },
  selectorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  selector: {
    flex: 1,
    minHeight: 48,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.sl,
    paddingHorizontal: spacing.md,
    justifyContent: "center",
  },
  selectorText: {
    color: colors.text,
    fontSize: 16,
  },
  clearBtn: {
    width: 40,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  clear: {
    fontSize: 22,
    color: colors.textSecondary,
    paddingLeft: spacing.sm,
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  dismiss: { flex: 1 },
  modalSheet: {
    maxHeight: "70%",
    backgroundColor: colors.bg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.text,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  loading: {
    padding: spacing.lg,
  },
  otherRow: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.sl,
  },
  otherLabel: {
    color: colors.accent,
    fontWeight: "700",
  },
  brandRow: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  brandRowActive: {
    backgroundColor: colors.sl,
  },
  brandName: {
    color: colors.text,
    fontSize: 15,
  },
});
