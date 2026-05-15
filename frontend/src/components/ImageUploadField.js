import { App, Upload } from "antd";
import { DeleteOutlined, LoadingOutlined, PictureOutlined } from "@ant-design/icons";
import { useState } from "react";
import { uploadImage } from "../utils";
import { useLocale } from "../LocaleContext";

export default function ImageUploadField({ value, onChange, onRemove }) {
  const { message } = App.useApp();
  const { t } = useLocale();
  const [uploading, setUploading] = useState(false);

  return (
    <Upload
      listType="picture-card"
      showUploadList={false}
      accept="image/*"
      beforeUpload={async (file) => {
        setUploading(true);
        try {
          const url = await uploadImage(file);
          onChange(url);
        } catch (e) {
          message.error(e.message || t("uploadFailed"));
        } finally {
          setUploading(false);
        }
        return false;
      }}
    >
      <div style={{ width: 120 }}>
        {uploading ? (
          <LoadingOutlined style={{ fontSize: 32, color: "var(--neu-text-2)", marginBottom: 8, display: "block" }} />
        ) : value ? (
          <div style={{ position: "relative", marginBottom: 8 }}>
            <img
              src={value}
              alt="preview"
              style={{ width: "100%", maxHeight: 120, objectFit: "contain", display: "block" }}
            />
            {onRemove && (
              <DeleteOutlined
                onClick={(e) => { e.stopPropagation(); onRemove(); }}
                style={{
                  position: "absolute", top: 4, right: 4,
                  background: "rgba(0,0,0,0.45)", color: "#fff",
                  borderRadius: "50%", padding: 4, fontSize: 12, cursor: "pointer",
                }}
              />
            )}
          </div>
        ) : (
          <PictureOutlined style={{ fontSize: 32, color: "var(--neu-text-2)", marginBottom: 8, display: "block" }} />
        )}
        <div style={{ fontSize: 12 }}>{t("selectImage")}</div>
      </div>
    </Upload>
  );
}
