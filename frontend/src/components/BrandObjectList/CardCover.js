import React from "react";

const CardCover = ({ image_url, name }) => (
  <div style={{ position: "relative", paddingTop: "75%", overflow: "hidden" }}>
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
    <div
      style={{
        position: "absolute",
        left: 0,
        bottom: 0,
        width: "100%",
        padding: "8px 12px",
        background:
          "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.7) 100%)",
        color: "#fff",
        fontWeight: 600,
      }}
    >
      {name}
    </div>
  </div>
);

export default CardCover;
