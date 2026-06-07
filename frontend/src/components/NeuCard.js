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
  };
}

/**
 * Neumorphic card — tile (grid), row (related model), or upload trigger.
 */
export default function NeuCard({
  variant = "tile",
  hoverable = true,
  className = "",
  styles,
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
    subtitle,
    nameplateVariant,
    imageUrl: resolvedImageUrl,
    add,
    logoShadow,
    fixedGroove,
    objectFit,
    frameAction,
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

  return (
    <Card
      hoverable={hoverable}
      className={cardClassName}
      styles={{
        ...styles,
        body: { ...DEFAULT_BODY_STYLE, ...styles?.body },
      }}
      cover={tileCover}
      onClick={onClick}
      {...props}
    />
  );
}
