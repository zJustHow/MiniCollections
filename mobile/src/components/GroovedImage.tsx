import React, { useCallback, useMemo, useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type LayoutChangeEvent,
  type ViewStyle,
} from "react-native";
import { Image, type ImageContentFit } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import {
  colors,
  neuBoxShadow,
  neuImageLayout,
  neuLogoShadowLayers,
} from "@minicollections/theme";
import { neuText } from "../theme/neuText";
import {
  computeBrandLogoSlotSize,
  grooveFrameContentSize,
  useAdaptiveImageFrame,
} from "./useAdaptiveImageFrame";

export type GroovedImageVariant =
  | "card"
  | "brand"
  | "detail"
  | "thumb"
  | "cover"
  | "avatar";

type GroovedImageProps = {
  /** Alias for web `imageUrl` prop */
  imageUrl?: string | null;
  uri?: string | null;
  aspectRatio?: number;
  contentFit?: ImageContentFit;
  variant?: GroovedImageVariant;
  style?: ViewStyle;
  onPress?: () => void;
  placeholderLabel?: string;
  /** Icon size in px — mirrors web `placeholderSize` on GroovedImage */
  placeholderSize?: number;
  add?: boolean;
  accessibilityLabel?: string;
};

const PLACEHOLDER_ICON = {
  tileMin: 24,
  tileMax: 48,
  tileScale: 0.22,
  thumb: 24,
  detail: 56,
} as const;

function resolvePlaceholderIconSize(
  variant: GroovedImageVariant,
  frameWidth: number | null,
  override?: number,
): number {
  if (override != null) return override;
  if (variant === "thumb") return PLACEHOLDER_ICON.thumb;
  if (variant === "detail") return PLACEHOLDER_ICON.detail;
  if (frameWidth != null && frameWidth > 0) {
    return Math.min(
      PLACEHOLDER_ICON.tileMax,
      Math.max(PLACEHOLDER_ICON.tileMin, frameWidth * PLACEHOLDER_ICON.tileScale),
    );
  }
  return PLACEHOLDER_ICON.tileMax;
}

const VARIANTS: Record<
  GroovedImageVariant,
  {
    wellInset: number;
    groovePad: number;
    aspectRatio: number;
    contentFit: ImageContentFit;
    coverMode: boolean;
    fixedGroove: boolean;
    logoShadow?: boolean;
    circular?: boolean;
    insetShadow: string;
  }
> = {
  card: {
    wellInset: neuImageLayout.wellInset,
    groovePad: neuImageLayout.groovePad,
    aspectRatio: neuImageLayout.detailAspectRatio,
    contentFit: "contain",
    coverMode: false,
    fixedGroove: false,
    insetShadow: neuBoxShadow.inset,
  },
  brand: {
    wellInset: neuImageLayout.wellInset,
    groovePad: neuImageLayout.groovePad,
    aspectRatio: neuImageLayout.detailAspectRatio,
    contentFit: "contain",
    coverMode: false,
    fixedGroove: true,
    logoShadow: true,
    insetShadow: neuBoxShadow.inset,
  },
  detail: {
    wellInset: neuImageLayout.wellInset,
    groovePad: neuImageLayout.groovePad,
    aspectRatio: neuImageLayout.detailAspectRatio,
    contentFit: "contain",
    coverMode: false,
    fixedGroove: false,
    insetShadow: neuBoxShadow.inset,
  },
  thumb: {
    wellInset: neuImageLayout.wellInsetThumb,
    groovePad: neuImageLayout.groovePadThumb,
    aspectRatio: 1,
    contentFit: "contain",
    coverMode: false,
    fixedGroove: false,
    insetShadow: neuBoxShadow.inset,
  },
  cover: {
    wellInset: neuImageLayout.wellInset,
    groovePad: neuImageLayout.groovePad,
    aspectRatio: neuImageLayout.coverAspectRatio,
    contentFit: "cover",
    coverMode: true,
    fixedGroove: true,
    insetShadow: neuBoxShadow.inset,
  },
  avatar: {
    wellInset: 0,
    groovePad: 0,
    aspectRatio: 1,
    contentFit: "cover",
    coverMode: true,
    fixedGroove: true,
    circular: true,
    insetShadow: neuBoxShadow.insetAvatar,
  },
};

