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
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { resolveMediaUrl } from "@minicollections/api";
import SearchField from "./SearchField";
import { useLocale } from "../providers/LocaleProvider";
import { colors, spacing } from "@minicollections/theme";
import useRemoteModelSelectSearch from "../hooks/useRemoteModelSelectSearch";

export type CatalogModelOption = {
  id: number | string;
  name?: string;
  image_url?: string | null;
};

type ModelPickerFieldProps = {
  selectedModel: CatalogModelOption | null;
  onSelectModel: (model: CatalogModelOption | null) => void;
};

export default function ModelPickerField({
  selectedModel,
  onSelectModel,
}: ModelPickerFieldProps) {
  const { t } = useLocale();
  const [pickerVisible, setPickerVisible] = useState(false);
  const [draftQuery, setDraftQuery] = useState("");
  const { results, loading, onSearch, setResults } = useRemoteModelSelectSearch({
    onError: () => {},
  });

  const openPicker = () => {
    setDraftQuery("");
    setResults([]);
    setPickerVisible(true);
  };

  const runSearch = useCallback(() => {
    onSearch(draftQuery);
  }, [draftQuery, onSearch]);

  const displayLabel = selectedModel?.name?.trim() || t("modelSearchPlaceholder");

  return (
    <>
      <Text style={styles.label}>{t("model")}</Text>
      <Pressable accessibilityRole="button" onPress={openPicker} style={styles.field}>
        <Text style={styles.fieldText} numberOfLines={1}>
          {displayLabel}
        </Text>
        {selectedModel ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t("cancel")}
            hitSlop={8}
            onPress={(event) => {
              event.stopPropagation();
              onSelectModel(null);
            }}
          >
            <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
          </Pressable>
        ) : null}
      </Pressable>

      <Modal visible={pickerVisible} animationType="slide" onRequestClose={() => setPickerVisible(false)}>
        <View style={styles.modal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{t("model")}</Text>
            <Pressable onPress={() => setPickerVisible(false)}>
              <Text style={styles.close}>{t("cancel")}</Text>
            </Pressable>
          </View>
          <SearchField
            value={draftQuery}
            onChangeText={setDraftQuery}
            onSubmit={runSearch}
            placeholder={t("modelSearchPlaceholder")}
          />
          {loading ? (
            <ActivityIndicator color={colors.accent} style={styles.spinner} />
          ) : (
            <FlatList
              data={results}
              keyExtractor={(item) => String(item.id)}
              keyboardShouldPersistTaps="handled"
              ListEmptyComponent={
                draftQuery.trim() ? (
                  <Text style={styles.empty}>{t("noSearchResults")}</Text>
                ) : null
              }
              renderItem={({ item }) => {
                const imageUri = resolveMediaUrl(item.image_url ?? undefined);
                return (
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => {
                      onSelectModel(item);
                      setPickerVisible(false);
                    }}
                    style={styles.row}
                  >
                    <View style={styles.thumbWell}>
                      {imageUri ? (
                        <Image source={{ uri: imageUri }} style={styles.thumb} contentFit="contain" />
                      ) : (
                        <View style={styles.thumbPlaceholder} />
                      )}
                    </View>
                    <Text style={styles.rowName} numberOfLines={2}>
                      {item.name ?? "—"}
                    </Text>
                  </Pressable>
                );
              }}
            />
          )}
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  label: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: "600",
    marginBottom: spacing.xs,
  },
  field: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.sl,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  fieldText: {
    flex: 1,
    color: colors.text,
    fontSize: 15,
  },
  modal: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingTop: spacing.xl,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.text,
  },
  close: {
    color: colors.accent,
    fontWeight: "700",
  },
  spinner: {
    marginTop: spacing.xl,
  },
  empty: {
    textAlign: "center",
    color: colors.textSecondary,
    padding: spacing.xl,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  thumbWell: {
    width: 48,
    height: 48,
    backgroundColor: colors.sl,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  thumb: {
    width: "88%",
    height: "88%",
  },
  thumbPlaceholder: {
    width: "50%",
    height: "50%",
    backgroundColor: colors.border,
  },
  rowName: {
    flex: 1,
    color: colors.text,
    fontSize: 15,
    fontWeight: "600",
  },
});
