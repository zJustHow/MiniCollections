import React, { useCallback } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
  type RefreshControlProps,
} from "react-native";
import { FlashList } from "@shopify/flash-list";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing } from "@minicollections/theme";

type ItemWithId = { id: number | string };

type Props<T extends ItemWithId> = {
  data: T[];
  reorderMode: boolean;
  sortEnabled: boolean;
  reordering: boolean;
  onMoveItem: (
    activeId: number | string,
    overId: number | string,
  ) => Promise<boolean | null>;
  moveFailedLabel: string;
  renderCard: (item: T) => React.ReactNode;
  listHeader: React.ReactElement | null;
  listEmpty: React.ReactElement | null;
  listFooter: React.ReactElement | null;
  refreshControl: React.ReactElement<RefreshControlProps>;
  onEndReached: () => void;
  numColumns?: number;
};

export default function SortableBrowseList<T extends ItemWithId>({
  data,
  reorderMode,
  sortEnabled,
  reordering,
  onMoveItem,
  moveFailedLabel,
  renderCard,
  listHeader,
  listEmpty,
  listFooter,
  refreshControl,
  onEndReached,
  numColumns = 2,
}: Props<T>) {
  const showReorderControls = reorderMode && sortEnabled;

  const moveItem = useCallback(
    async (itemId: number | string, direction: -1 | 1) => {
      const ids = data.map((item) => item.id);
      const index = ids.findIndex((id) => String(id) === String(itemId));
      const targetIndex = index + direction;
      if (index < 0 || targetIndex < 0 || targetIndex >= ids.length) return;

      const result = await onMoveItem(itemId, ids[targetIndex]!);
      if (result === false) {
        Alert.alert(moveFailedLabel);
      }
    },
    [data, moveFailedLabel, onMoveItem],
  );

  if (showReorderControls) {
    return (
      <FlashList
        data={data}
        numColumns={1}
        keyExtractor={(item) => String(item.id)}
        ListHeaderComponent={listHeader}
        ListEmptyComponent={listEmpty}
        ListFooterComponent={
          <>
            {reordering ? (
              <View style={styles.reorderSpinner}>
                <ActivityIndicator color={colors.accent} />
              </View>
            ) : null}
            {listFooter}
          </>
        }
        refreshControl={refreshControl}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.4}
        renderItem={({ item, index }) => (
          <View style={styles.reorderRow}>
            <View style={styles.reorderCard}>{renderCard(item)}</View>
            <View style={styles.reorderActions}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Move up"
                disabled={index === 0 || reordering}
                onPress={() => void moveItem(item.id, -1)}
                style={[styles.moveBtn, index === 0 && styles.moveBtnDisabled]}
              >
                <Ionicons
                  name="chevron-up"
                  size={22}
                  color={index === 0 ? colors.border : colors.accent}
                />
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Move down"
                disabled={index === data.length - 1 || reordering}
                onPress={() => void moveItem(item.id, 1)}
                style={[
                  styles.moveBtn,
                  index === data.length - 1 && styles.moveBtnDisabled,
                ]}
              >
                <Ionicons
                  name="chevron-down"
                  size={22}
                  color={
                    index === data.length - 1 ? colors.border : colors.accent
                  }
                />
              </Pressable>
            </View>
          </View>
        )}
      />
    );
  }

  return (
    <FlashList
      data={data}
      numColumns={numColumns}
      keyExtractor={(item) => String(item.id)}
      ListHeaderComponent={listHeader}
      ListEmptyComponent={listEmpty}
      ListFooterComponent={listFooter}
      refreshControl={refreshControl}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.4}
      renderItem={({ item }) => (
        <View style={numColumns > 1 ? styles.cell : undefined}>{renderCard(item)}</View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  cell: {
    flex: 1,
  },
  reorderRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    gap: spacing.sm,
  },
  reorderCard: {
    flex: 1,
  },
  reorderActions: {
    gap: spacing.xs,
  },
  moveBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.sl,
  },
  moveBtnDisabled: {
    opacity: 0.5,
  },
  reorderSpinner: {
    paddingVertical: spacing.md,
    alignItems: "center",
  },
});