function BrandLogoImage({
  uri,
  fit,
  slotSize,
  onLoad,
  onError,
}: {
  uri: string;
  fit: ImageContentFit;
  slotSize: { width: number; height: number } | null;
  onLoad: (width: number, height: number) => void;
  onError: () => void;
}) {
  const slotStyle = useMemo(
    () => (slotSize ? { width: slotSize.width, height: slotSize.height } : styles.logoSlotPending),
    [slotSize],
  );

  return (
    <View style={[styles.logoSlot, slotStyle]}>
      {neuLogoShadowLayers.map((layer, index) => (
        <Image
          key={`logo-shadow-${index}`}
          source={{ uri }}
          style={[
            styles.logoShadowLayer,
            {
              opacity: layer.opacity,
              transform: [
                { translateX: layer.offsetX },
                { translateY: layer.offsetY },
              ],
            },
          ]}
          contentFit={fit}
          tintColor="#000000"
          pointerEvents="none"
        />
      ))}
      <Image
        source={{ uri }}
        style={styles.logoImage}
        contentFit={fit}
        transition={200}
        onLoad={(event) => {
          const { width, height } = event.source;
          onLoad(width, height);
        }}
        onError={onError}
      />
    </View>
  );
}

function ImagePlaceholder({
  add = false,
  placeholderLabel,
  iconSize,
}: {
  add?: boolean;
  placeholderLabel?: string;
  iconSize: number;
}) {
  if (add) {
    return <Ionicons name="add" size={iconSize} color={colors.textSecondary} />;
  }
  if (placeholderLabel) {
    return <Text style={styles.placeholderText}>{placeholderLabel}</Text>;
  }
  return (
    <Ionicons name="image-outline" size={iconSize} color={colors.textSecondary} />
  );
}

function GroovedImageFrame({
  variant,
  config,
  resolvedUri,
  fit,
  placeholderLabel,
  placeholderSize,
  add = false,
  frameSize,
  imageDisplayable,
  onImageLoad,
  onImageError,
  fixedGroove,
}: {
  variant: GroovedImageVariant;
  config: (typeof VARIANTS)[GroovedImageVariant];
  resolvedUri?: string;
  fit: ImageContentFit;
  placeholderLabel?: string;
  placeholderSize?: number;
  add?: boolean;
  frameSize: { width: number; height: number } | null;
  imageDisplayable: boolean;
  onImageLoad: (width: number, height: number) => void;
  onImageError: () => void;
  fixedGroove: boolean;
}) {
  const [frameLayout, setFrameLayout] = useState<{ width: number; height: number } | null>(
    null,
  );

  const onFrameLayout = useCallback((event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    if (width > 0 && height > 0) {
      setFrameLayout({ width, height });
    }
  }, []);

  const brandLogoSlotSize = useMemo(() => {
    if (!config.logoShadow || !frameLayout) return null;
    const content = grooveFrameContentSize(
      frameLayout.width,
      frameLayout.height,
      config.groovePad,
    );
    if (!content) return null;
    return computeBrandLogoSlotSize(content.width, content.height);
  }, [config.groovePad, config.logoShadow, frameLayout]);

  const hasUri = Boolean(resolvedUri);
  const awaitingAdaptiveSize =
    !fixedGroove && hasUri && (!imageDisplayable || !frameSize);
  const useFillFrame = fixedGroove || !hasUri || awaitingAdaptiveSize;

  const frameStyle = useFillFrame
    ? [
        styles.frameFill,
        {
          top: config.wellInset,
          left: config.wellInset,
          right: config.wellInset,
          bottom: config.wellInset,
          padding: config.groovePad,
        },
      ]
    : [
        styles.frameAdaptive,
        {
          width: frameSize?.width,
          height: frameSize?.height,
          padding: config.groovePad,
        },
      ];

  const placeholderIconSize = resolvePlaceholderIconSize(
    variant,
    frameLayout?.width ?? null,
    placeholderSize,
  );

  return (
    <View style={frameStyle} onLayout={onFrameLayout}>
      {!hasUri ? (
        <ImagePlaceholder
          add={add}
          placeholderLabel={placeholderLabel}
          iconSize={placeholderIconSize}
        />
      ) : config.logoShadow ? (
        <BrandLogoImage
          uri={resolvedUri!}
          fit={fit}
          slotSize={brandLogoSlotSize}
          onLoad={onImageLoad}
          onError={onImageError}
        />
      ) : (
        <Image
          source={{ uri: resolvedUri }}
          style={styles.image}
          contentFit={fit}
          transition={200}
          onLoad={(event) => {
            const { width, height } = event.source;
            onImageLoad(width, height);
          }}
          onError={onImageError}
        />
      )}
      <View
        style={[styles.groove, { boxShadow: config.insetShadow }]}
        pointerEvents="none"
      />
    </View>
  );
}

