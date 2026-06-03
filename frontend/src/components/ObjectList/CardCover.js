import React from "react";
import { PictureOutlined } from "@ant-design/icons";

const CardCover = ({ image_url, name, objectFit = "cover" }) => (
  <>
    <div className="neu-card-cover">
      <div
        className={`neu-card-image-well${
          objectFit === "contain" ? " neu-card-image-well--contain" : ""
        }`}
      >
        {image_url ? (
          <div className="neu-card-image-frame">
            <img src={image_url} alt={name} loading="lazy" />
          </div>
        ) : (
          <div className="neu-card-image-frame">
            <div className="neu-card-image-placeholder">
              <PictureOutlined style={{ fontSize: 36, color: "var(--neu-text-2)" }} />
            </div>
          </div>
        )}
      </div>
    </div>
    <div className="neu-nameplate">{name}</div>
  </>
);

export default CardCover;
