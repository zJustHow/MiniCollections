import React, { useEffect, useMemo, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import {
  adminCreateBrandObject,
  getCategories,
  getScales,
  getSeriesByBrandId,
  resolveMediaUrl,
  uploadImage,
} from "@minicollections/api";
import NeuButton from "./NeuButton";
import NeuInput from "./NeuFormControl/NeuInput";
import GroovedImage from "./GroovedImage";
import OptionPickerField, { type PickerOption } from "./OptionPickerField";
import { useLocale } from "../providers/LocaleProvider";
import { pickLocalizedField } from "../utils/displayLocale";
import { colors, spacing } from "@minicollections/theme";
import { neuText } from "../theme/neuText";

type BrandObjectModalProps = {
  visible: boolean;
  brandId: string;
  onClose: () => void;
  onCreated: () => void;
};

type PickedImage = {
  uri: string;
  name?: string;
  type?: string;
};

type SeriesRow = Record<string, unknown> & { id: number | string };

function pickSeriesName(row: SeriesRow, locale: string) {
  return (
    pickLocalizedField(row, { enKey: "name_en", zhKey: "name_zh", singleKey: "name" }, locale) ??
    String(row.id)
  );
}

export default function BrandObjectModal({
  visible,
  brandId,
  onClose,
  onCreated,
}: BrandObjectModalProps) {
  const { t, locale } = useLocale();
  const [nameEn, setNameEn] = useState("");
  const [nameZh, setNameZh] = useState("");
  const [scaleId, setScaleId] = useState<string | null>(null);
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [seriesId, setSeriesId] = useState<string | null>(null);
  const [releaseDate, setReleaseDate] = useState("");
  const [releasePriceCny, setReleasePriceCny] = useState("");
  const [releasePriceUsd, setReleasePriceUsd] = useState("");
  const [imageSource, setImageSource] = useState("");
  const [pickedImage, setPickedImage] = useState<PickedImage | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [scaleOptions, setScaleOptions] = useState<PickerOption[]>([]);
  const [categoryOptions, setCategoryOptions] = useState<PickerOption[]>([]);
  const [seriesOptions, setSeriesOptions] = useState<PickerOption[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!visible) return;
    setNameEn("");
    setNameZh("");
    setScaleId(null);
    setCategoryId(null);
    setSeriesId(null);
    setReleaseDate("");
    setReleasePriceCny("");
    setReleasePriceUsd("");
    setImageSource("");
    setPickedImage(null);
    setUploadedUrl(null);
    setError(null);

    void Promise.all([getScales(), getCategories(), getSeriesByBrandId(brandId)])
      .then(([scales, categories, series]) => {
        setScaleOptions(
          (Array.isArray(scales) ? scales : []).map((row: { id: number | string; code?: string }) => ({
            id: String(row.id),
            label: row.code ?? String(row.id),
          })),
        );
        setCategoryOptions(
          (Array.isArray(categories) ? categories : []).map(
            (row: { id: number | string; name?: string }) => ({
              id: String(row.id),
              label: row.name ?? String(row.id),
            }),
          ),
        );
        setSeriesOptions(
          (Array.isArray(series) ? series : []).map((row: SeriesRow) => ({
            id: String(row.id),
            label: pickSeriesName(row, locale),
          })),
        );
      })
      .catch(() => {
        setScaleOptions([]);
        setCategoryOptions([]);
        setSeriesOptions([]);
      });
  }, [brandId, locale, visible]);

  const handleClose = () => {
    onClose();
  };

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setError(t("uploadFailed"));
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.85,
    });

    if (result.canceled || !result.assets[0]) return;

    const asset = result.assets[0];
    setPickedImage({
      uri: asset.uri,
      name: asset.fileName ?? "model.jpg",
      type: asset.mimeType ?? "image/jpeg",
    });
    setUploadedUrl(null);
  };

  const previewUri = useMemo(
    () => pickedImage?.uri ?? (uploadedUrl ? resolveMediaUrl(uploadedUrl) : undefined),
    [pickedImage, uploadedUrl],
  );

  const handleCreate = async () => {
    const trimmedEn = nameEn.trim();
    if (!trimmedEn) {
      setError(t("nameRequired"));
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      let imageUrl = uploadedUrl;
      if (pickedImage && !imageUrl) {
        imageUrl = await uploadImage(pickedImage);
        setUploadedUrl(imageUrl);
      }

      await adminCreateBrandObject(brandId, {
        name_en: trimmedEn,
        name_zh: nameZh.trim() || null,
        image_url: imageUrl ?? null,
        image_source: imageSource.trim() || null,
        scale_id: scaleId ? Number(scaleId) : null,
        category_id: categoryId ? Number(categoryId) : null,
        series_id: seriesId ? Number(seriesId) : null,
        release_date: releaseDate.trim() || null,
        release_price_cny: releasePriceCny.trim() ? Number(releasePriceCny) : null,
        release_price_usd: releasePriceUsd.trim() ? Number(releasePriceUsd) : null,
      });

      onCreated();
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("failedToCreateBrandObject"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
      <View style={styles.backdrop}>
        <Pressable style={styles.dismissArea} onPress={handleClose} />
        <View style={styles.sheet}>
          <Text style={styles.title}>{t("addBrandObject")}</Text>
          <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
            <NeuInput label={t("nameEn")} value={nameEn} onChangeText={setNameEn} />
            <NeuInput label={t("nameZh")} value={nameZh} onChangeText={setNameZh} />
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
              onChange={(id) => setSeriesId(id)}
            />
            <NeuInput
              label={t("releaseDate")}
              value={releaseDate}
              onChangeText={setReleaseDate}
              placeholder="YYYY-MM-DD"
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

            <Text style={styles.coverLabel}>{t("image")}</Text>
            <GroovedImage uri={previewUri} variant="card" />
            <NeuButton title={t("image")} variant="ghost" onPress={() => void pickImage()} />
            <NeuInput
              label={t("imageSource")}
              value={imageSource}
              onChangeText={setImageSource}
              placeholder={t("imageSource")}
            />

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <NeuButton
              title={t("addBrandObject")}
              loading={submitting}
              onPress={() => void handleCreate()}
              style={styles.submit}
            />
            <NeuButton title={t("cancel")} variant="ghost" onPress={handleClose} />
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
    maxHeight: "90%",
    backgroundColor: colors.bg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  title: {
    ...neuText.modalTitle,
    marginBottom: spacing.md,
  },
  content: {
    gap: spacing.sm,
    paddingBottom: spacing.lg,
  },
  coverLabel: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: "600",
  },
  error: {
    color: colors.danger,
    textAlign: "center",
  },
  submit: {
    marginTop: spacing.md,
  },
});