export default function GroovedImage({
  imageUrl,
  uri,
  aspectRatio,
  contentFit,
  variant = "card",
  style,
  onPress,
  placeholderLabel,
  placeholderSize,
  add = false,
  accessibilityLabel,
}: GroovedImageProps) {
  const resolvedUri = imageUrl ?? uri ?? undefined;
  const config = VARIANTS[variant];
  const ratio = aspectRatio ?? config.aspectRatio;
  const fit = contentFit ?? config.contentFit;
  const isAvatar = variant === "avatar";
  const useFixedGroove = config.fixedGroove || add;

  const { onWellLayout, frameSize, imageDisplayable, onImageLoad, onImageError } =
    useAdaptiveImageFrame(resolvedUri, {
      coverMode: config.coverMode,
      adaptiveGroove: !useFixedGroove,
      wellInset: config.wellInset,
      groovePad: config.groovePad,
    });

  const body = (
    <View
      style={[
        styles.well,
        { aspectRatio: ratio },
        isAvatar && styles.wellCircular,
        style,
      ]}
    >
      <View
        style={[styles.slot, !isAvatar && !config.fixedGroove && styles.slotCentered]}
        onLayout={isAvatar ? undefined : onWellLayout}
      >
        {isAvatar ? (
          <>
            {resolvedUri ? (
              <Image
                source={{ uri: resolvedUri }}
                style={styles.avatarImage}
                contentFit={fit}
                transition={200}
              />
            ) : (
              <View style={styles.avatarPlaceholder}>
                {placeholderLabel ? (
                  <Text
                    style={[styles.placeholderText, styles.avatarPlaceholderText]}
                  >
                    {placeholderLabel}
                  </Text>
                ) : null}
              </View>
            )}
            <View
              style={[
                styles.groove,
                styles.grooveCircular,
                { boxShadow: config.insetShadow },
              ]}
              pointerEvents="none"
            />
          </>
        ) : (
          <GroovedImageFrame
            variant={variant}
            config={config}
            resolvedUri={resolvedUri}
            fit={fit}
            placeholderLabel={placeholderLabel}
            placeholderSize={placeholderSize}
            add={add}
            frameSize={frameSize}
            imageDisplayable={imageDisplayable}
            onImageLoad={onImageLoad}
            onImageError={onImageError}
            fixedGroove={useFixedGroove}
          />
        )}
      </View>
    </View>
  );

  if (!onPress) return body;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      disabled={!resolvedUri && !onPress}
      onPress={onPress}
    >
      {body}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  well: {
    width: "100%",
    overflow: "hidden",
    backgroundColor: colors.bg,
  },
  wellCircular: {
    borderRadius: 9999,
  },
  slot: {
    ...StyleSheet.absoluteFill,
  },
  slotCentered: {
    alignItems: "center",
    justifyContent: "center",
  },
  frameFill: {
    position: "absolute",
    backgroundColor: colors.bg,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  frameAdaptive: {
    backgroundColor: colors.bg,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  groove: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "transparent",
    zIndex: 2,
  },
  grooveCircular: {
    borderRadius: 9999,
  },
  image: {
    flex: 1,
    alignSelf: "stretch",
    width: "100%",
    height: "100%",
  },
  logoSlot: {
    alignItems: "center",
    justifyContent: "center",
  },
  logoSlotPending: {
    width: "68%",
    aspectRatio: 1,
  },
  logoShadowLayer: {
    ...StyleSheet.absoluteFill,
  },
  logoImage: {
    width: "100%",
    height: "100%",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
    borderRadius: 9999,
  },
  avatarPlaceholder: {
    ...StyleSheet.absoluteFill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.bg,
    borderRadius: 9999,
  },
  avatarPlaceholderText: {
    ...neuText.placeholderHero,
  },
  placeholderText: {
    ...neuText.bodySecondary,
  },
});
