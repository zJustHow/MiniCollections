import { App, Upload } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import { useEffect, useId, useRef, useState } from "react";
import { discardUploadedImage, uploadImage } from "../utils";
import { useLocale } from "../LocaleContext";
import NeuCard from "./NeuCard";
import ConfirmDeleteButton from "./ConfirmDeleteButton";

export default function ImageUploadField({
  value,
  onChange,
  onRemove,
  uploadFn,
  logoShadow = false,
  uploadSessionRef,
  id: inputIdProp,
}) {
  const { message } = App.useApp();
  const { t } = useLocale();
  const generatedInputId = useId();
  const uploadInputId = inputIdProp ?? `image-upload${generatedInputId.replace(/:/g, "")}`;
  const [uploading, setUploading] = useState(false);
  const sessionUploadsRef = useRef(new Set());

  useEffect(() => {
    if (!uploadSessionRef) return undefined;
    uploadSessionRef.current = {
      discardAll: async () => {
        const urls = [...sessionUploadsRef.current];
        sessionUploadsRef.current.clear();
        await Promise.all(urls.map((url) => discardUploadedImage(url).catch(() => {})));
      },
      commitAll: () => {
        sessionUploadsRef.current.clear();
      },
    };
    return () => {
      uploadSessionRef.current = null;
    };
  }, [uploadSessionRef]);

  const discardSessionUrl = async (url) => {
    if (!url || !sessionUploadsRef.current.has(url)) return;
    sessionUploadsRef.current.delete(url);
    try {
      await discardUploadedImage(url);
    } catch {
      // orphan cleanup is best-effort
    }
  };

  const handleRemove = async () => {
    await discardSessionUrl(value);
    onChange?.(null);
    onRemove?.();
  };

  return (
    <Upload
      id={uploadInputId}
      name="image"
      listType="picture-card"
      rootClassName="neu-image-upload"
      showUploadList={false}
      accept="image/*"
      beforeUpload={async (file) => {
        setUploading(true);
        try {
          const previousSessionUrl =
            value && sessionUploadsRef.current.has(value) ? value : null;
          const url = uploadFn ? await uploadFn(file) : await uploadImage(file);
          const resolved =
            typeof url === "string" ? url : url?.image_url ?? url?.imageUrl;
          if (previousSessionUrl && previousSessionUrl !== resolved) {
            await discardSessionUrl(previousSessionUrl);
          }
          if (resolved) {
            sessionUploadsRef.current.add(resolved);
          }
          onChange(resolved);
        } catch (e) {
          message.error(e?.message || t("uploadFailed"));
        } finally {
          setUploading(false);
        }
        return false;
      }}
    >
      <NeuCard
        variant="upload"
        imageUrl={value}
        logoShadow={logoShadow}
        fixedGroove={logoShadow}
        frameAction={
          value && !uploading ? (
            <ConfirmDeleteButton variant="upload" onConfirm={handleRemove} />
          ) : null
        }
      >
        {uploading && (
          <div className="neu-image-upload-loading" aria-hidden="true">
            <LoadingOutlined />
          </div>
        )}
      </NeuCard>
    </Upload>
  );
}
