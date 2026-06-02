import { useEffect, useState } from "react";
import ImageUploadField from "./ImageUploadField";
import { uploadBrandLogo } from "../utils";

/**
 * Brand logo picker: uploads to MinIO at brands/{slug}/logo.* when brandId is set;
 * otherwise keeps the file until the parent uploads after create.
 */
export default function BrandLogoUploadField({ brandId, value, onChange, onPendingFile }) {
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const displayValue = previewUrl || value;

  return (
    <ImageUploadField
      value={displayValue}
      onChange={(url) => {
        if (previewUrl) {
          URL.revokeObjectURL(previewUrl);
          setPreviewUrl(null);
        }
        onChange(url);
      }}
      uploadFn={
        brandId
          ? async (file) => {
              const brand = await uploadBrandLogo(brandId, file);
              return brand.image_url ?? brand.imageUrl;
            }
          : async (file) => {
              if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
              }
              const objectUrl = URL.createObjectURL(file);
              setPreviewUrl(objectUrl);
              onPendingFile?.(file);
              return objectUrl;
            }
      }
    />
  );
}
