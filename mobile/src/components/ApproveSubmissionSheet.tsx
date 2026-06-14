import React, { useEffect, useMemo, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  approveSubmission,
  getCategories,
  getScales,
  getSeriesByBrandId,
} from "@minicollections/api";
import type { AdminSubmissionItem } from "./AdminSubmissionDetailSheet";
import BrandPickerField from "./BrandPickerField";
import OptionPickerField, { type PickerOption } from "./OptionPickerField";
import NeuButton from "./neu/NeuButton";
import NeuInput from "./neu/NeuInput";
import { useLocale } from "../providers/LocaleProvider";
import { colors, spacing } from "@minicollections/theme";

type ApproveSubmissionSheetProps = {
  visible: boolean;
  submission: AdminSubmissionItem | null;
  onClose: () => void;
  onApproved: () => void;
};

type SeriesRow = {
  id?: number | string;
  name?: string;
  name_en?: string;
  name_zh?: string;
};

function pickSeriesName(row: SeriesRow, locale: string) {
  const en = row.name_en ?? row.name ?? "";
  const zh = row.name_zh ?? row.name ?? "";
  return locale === "zh-CN" ? zh || en : en || zh;
}

function toOptionalNumber(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
}

export default function ApproveSubmissionSheet({
  visible,
  submission,
  onClose,
  onApproved,
}: ApproveSubmissionSheetProps) {
  const { t, locale } = useLocale();
  const [brandId, setBrandId] = useState<string | null>(null);
  const [brandName, setBrandName] = useState<string | null>(null);
  const [useOtherBrand, setUseOtherBrand] = useState(false);
  const [customBrandName, setCustomBrandName] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [nameZh, setNameZh] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [scaleId, setScaleId] = useState<string | null>(null);
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [seriesId, setSeriesId] = useState<string | null>(null);
  const [releaseDate, setReleaseDate] = useState("");
  const [releasePriceCny, setReleasePriceCny] = useState("");
  const [releasePriceUsd, setReleasePriceUsd] = useState("");
  const [scaleOptions, setScaleOptions] = useState<PickerOption[]>([]);
  const [categoryOptions, setCategoryOptions] = useState<PickerOption[]>([]);
  const [seriesOptions, setSeriesOptions] = useState<PickerOption[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!visible || !submission) return;
    const hasBrandId = submission.brand_id != null && submission.brand_id !== "";
    setBrandId(hasBrandId ? String(submission.brand_id) : null);
    setBrandName(submission.brand_name ?? null);
    setUseOtherBrand(!hasBrandId && Boolean(submission.custom_brand_name));
    setCustomBrandName(submission.custom_brand_name ?? "");
    setNameEn(submission.name_en ?? "");
    setNameZh(submission.name_zh ?? "");
    setImageUrl(submission.image_url ?? "");
    setScaleId(submission.scale_id != null ? String(submission.scale_id) : null);
    setCategoryId(submission.category_id != null ? String(submission.category_id) : null);
    setSeriesId(submission.series_id != null ? String(submission.series_id) : null);
    setReleaseDate(submission.release_date ?? "");
    setReleasePriceCny(
      submission.release_price_cny != null ? String(submission.release_price_cny) : "",
    );
    setReleasePriceUsd(
      submission.release_price_usd != null ? String(submission.release_price_usd) : "",
    );
    setError(null);

    void getCategories()
      .then((rows) => {
        const list = Array.isArray(rows) ? rows : [];
        setCategoryOptions(
          list.map((c: { id: number | string; name?: string }) => ({
            id: String(c.id),
            label: c.name ?? String(c.id),
          })),
        );
      })
      .catch(() => setCategoryOptions([]));

    void getScales()
      .then((rows) => {
        const list = Array.isArray(rows) ? rows : [];
        setScaleOptions(
          list.map((s: { id: number | string; code?: string }) => ({
            id: String(s.id),
            label: s.code ?? String(s.id),
          })),
        );
      })
      .catch(() => setScaleOptions([]));
  }, [visible, submission]);

  useEffect(() => {
    if (!visible || !brandId || useOtherBrand) {
      setSeriesOptions([]);
      return;
    }
    void getSeriesByBrandId(brandId)
      .then((rows) => {
        const list = Array.isArray(rows) ? rows : [];
        setSeriesOptions(
          list.map((s: SeriesRow) => ({
            id: String(s.id),
            label: pickSeriesName(s, locale),
          })),
        );
      })
      .catch(() => setSeriesOptions([]));
  }, [visible, brandId, useOtherBrand, locale]);

  const canSubmit = useMemo(
    () => Boolean(nameEn.trim()) && Boolean(brandId),
    [brandId, nameEn],
  );

  const handleSubmit = async () => {
    if (!submission?.id) return;
    if (!nameEn.trim()) {
      setError(t("nameRequired"));
      return;
    }
    if (!brandId) {
      setError(t("brandRequired"));
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await approveSubmission(submission.id, {
        brand_id: Number(brandId),
        name_en: nameEn.trim(),
        name_zh: nameZh.trim() || null,
        image_url: imageUrl.trim() || null,
        release_price_cny: toOptionalNumber(releasePriceCny),
        release_price_usd: toOptionalNumber(releasePriceUsd),
        release_date: releaseDate.trim() || null,
        series_id: seriesId ? Number(seriesId) : null,
        category_id: categoryId ? Number(categoryId) : null,
        scale_id: scaleId ? Number(scaleId) : null,
        admin_note: null,
      });
      onApproved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("failedToApprove"));
    } finally {
      setSubmitting(false);
    }
  };

  if (!submission) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <Pressable style={styles.dismissArea} onPress={onClose} />
        <View style={styles.sheet}>
          <Text style={styles.title}>{t("approveTitle")}</Text>
          <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
            <BrandPickerField
              brandId={brandId}
              brandName={brandName}
              useOtherBrand={useOtherBrand}
              customBrandName={customBrandName}
              onSelectCatalogBrand={(id, name) => {
                setBrandId(id);
                setBrandName(name);
                setUseOtherBrand(false);
                setCustomBrandName("");
                setSeriesId(null);
              }}
              onSelectOtherBrand={() => {
                setBrandId(null);
                setBrandName(null);
                setUseOtherBrand(true);
                setSeriesId(null);
              }}
              onCustomBrandNameChange={setCustomBrandName}
              onClearBrand={() => {
                setBrandId(null);
                setBrandName(null);
                setUseOtherBrand(false);
                setCustomBrandName("");
                setSeriesId(null);
              }}
            />
            <NeuInput label={t("nameEn")} value={nameEn} onChangeText={setNameEn} />
            <NeuInput label={t("nameZh")} value={nameZh} onChangeText={setNameZh} />
            <NeuInput
              label={t("image")}
              value={imageUrl}
              onChangeText={setImageUrl}
              autoCapitalize="none"
            />
            <OptionPickerField
              label={t("scale")}
              value={scaleId}
              options={scaleOptions}
              placeholder={t("scale")}
              onChange={(id) => setScaleId(id)}
            />
            <OptionPickerField
              label={t("category")}
              value={categoryId}
              options={categoryOptions}
              placeholder={t("category")}
              onChange={(id) => setCategoryId(id)}
            />
            <OptionPickerField
              label={t("series")}
              value={seriesId}
              options={seriesOptions}
              placeholder={t("selectSeries")}
              disabled={!brandId || useOtherBrand}
              onChange={(id) => setSeriesId(id)}
            />
            <NeuInput
              label={t("releaseDate")}
              value={releaseDate}
              onChangeText={setReleaseDate}
              placeholder="YYYY-MM-DD"
              autoCapitalize="none"
            />
            <NeuInput
              label={t("priceCNY")}
              value={releasePriceCny}
              onChangeText={setReleasePriceCny}
              keyboardType="decimal-pad"
            />
            <NeuInput
              label={t("priceUSD")}
              value={releasePriceUsd}
              onChangeText={setReleasePriceUsd}
              keyboardType="decimal-pad"
            />
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <NeuButton
              title={t("approveSubmission")}
              loading={submitting}
              disabled={!canSubmit}
              onPress={() => void handleSubmit()}
              style={styles.submit}
            />
            <NeuButton title={t("cancel")} variant="ghost" onPress={onClose} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  dismissArea: { flex: 1 },
  sheet: {
    maxHeight: "92%",
    backgroundColor: colors.bg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.text,
    marginBottom: spacing.md,
  },
  content: {
    gap: spacing.sm,
    paddingBottom: spacing.lg,
  },
  error: {
    color: colors.danger,
    textAlign: "center",
  },
  submit: {
    marginTop: spacing.md,
  },
});
