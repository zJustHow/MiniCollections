import { PlusOutlined } from "@ant-design/icons";
import { Card } from "antd";
import GroovedImage from "./GroovedImage";

const DEFAULT_BODY_STYLE = { padding: 0 };

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

/** Shared image groove slot for tile, row thumb, and upload surfaces. */
export function NeuCardImageSlot({
  slot = "tile",
  name,
  imageUrl,
  image_url,
  add = false,
  logoShadow = false,
  fixedGroove = false,
  objectFit = "contain",
  alt,
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
        />
      </div>
      {config.showNameplate && name != null && name !== "" ? (
        <div className="neu-nameplate">{name}</div>
      ) : null}
    </>
  );
}

function buildImageSlotProps({
  variant,
  name,
  imageUrl,
  add,
  logoShadow,
  fixedGroove,
  objectFit,
  alt,
}) {
  return {
    slot: resolveImageSlot(variant),
    name,
    imageUrl,
    add,
    logoShadow,
    fixedGroove,
    objectFit,
    alt: alt ?? name,
  };
}

/**
 * Neumorphic card — tile (grid), row (related model), or upload trigger.
 */
export default function NeuCard({
  variant = "tile",
  hoverable = true,
  className = "",
  bodyStyle,
  name,
  imageUrl,
  image_url,
  add = false,
  logoShadow = false,
  fixedGroove = false,
  objectFit = "contain",
  meta,
  cover,
  children,
  onClick,
  disabled,
  ...props
}) {
  const resolvedImageUrl = imageUrl ?? image_url;
  const cardClassName = buildNeuCardClassName({ variant, className });
  const imageSlotProps = buildImageSlotProps({
    variant,
    name,
    imageUrl: resolvedImageUrl,
    add,
    logoShadow,
    fixedGroove,
    objectFit,
  });

  if (variant === "upload") {
    return (
      <div className={cardClassName} {...props}>
        {cover ?? <NeuCardImageSlot {...imageSlotProps} />}
        {children}
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

  return (
    <Card
      hoverable={hoverable}
      className={cardClassName}
      bodyStyle={bodyStyle ?? DEFAULT_BODY_STYLE}
      cover={tileCover}
      onClick={onClick}
      {...props}
    />
  );
}
