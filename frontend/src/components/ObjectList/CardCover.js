import React from "react";
import { PictureOutlined } from "@ant-design/icons";

const CardCover = ({ image_url, name }) => (
  <div
    style={{
      position: "relative",
      paddingTop: "75%",
      overflow: "hidden",
      borderRadius: "32px 32px 0 0",
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
          objectFit: "cover",
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
    <div className="neu-nameplate">{name}</div>
  </div>
);

export default CardCover;
