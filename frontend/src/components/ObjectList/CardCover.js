import React from "react";
import GroovedImage from "../GroovedImage";

const CardCover = ({
  image_url,
  name,
  objectFit = "contain",
  fixedGroove = false,
  logoShadow = false,
}) => (
  <>
    <div className="neu-card-cover">
      <GroovedImage
        imageUrl={image_url}
        alt={name}
        wellClassName={
          logoShadow
            ? "neu-card-image-well neu-card-image-well--logo"
            : "neu-card-image-well"
        }
        coverMode={objectFit === "cover"}
        fixedGroove={fixedGroove}
        placeholderSize={36}
      />
    </div>
    <div className="neu-nameplate">{name}</div>
  </>
);

export default CardCover;
