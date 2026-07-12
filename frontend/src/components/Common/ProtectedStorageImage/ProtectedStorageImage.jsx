import { useEffect, useState } from "react";
import { apiRequestBlob } from "../../../services/api";

function ProtectedStorageImage({ storagePath, alt, className, fallback = null }) {
  const [src, setSrc] = useState("");

  useEffect(() => {
    let isActive = true;
    let objectUrl = "";

    if (!storagePath) {
      return undefined;
    }

    apiRequestBlob(`/storage/${toStorageRoute(storagePath)}`)
      .then((blob) => {
        if (!isActive) return;
        objectUrl = URL.createObjectURL(blob);
        setSrc(objectUrl);
      })
      .catch(() => {
        if (isActive) setSrc("");
      });

    return () => {
      isActive = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [storagePath]);

  if (!storagePath || !src) return fallback;

  return <img src={src} alt={alt} className={className} />;
}

function toStorageRoute(storagePath) {
  return storagePath
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
}

export default ProtectedStorageImage;
