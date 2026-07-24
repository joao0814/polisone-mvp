import { useEffect, useState } from "react";
import { apiRequestBlob } from "../../../services/api";

function ProtectedStorageImage({ storagePath, alt, className, fallback = null }) {
  const [src, setSrc] = useState("");
  const localDataSrc = storagePath?.startsWith("data:") ? storagePath : "";

  useEffect(() => {
    let isActive = true;
    let objectUrl = "";

    if (!storagePath) {
      return undefined;
    }

    if (storagePath.startsWith("data:")) {
      return () => {
        isActive = false;
      };
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

  const resolvedSrc = localDataSrc || src;
  if (!storagePath || !resolvedSrc) return fallback;

  return <img src={resolvedSrc} alt={alt} className={className} />;
}

function toStorageRoute(storagePath) {
  return storagePath
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
}

export default ProtectedStorageImage;
