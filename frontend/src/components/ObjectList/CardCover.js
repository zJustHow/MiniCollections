import React from "react";

const CardCover = ({ image_url, name }) => (
  <div
    style={{
      position: "relative",
      paddingTop: "75%",
      overflow: "hidden",
      borderRadius: "32px 32px 0 0",
    }}
  >
    <img
      src={image_url}
      alt={name}
      loading="lazy"
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        objectFit: "cover",
      }}
    />
    <div className="neu-nameplate">{name}</div>
  </div>
);

export default CardCover;
