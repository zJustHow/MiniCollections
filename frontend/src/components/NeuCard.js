import { memo } from "react";
import PlusOutlined from "@ant-design/icons/es/icons/PlusOutlined.js";
import GroovedImage from "./GroovedImage";

const IMAGE_SLOT = {
  tile: {
    wrapClass: "neu-card-cover",
    wellClass: (logoShadow) =>
      logoShadow
        ? "neu-card-image-well neu-card-image-well--logo"
        : "neu-card-image-well",
    placeholderSize: 36,
    showNameplate: true,
  },
  upload: {
    wrapClass: "neu-card-cover",
    wellClass: (logoShadow) =>
      logoShadow
        ? "neu-card-image-well neu-card-image-well--logo"
        : "neu-card-image-well",
    placeholderSize: 36,
    showNameplate: false,
  },
  thumb: {
    wrapClass: "neu-card-thumb",
    wellClass: () => "neu-card-image-well neu-card-thumb-well",
    wellInset: 3,
    groovePad: 2,
    showNameplate: false,
  },
};

export function buildNeuCardClassName({
  variant = "tile",
  className = "",
} = {}) {
  return [
    "neu-card",
    variant === "tile" && "neu-card--tile",
    variant === "row" && "neu-card--row",
    variant === "upload" && "neu-card--upload",
    className,
  ]
    .filter(Boolean)
    .join(" ");
}

function resolveImageSlot(variant) {
  if (variant === "row") return "thumb";
  if (variant === "upload") return "upload";
  return "tile";
}

function buildNameplateClassName(nameplateVariant) {
  return [
    "neu-nameplate",
    nameplateVariant === "object" && "neu-nameplate--object",
    nameplateVariant !== "object" && "neu-nameplate--catalog",
  ]
    .filter(Boolean)
    .join(" ");
}

function NeuNameplate({ name, subtitle, nameplateVariant = "catalog" }) {
  if (name == null || name === "") return null;

  if (nameplateVariant === "object") {
    return (
      <div className={buildNameplateClassName(nameplateVariant)}>
        <div className="neu-nameplate-subtitle">{subtitle ?? ""}</div>
        <div className="neu-nameplate-title">{name}</div>
      </div>
    );
  }

  return (
    <div className={buildNameplateClassName(nameplateVariant)}>
      <div className="neu-nameplate-title">{name}</div>
    </div>
  );
}

/** Shared image groove slot for tile, row thumb, and upload surfaces. */
export function NeuCardImageSlot({
  slot = "tile",
  name,
  subtitle,
  nameplateVariant = "catalog",
  imageUrl,
  image_url,
  add = false,
  logoShadow = false,
  fixedGroove = false,
  objectFit = "contain",
  alt,
  frameAction,
  imageShimmer = false,
}) {
  const config = IMAGE_SLOT[slot] ?? IMAGE_SLOT.tile;
  const resolvedImageUrl = imageUrl ?? image_url;
  const resolvedAlt = alt ?? name ?? "";

  return (
    <>
      <div className={config.wrapClass}>
        <GroovedImage
          imageUrl={resolvedImageUrl}
          alt={resolvedAlt}
          wellClassName={config.wellClass(logoShadow)}
          coverMode={objectFit === "cover"}
          fixedGroove={fixedGroove || add}
          wellInset={config.wellInset}
          groovePad={config.groovePad}
          placeholderIcon={add ? PlusOutlined : undefined}
          placeholderSize={config.placeholderSize}
          frameAction={frameAction}
          shimmer={imageShimmer}
        />
      </div>
      {config.showNameplate ? (
        <NeuNameplate
          name={name}
          subtitle={subtitle}
          nameplateVariant={nameplateVariant}
        />
      ) : null}
    </>
  );
}

function buildImageSlotProps({
  variant,
  name,
  subtitle,
  nameplateVariant,
  imageUrl,
  add,
  logoShadow,
  fixedGroove,
  objectFit,
  alt,
  frameAction,
  imageShimmer,
}) {
  return {
    slot: resolveImageSlot(variant),
    name,
    subtitle,
    nameplateVariant,
    imageUrl,
    add,
    logoShadow,
    fixedGroove,
    objectFit,
    alt: alt ?? name,
    frameAction,
    imageShimmer,
  };
}

/**
 * Neumorphic card — tile (grid), row (related model), or upload trigger.
 */
function NeuCard({
  variant = "tile",
  hoverable = true,
  className = "",
  name,
  subtitle,
  nameplateVariant = "catalog",
  imageUrl,
  image_url,
  add = false,
  logoShadow = false,
  fixedGroove = false,
  objectFit = "contain",
  meta,
  cover,
  frameAction,
  imageShimmer = false,
  children,
  onClick,
  disabled,
  ...props
}) {
  const resolvedImageUrl = imageUrl ?? image_url;
  const cardClassName = buildNeuCardClassName({
    variant,
    className: [className, !hoverable && "neu-card--static"].filter(Boolean).join(" "),
  });
  const imageSlotProps = buildImageSlotProps({
    variant,
    name,
    subtitle,
    nameplateVariant,
    imageUrl: resolvedImageUrl,
    add,
    logoShadow,
    fixedGroove,
    objectFit,
    frameAction,
    imageShimmer,
  });

  if (variant === "upload") {
    return (
      <div className={cardClassName} {...props}>
        <div className="neu-card-cover">
          {cover ?? <NeuCardImageSlot {...imageSlotProps} />}
          {children}
        </div>
      </div>
    );
  }

  if (variant === "row") {
    return (
      <button
        type="button"
        className={cardClassName}
        onClick={onClick}
        disabled={disabled}
        {...props}
      >
        {children ?? (
          <>
            {cover ?? <NeuCardImageSlot {...imageSlotProps} />}
            <div className="neu-card-row-body">
              <div className="neu-card-row-name">{name}</div>
              {meta ? <div className="neu-card-row-meta">{meta}</div> : null}
            </div>
          </>
        )}
      </button>
    );
  }

  const tileCover = cover ?? <NeuCardImageSlot {...imageSlotProps} />;
  const TileTag = onClick ? "button" : "div";
  const tileProps = onClick
    ? { type: "button", onClick, disabled }
    : {};

  return (
    <TileTag className={cardClassName} {...tileProps} {...props}>
      {tileCover}
    </TileTag>
  );
}

export default memo(NeuCard);
