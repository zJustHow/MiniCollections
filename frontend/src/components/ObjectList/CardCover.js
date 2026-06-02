import React from "react";
import { PictureOutlined } from "@ant-design/icons";

const CardCover = ({
  image_url,
  name,
  objectFit = "cover",
  namePlacement = "overlay",
}) => (
  <div
    style={{
      position: "relative",
      paddingTop: "75%",
      overflow: "hidden",
      borderRadius: namePlacement === "none" ? "0 0 24px 24px" : "32px 32px 0 0",
    }}
  >
    {image_url ? (
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
          objectFit,
          ...(objectFit === "contain" && {
            padding: "12%",
            boxSizing: "border-box",
          }),
        }}
      />
    ) : (
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <PictureOutlined style={{ fontSize: 36, color: "var(--neu-text-2)" }} />
      </div>
    )}
    {namePlacement === "overlay" && name != null && (
      <div className="neu-nameplate">{name}</div>
    )}
  </div>
);

export default CardCover;
