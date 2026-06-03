import React from "react";
import { PlusOutlined } from "@ant-design/icons";
import GroovedImage from "../GroovedImage";

export default function AddCardCover({ label }) {
  return (
    <>
      <div className="neu-card-cover">
        <GroovedImage
          fixedGroove
          placeholderIcon={PlusOutlined}
          placeholderSize={36}
        />
      </div>
      <div className="neu-nameplate">{label}</div>
    </>
  );
}
